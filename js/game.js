// 플레이 화면: 하이웨이 렌더링, 입력/판정, HUD
import { $, clamp, fmtNum, fmtTime } from './util.js';
import { coverSVG } from './cover.js';
import { buildThemes, setTheme, resetTheme, setMotion } from './themes.js';

export const LINE = 690;       // 판정선 y (하이웨이 로컬 좌표)
const HW_H = 700;
const LANE_W = 105;
const NOTE_H = 20;
const KEYS = { KeyD: 0, KeyF: 1, KeyJ: 2, KeyK: 3 };
const KEY_LABEL = ['D', 'F', 'J', 'K'];
const LANE_CLS = ['c', 'p', 'p', 'c'];

export const WIN = { perfect: 0.035, great: 0.06, good: 0.08 };
const PTS = { perfect: 1000, great: 700, good: 400 };
const ACCW = { perfect: 100, great: 80, good: 40, miss: 0 };
const OD_DUR = 9;
const OD_MULT = 1.5;
const LEAD_IN = 3;
const SPEC_N = 28;
const BOMB_PEN = 500;     // 폭탄 감점
const MOTION_BUDGET = [0, 40, 80, Infinity]; // 장면당 움직이는 요소 수 상한 (단계 0~3)
const PERF_IDS = ['hScore', 'hAcc', 'hRank', 'cP', 'cG', 'cO', 'cM', 'combo', 'comboLbl', 'syncBar', 'syncPct', 'odRing', 'odPct', 'odNote', 'tCur', 'progFill', 'progMark', 'secName', 'judgeText', 'judgeSub', 'gYou', 'gDelta', 'gGhost', 'gNote', 'gYouBar', 'gGhostBar', 'devTicks', 'devAvg', 'notes', 'odGlow', 'screen-play', 'themes'];

const DEFAULT_PALETTE = ['sky', 'sunset', 'cyber']; // 조용함 / 중간 / 강함
const MAX_PIECE = 45; // 한 구간이 이보다 길면 쪼개서 인접 테마와 번갈아 사용 (초)

// 분석된 구간 + 곡별 팔레트(또는 수동 지정 themes) -> 시간순 조각 목록
export function buildTimeline(sections, song, dur) {
  const pal = song.palette || DEFAULT_PALETTE;
  // 수동 구간: [[시작초, '이름', 레벨(0~2)], ...] 이 있으면 자동 분석 대신 사용
  if (song.sections) {
    sections = song.sections.map(([t0, name, level], i, a) => ({ t0, t1: i + 1 < a.length ? a[i + 1][0] : dur, name, level }));
  }
  const out = [];
  for (const s of sections) {
    const n = Math.max(1, Math.ceil((s.t1 - s.t0) / MAX_PIECE));
    const len = (s.t1 - s.t0) / n;
    for (let k = 0; k < n; k++) {
      const lv = k % 2 === 0 ? s.level : s.level < 2 ? s.level + 1 : s.level - 1;
      out.push({ t0: s.t0 + k * len, t1: s.t0 + (k + 1) * len, name: s.name, theme: pal[lv], first: k === 0 });
    }
  }
  if (song.themes) { // 수동 지정: [[초, 테마id], ...] 가 있으면 우선
    for (const p of out) {
      let id = null;
      for (const [t, th] of song.themes) if (p.t0 >= t - 0.01) id = th;
      if (id) p.theme = id;
    }
  }
  return out;
}

const JUDGE = {
  perfect: { txt: 'PERFECT', col: '#fff', glow: 'rgba(0,240,255,.6)' },
  great: { txt: 'GREAT', col: '#fff', glow: 'rgba(233,247,255,.5)' },
  good: { txt: 'GOOD', col: '#d9d4ff', glow: 'rgba(168,157,255,.8)' },
  miss: { txt: 'MISS', col: '#ff2a6d', glow: 'rgba(255,42,109,.9)' },
};

export function rankOf(acc, failed) {
  if (failed) return 'F';
  if (acc >= 99) return 'SS';
  if (acc >= 95) return 'S';
  if (acc >= 90) return 'A';
  if (acc >= 80) return 'B';
  if (acc >= 70) return 'C';
  return 'D';
}
export function rankColor(r) {
  return r === 'SS' || r === 'S' ? '#00f0ff' : r === 'A' || r === 'B' ? '#a89dff' : '#ff2a6d';
}

export class Game {
  constructor(audio, store, cb) {
    this.audio = audio;
    this.store = store;
    this.cb = cb; // { onFinish(result), onQuit(), onRetry() }
    this.state = 'idle'; // idle | lead | play | pause | cd | done
    this.cache = {};
    this.pool = { tap: [], ln: [] };
    this.specVals = new Array(SPEC_N).fill(0);
    this.down = [false, false, false, false];
    this.build();
    this.frame = this.frame.bind(this);
  }

  // ---------- 고정 DOM 구성 ----------
  build() {
    const pads = $('#pads'), beams = $('#beams'), bursts = $('#bursts');
    this.padEls = []; this.beamEls = []; this.burstEls = [];
    for (let l = 0; l < 4; l++) {
      const p = document.createElement('div');
      p.className = 'pad'; p.style.left = l * LANE_W + 4 + 'px'; p.textContent = KEY_LABEL[l];
      pads.appendChild(p); this.padEls.push(p);
      const b = document.createElement('div');
      b.className = 'beam'; b.style.left = l * LANE_W + 4 + 'px'; beams.appendChild(b); this.beamEls.push(b);
      const u = document.createElement('div');
      u.className = 'burst'; u.style.left = l * LANE_W + 4 + 48.5 - 80 + 'px'; bursts.appendChild(u); this.burstEls.push(u);
    }
    this.bindPointers();
    this.E = {};
    PERF_IDS.forEach((id) => { this.E[id] = document.getElementById(id); });
    this.dtPool = []; this.dtIdx = 0;
    const spec = $('#spec');
    let h = '';
    for (let i = 0; i < SPEC_N; i++) h += `<rect x="${(i * 10.7).toFixed(1)}" y="94" width="7" height="6" fill="#00f0ff"/>`;
    spec.innerHTML = h;
    this.specEls = [...spec.querySelectorAll('rect')];
    $('#btnPause').addEventListener('click', () => this.togglePause());
    $('#odPanel').addEventListener('click', () => this.activateOD());
    $('#pauseBtns').addEventListener('click', (e) => {
      const a = e.target.closest('button')?.dataset.a;
      if (a === 'resume') this.togglePause();
      else if (a === 'retry') this.cb.onRetry();
      else if (a === 'quit') this.cb.onQuit();
    });
  }

  // ---------- 터치/마우스 입력: 화면 어디를 눌러도 x 좌표로 레인 판정, 멀티터치 지원 ----------
  stageX(clientX) {
    const r = this._rect || (this._rect = $('#stage').getBoundingClientRect());
    return ((clientX - r.left) / r.width) * 1280;
  }
  laneAtX(x) {
    if (x < 400 || x > 880) return -1;
    return clamp(Math.floor((x - 430) / LANE_W), 0, 3);
  }
  bindPointers() {
    const scr = $('#screen-play');
    this.ptr = new Map();
    addEventListener('resize', () => { this._rect = null; });
    addEventListener('orientationchange', () => { this._rect = null; });
    scr.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button,.ov,#odPanel')) return;
      const x = this.stageX(e.clientX), lane = this.laneAtX(x);
      if (lane < 0) return;
      e.preventDefault();
      this.ptr.set(e.pointerId, { lane, cur: lane, x0: x, t0: this.now(e.timeStamp), flicked: false, slide: null });
      this.press(lane, e.timeStamp, e.pointerId);
    });
    scr.addEventListener('pointermove', (e) => {
      const st = this.ptr.get(e.pointerId);
      if (!st) return;
      const x = this.stageX(e.clientX), l = this.laneAtX(x);
      if (l >= 0) st.cur = l;
      // FLICK: 누른 지점에서 가로로 빠르게 쓸면 방향 판정
      if (!st.flicked && Math.abs(x - st.x0) >= 26) {
        st.flicked = true;
        if (this.state === 'play' && !this.auto) this.tryFlick(x > st.x0 ? 1 : -1, st.t0, st.lane);
      }
      // SLIDE: 리본 경로(시작~끝 레인 사이)를 벗어나면 끝 노드는 MISS
      const sl = st.slide;
      if (sl && sl.endNode.s === 0 && !sl.broken && l >= 0) {
        const lo = Math.min(sl.lane, sl.lane2), hi = Math.max(sl.lane, sl.lane2);
        if (l < lo || l > hi) sl.broken = true;
      }
    });
    const up = (e) => {
      const st = this.ptr.get(e.pointerId);
      if (!st) return;
      this.ptr.delete(e.pointerId);
      const sl = st.slide;
      if (sl && sl.endNode.s === 0 && this.now(e.timeStamp) < sl.t2 - WIN.good) sl.broken = true;   // 끝 노드 전에 손을 뗌
      this.release(st.lane, e.timeStamp);
    };
    scr.addEventListener('pointerup', up);
    scr.addEventListener('pointercancel', up);
    scr.addEventListener('lostpointercapture', up);
    addEventListener('blur', () => this.releaseAll());
  }
  releaseAll() {
    if (this.ptr) this.ptr.clear();
    for (let l = 0; l < 4; l++) if (this.down[l]) this.release(l, performance.now());
  }

  // ---------- 시작 ----------
  start({ song, entry, diffKey, diffName, level, chart, stage = 0 }) {
    this.stop(true);
    const st = this.store.data.settings;
    this.song = song; this.entry = entry; this.diffKey = diffKey; this.chart = chart; this.stage = stage;
    this.auto = !!st.auto;
    this.pxs = st.speed * 100;
    this.userOffset = (st.offset || 0) / 1000;
    this.hitsound = st.hitsound;
    this.duration = entry.duration;
    this.notes = chart.notes.map((n) => ({
      ...n, s: 0, el: null, j: null,
      kind: n.type === 'flick' ? 'flick' : n.type === 'bomb' ? 'bomb' : n.type === 'slide' ? 'slide' : n.len > 0 ? 'ln' : 'tap',
    }));
    this.total = chart.total;   // 판정 대상 수 (슬라이드는 2, 폭탄 제외)
    this.notes.forEach((n) => { n.fin = n.kind === 'slide' ? n.t2 : n.end || n.t; });
    this.lastEnd = this.notes.reduce((m, n) => Math.max(m, n.fin), 0);
    this.lanes = [[], [], [], []];
    this.flicks = []; this.bombs = []; this.ends = [];
    this.notes.forEach((n) => {
      if (n.kind === 'flick') this.flicks.push(n);
      else if (n.kind === 'bomb') this.bombs.push(n);
      else {
        this.lanes[n.lane].push(n);
        if (n.kind === 'slide') { n.endNode = { kind: 'send', parent: n, t: n.t2, lane: n.lane2, s: 0 }; this.ends.push(n.endNode); }
      }
    });
    this.ends.sort((a, b) => a.t - b.t);
    this.fpos = 0; this.bpos = 0; this.epos = 0; this.bombHits = 0; this._rect = null;
    this.qpos = [0, 0, 0, 0];
    this.down = [false, false, false, false];
    this.ptr && this.ptr.clear();
    this.holding = [null, null, null, null];
    this.first = 0;
    this.counts = { perfect: 0, great: 0, good: 0, miss: 0 };
    this.combo = 0; this.maxCombo = 0; this.score = 0; this.sync = 100;
    this.od = 0; this.odUntil = 0; this.odOn = false;
    this.devs = []; this.accHist = []; this.missIdx = [];
    this.judged = 0;
    this.failed = false;
    this.rec = new Array(101).fill(0);
    const bestKey = song.id + ':' + diffKey + ':' + stage;
    const best = this.store.data.bests[bestKey];
    this.ghost = best && best.ghost ? best.ghost : null;
    this.cache = {};
    this.recIdx = 0;

    // HUD 정적 값
    $('#hCover').innerHTML = coverSVG(song, { size: 64, border: 2 });
    $('#hTitle').textContent = song.short || song.title;
    $('#hArtist').textContent = song.artist;
    $('#hDiff').textContent = diffName + ' ' + level + (stage ? ' ▲' + stage : '');
    $('#hBpm').textContent = Math.round(chart.bpm) + ' BPM';
    $('#specNote').textContent = Math.round(chart.bpm) + ' BPM · 4/4';
    $('#tTot').textContent = fmtTime(this.duration);
    $('#devTicks').innerHTML = '';
    $('#devBand').style.left = 145 - WIN.perfect * 1000 * 1.8 + 'px';
    $('#devBand').style.width = WIN.perfect * 2000 * 1.8 + 'px';
    this.timeline = buildTimeline(entry.sections || [{ t0: 0, t1: this.duration, level: 1, name: 'TRACK' }], song, this.duration);
    buildThemes($('#themes'), [...new Set(this.timeline.map((p) => p.theme))]);
    const mo = st.motion || 'auto';
    this.motionLevel = mo === 'full' ? 3 : mo === 'low' ? 1 : mo === 'off' ? 0 : (st.motionLevel ?? (document.body.classList.contains('touch') ? 0 : 2));
    setMotion(this.E.themes, MOTION_BUDGET[this.motionLevel]);
    this._acc = 0; this._n = 0; this._lf = 0; this.fcount = 0;
    this.progW = this.E.progFill.parentElement.offsetWidth || 260;
    this.tlIdx = 0;
    resetTheme();
    setTheme(this.timeline[0].theme, true);
    $('#progTicks').innerHTML = this.timeline.filter((p, i) => i > 0 && p.first).map((p) => `<i style="left:${(p.t0 / this.duration) * 100}%"></i>`).join('');
    $('#judgeText').style.opacity = 0; $('#judgeSub').style.opacity = 0;
    $('#screen-play').classList.remove('od-on');
    $('#odGlow').style.opacity = 0;
    $('#pauseOv').style.display = 'none'; $('#cdOv').style.display = 'none';
    // 비트 라인 (박자 격자)
    this.beatLen = 60 / chart.bpm;
    const P = this.beatLen * this.pxs;
    const bl = $('#beatlines');
    bl.style.background = `linear-gradient(to bottom,rgba(0,240,255,.34) 0,rgba(0,240,255,.34) 1px,transparent 1px) 0 0/100% ${P * 4}px repeat-y, linear-gradient(to bottom,rgba(0,240,255,.14) 0,rgba(0,240,255,.14) 1px,transparent 1px) 0 0/100% ${P}px repeat-y`;
    bl.style.height = HW_H + P * 4 + 4 + 'px'; bl.style.top = -P * 4 + 'px'; bl.style.willChange = 'transform';
    this.bl = bl; this.beatPx = P;

    this.padEls.forEach((p) => p.classList.remove('on'));
    this.beamEls.forEach((p) => p.classList.remove('on'));

    this.audio.play(entry.buffer, LEAD_IN);
    this.audio.setVolume(this.store.data.settings.volume);
    this.state = 'lead';
    this.updateHUD(true);
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.frame);
  }

  stop(silent) {
    cancelAnimationFrame(this.raf);
    clearInterval(this.cdTimer);
    if (this.state !== 'idle' && this.audio.ctx) {
      this.audio.stopSong();
      if (this.audio.ctx.state === 'suspended') this.audio.ctx.resume();
    }
    this.clearNotes();
    this.state = 'idle';
  }
  clearNotes() {
    $('#notes').innerHTML = '';
    this.pool = { tap: [], ln: [] };
  }

  // 현재 노래 시간 (초). 사용자 오프셋 반영
  now(perf) { return this.audio.time(perf) + this.userOffset * -1; }

  // ---------- 입력 ----------
  onKeyDown(e) {
    if (e.code in KEYS) {
      if (e.repeat) return true;
      this.press(KEYS[e.code], e.timeStamp);
      return true;
    }
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
      if (!e.repeat && this.state === 'play' && !this.auto) this.tryFlick(e.code === 'ArrowLeft' ? -1 : 1, this.now(e.timeStamp), -1);
      return true;
    }
    if (e.code === 'Space') { this.activateOD(); return true; }
    if (e.code === 'Escape') { this.togglePause(); return true; }
    if (this.state === 'pause') {
      if (e.code === 'KeyR') { this.cb.onRetry(); return true; }
      if (e.code === 'KeyQ') { this.cb.onQuit(); return true; }
    }
    return false;
  }
  onKeyUp(e) {
    if (e.code in KEYS) { this.release(KEYS[e.code], e.timeStamp); return true; }
    return false;
  }

  press(lane, perf, pid) {
    if (this.state !== 'play' && this.state !== 'lead') return;
    if (this.auto) return;
    this.setPad(lane, true);
    const t = this.now(perf);
    // BOMB: 판정 시각 근처에서 그 레인을 누르면 터진다
    for (let i = this.bpos; i < this.bombs.length; i++) {
      const b = this.bombs[i];
      if (b.t - t > 0.06) break;
      if (b.s === 0 && b.lane === lane && Math.abs(t - b.t) <= 0.06) this.hitBomb(b);
    }
    if (this.trySlideEndKey(lane, t)) return;     // 키보드로 치는 슬라이드의 끝 노드
    const n = this.tryHit(lane, t);
    if (n && n.kind === 'slide' && pid != null) { n.ptrId = pid; const st = this.ptr.get(pid); if (st) st.slide = n; }
  }
  release(lane, perf) {
    this.setPad(lane, false);
    if (this.state !== 'play') return;
    if (this.auto) return;
    this.tryRelease(lane, this.now(perf));
  }
  setPad(lane, on) {
    this.down[lane] = on;
    this.padEls[lane].classList.toggle('on', on);
    this.beamEls[lane].classList.toggle('on', on);
  }

  tryHit(lane, t) {
    const q = this.lanes[lane];
    const n = q[this.qpos[lane]];
    if (!n || n.s !== 0) return null;
    const dt = t - n.t;
    if (dt < -WIN.good) return null; // 너무 이른 입력은 무시
    const adt = Math.abs(dt);
    const j = adt <= WIN.perfect ? 'perfect' : adt <= WIN.great ? 'great' : 'good';
    n.j = j;
    if (n.kind === 'ln') {
      n.s = 1; this.holding[lane] = n;
      if (n.el) n.el.classList.add('hold');
    } else if (n.kind === 'slide') {
      n.s = 2; this.qpos[lane]++;               // 시작 노드 판정, 리본은 끝 노드까지 남는다
      if (n.el) n.el.classList.add('hit');
    } else {
      n.s = 2; this.qpos[lane]++;
      this.releaseEl(n);
    }
    this.register(j, dt * 1000, lane);
    return n;
  }

  // ---------- 특수 노트: FLICK / SLIDE / BOMB ----------
  tryFlick(dir, t, lane) {
    let best = null, bd = 9;
    for (let i = this.fpos; i < this.flicks.length; i++) {
      const f = this.flicks[i];
      if (f.t - t > WIN.good) break;
      if (f.s !== 0 || f.dir !== dir) continue;
      if (lane >= 0 && Math.abs(f.lane - lane) > 1) continue;
      const d = Math.abs(t - f.t);
      if (d <= WIN.good && d < bd) { best = f; bd = d; }
    }
    if (!best) return false;
    const dt = t - best.t, adt = Math.abs(dt);
    const j = adt <= WIN.perfect ? 'perfect' : adt <= WIN.great ? 'great' : 'good';
    best.s = 2; best.j = j;
    this.releaseEl(best);
    this.register(j, dt * 1000, best.lane);
    return true;
  }
  hitEnd(e, dt) {
    const adt = Math.abs(dt);
    const j = adt <= WIN.perfect ? 'perfect' : adt <= WIN.great ? 'great' : 'good';
    e.s = 2;
    this.releaseEl(e.parent);
    this.register(j, dt * 1000, e.lane);
  }
  trySlideEndKey(lane, t) {
    for (let i = this.epos; i < this.ends.length; i++) {
      const e = this.ends[i];
      if (e.t - t > WIN.good) break;
      if (e.s === 0 && e.lane === lane && e.parent.s === 2 && !e.parent.broken && e.parent.ptrId == null && Math.abs(t - e.t) <= WIN.good) { this.hitEnd(e, t - e.t); return true; }
    }
    return false;
  }
  hitBomb(b) {
    if (b.s !== 0) return;
    b.s = 1; this.bombHits++;
    this.combo = 0;
    this.score = Math.max(0, this.score - BOMB_PEN);
    this.sync = clamp(this.sync - 8, 0, 100);
    this.releaseEl(b);
    this.flash(b.lane, 1);
    const el = this.E.judgeText;
    el.textContent = 'BOMB'; el.style.color = '#ff9a3a';
    el.style.textShadow = '3px 0 rgba(255,42,109,.9),-3px 0 rgba(0,240,255,.9),0 0 22px rgba(255,122,26,.9)';
    el.style.opacity = 1; this.popJudge();
    this.E.judgeSub.textContent = `−${BOMB_PEN} · COMBO BREAK`; this.E.judgeSub.style.opacity = 1;
    this.judgeAt = performance.now();
    if (this.sync <= 0 && !this.failed && !this.auto) this.finish(true);
  }
  updateSpecial(t) {
    const g = WIN.good;
    // FLICK
    if (this.auto) {
      for (let i = this.fpos; i < this.flicks.length; i++) {
        const f = this.flicks[i];
        if (f.t - t > 0) break;
        if (f.s === 0) this.tryFlick(f.dir, f.t + (Math.random() - 0.5) * 0.024, -1);
      }
    }
    while (this.fpos < this.flicks.length) {
      const f = this.flicks[this.fpos];
      if (f.s !== 0) { this.fpos++; continue; }
      if (t - f.t > g) { f.s = 3; if (f.el) f.el.classList.add('dead'); this.register('miss', 0, f.lane); this.fpos++; continue; }
      break;
    }
    // SLIDE 끝 노드: 손가락(포인터)이 끝 레인에 있으면 끝 노드 시각에 판정
    for (let i = this.epos; i < this.ends.length; i++) {
      const e = this.ends[i];
      if (e.t - t > g) break;
      const p = e.parent;
      if (e.s !== 0 || p.s !== 2 || p.broken) continue;
      if (this.auto) { if (t >= e.t) this.hitEnd(e, (Math.random() - 0.5) * 0.024); continue; }
      if (p.ptrId != null) { const st = this.ptr.get(p.ptrId); if (st && st.cur === e.lane && t >= e.t - 0.01) this.hitEnd(e, t - e.t); }
    }
    while (this.epos < this.ends.length) {
      const e = this.ends[this.epos];
      if (e.s !== 0) { this.epos++; continue; }
      if (t - e.t > g) { e.s = 3; if (e.parent.el) e.parent.el.classList.add('dead'); this.register('miss', 0, e.lane); this.epos++; continue; }
      break;
    }
    // BOMB: 판정 시각 ±40ms 에 그 레인을 누르고(또는 누른 채) 있으면 터짐, 지나가면 회피 성공
    while (this.bpos < this.bombs.length) {
      const b = this.bombs[this.bpos];
      if (b.s !== 0) { this.bpos++; continue; }
      if (t - b.t > 0.06) { b.s = 4; this.bpos++; continue; }
      break;
    }
    for (let i = this.bpos; i < this.bombs.length; i++) {
      const b = this.bombs[i];
      if (b.t - t > 0.04) break;
      if (b.s === 0 && Math.abs(t - b.t) <= 0.04 && this.down[b.lane]) this.hitBomb(b);
    }
  }
  tryRelease(lane, t) {
    const n = this.holding[lane];
    if (!n) return;
    this.holding[lane] = null;
    if (t < n.end - WIN.good) { this.breakHold(n, lane); } else { this.finishHold(n, lane); }
  }
  finishHold(n, lane) {
    n.s = 2; this.qpos[lane]++; this.holding[lane] = null;
    this.releaseEl(n);
    this.flash(lane, 0.7);
  }
  breakHold(n, lane) {
    // 이미 올린 판정을 취소하고 MISS 로 전환
    const j = n.j;
    this.counts[j]--; this.counts.miss++;
    this.score = Math.max(0, this.score - PTS[j]);
    this.accHist[this.accHist.length - 1] = this.calcAcc(true);
    this.missIdx.push(this.accHist.length - 1);
    n.s = 4; this.qpos[lane]++; this.holding[lane] = null;
    this.combo = 0;
    this.sync = clamp(this.sync - 4, 0, 100);
    if (n.el) { n.el.classList.remove('hold'); n.el.classList.add('dead'); }
    this.showJudge('miss', null);
    if (this.sync <= 0 && !this.failed && !this.auto) this.finish(true);
  }

  // 판정 반영 (점수/콤보/게이지)
  register(j, devMs, lane) {
    this.counts[j]++;
    this.judged++;
    if (j === 'miss') {
      this.combo = 0;
      this.sync = clamp(this.sync - 6, 0, 100);
      this.missIdx.push(this.accHist.length);
    } else {
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      this.score += PTS[j] * (this.odOn ? OD_MULT : 1);
      this.sync = clamp(this.sync + (j === 'perfect' ? 0.5 : j === 'great' ? 0.25 : -0.4), 0, 100);
      if (!this.odOn) this.od = Math.min(100, this.od + (j === 'perfect' ? 1.5 : j === 'great' ? 1.0 : 0.5));
      this.devs.push(devMs);
      this.addDevTick(devMs, j === 'good');
      if (this.hitsound) this.audio.tick(0.5);
      if (lane !== undefined) this.flash(lane, j === 'perfect' ? 1 : 0.75);
      this.E.combo.animate([{ transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 120 });
    }
    this.accHist.push(this.calcAcc(true));
    this.showJudge(j, devMs);
    if (this.sync <= 0 && !this.failed && !this.auto) this.finish(true);
  }

  calcAcc(live) {
    const c = this.counts;
    const base = live ? this.judged : this.total;
    if (!base) return 100;
    return ((c.perfect * ACCW.perfect + c.great * ACCW.great + c.good * ACCW.good) / (base * 100)) * 100;
  }

  popJudge() {
    this.E.judgeText.animate([{ transform: 'skewX(-10deg) scale(1.35)' }, { transform: 'skewX(-10deg) scale(1)' }], { duration: 280, easing: 'ease-out' });
  }
  showJudge(j, devMs) {
    const J = JUDGE[j], el = this.E.judgeText, sub = this.E.judgeSub;
    el.textContent = J.txt;
    el.style.color = J.col;
    el.style.textShadow = `3px 0 rgba(255,42,109,.9),-3px 0 rgba(0,240,255,.9),0 0 22px ${J.glow}`;
    el.style.opacity = 1;
    this.popJudge();
    if (j === 'miss') sub.textContent = '';
    else {
      const m = Math.round(devMs);
      const pts = PTS[j] * (this.odOn ? OD_MULT : 1);
      sub.textContent = `${m < 0 ? '−' : '+'}${Math.abs(m)} ms · +${fmtNum(pts)}`;
    }
    sub.style.opacity = 1;
    this.judgeAt = performance.now();
  }

  // 타이밍 편차 눈금: 요소를 24개 돌려 쓰고 WAAPI 로 페이드 (히트마다 DOM 생성/삭제하지 않음)
  addDevTick(ms, bad) {
    let d = this.dtPool[this.dtIdx];
    if (!d) { d = document.createElement('div'); this.E.devTicks.appendChild(d); this.dtPool[this.dtIdx] = d; }
    this.dtIdx = (this.dtIdx + 1) % 24;
    d.className = 'devtick' + (bad ? ' bad' : '');
    d.style.left = clamp(145 + ms * 1.8, 0, 288) + 'px';
    d.getAnimations().forEach((a) => a.cancel());
    d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 3000, fill: 'forwards' });
    const n = this.devs.length, k = Math.min(16, n);
    let sum = 0;
    for (let i = n - k; i < n; i++) sum += this.devs[i];
    this.E.devAvg.style.left = clamp(144 + (sum / k) * 1.8, 0, 288) + 'px';
  }

  flash(lane, a) {
    const u = this.burstEls[lane];
    u.animate([{ opacity: a, transform: 'scale(.6)' }, { opacity: 0, transform: 'scale(1.7)' }], { duration: 280, easing: 'ease-out' });
  }

  activateOD() {
    if (this.state !== 'play') return;
    if (this.odOn || this.od < 100) return;
    this.odOn = true;
    this.odUntil = this.now() + OD_DUR;
    $('#screen-play').classList.add('od-on');
    $('#odGlow').style.opacity = 1;
  }

  // ---------- 일시정지 ----------
  async togglePause() {
    if (this.state === 'play' || this.state === 'lead') {
      this.prevState = this.state;
      this.state = 'pause';
      await this.audio.pause();
      $('#pauseOv').style.display = 'flex';
      this.padEls.forEach((_, l) => this.setPad(l, false));
    } else if (this.state === 'pause') {
      $('#pauseOv').style.display = 'none';
      this.state = 'cd';
      let n = 3;
      const cd = $('#cdOv'), num = $('#cdNum');
      cd.style.display = 'flex'; num.textContent = n;
      this.cdTimer = setInterval(async () => {
        n--;
        if (n > 0) { num.textContent = n; return; }
        clearInterval(this.cdTimer);
        cd.style.display = 'none';
        await this.audio.resume();
        this.state = this.prevState || 'play';
      }, 700);
    }
  }

  // ---------- 프레임 ----------
  frame() {
    this.raf = requestAnimationFrame(this.frame);
    if (this.state === 'idle' || this.state === 'done') return;
    const t = this.now();
    if (this.state === 'lead' && t >= 0) {
      this.state = 'play';
      this.E.judgeText.style.opacity = 0; this.E.judgeText.textContent = '';
    }

    if (this.state === 'lead') {
      const c = Math.ceil(-t);
      const el = this.E.judgeText;
      if (c <= 3 && c > 0) {
        if (el.textContent !== String(c)) { el.textContent = String(c); el.style.color = '#fff'; el.style.opacity = 1; this.popJudge(); this.E.judgeSub.style.opacity = 0; }
      }
    }
    this.perfWatch();
    if (this.state === 'play') {
      this.update(t);
      if (this.state === 'done') return;
    }
    this.render(Math.max(t, -LEAD_IN));
    this.updateHUD(false, t);
  }

  // 프레임 시간을 감시해서 느리면 배경 움직임을 줄이고, 그래도 느리면 효과를 낮춘다 (AUTO 모드)
  perfWatch() {
    const now = performance.now();
    if (this._lf) { const d = now - this._lf; if (d < 250) { this._acc += d; this._n++; } }
    this._lf = now;
    if (this.state !== 'play' || this._n < 150) return;
    const avg = this._acc / this._n;
    this._acc = 0; this._n = 0;
    const st = this.store.data.settings;
    if ((st.motion || 'auto') !== 'auto' || avg < 24) return;
    if (this.motionLevel > 0) {
      this.motionLevel--;
      st.motionLevel = this.motionLevel;
      setMotion(this.E.themes, MOTION_BUDGET[this.motionLevel]);
      this.toast('성능 보호: 배경 움직임을 줄였어요');
    } else if (!st.lowfx && avg > 28) {
      st.lowfx = true;
      document.body.classList.add('lowfx');
      this.toast('성능 보호: 저사양 효과로 전환했어요');
    }
    this.store.save();
  }
  toast(msg) {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; document.getElementById('stage').appendChild(t); }
    t.textContent = msg; t.style.opacity = 1;
    clearTimeout(this._tt);
    this._tt = setTimeout(() => { t.style.opacity = 0; }, 3000);
  }

  update(t) {
    this.updateSpecial(t);
    // 오토 플레이
    if (this.auto) {
      for (let l = 0; l < 4; l++) {
        const q = this.lanes[l];
        const n = q[this.qpos[l]];
        if (n && n.s === 0 && t >= n.t) {
          this.setPad(l, true);
          this.tryHit(l, n.t + (Math.random() - 0.5) * 0.024);
          if (!n.len) setTimeout(() => this.setPad(l, false), 60);
        }
        const h = this.holding[l];
        if (h && t >= h.end) { this.setPad(l, false); this.finishHold(h, l); }
      }
    }
    // 놓친 노트 / 홀드 종료
    for (let l = 0; l < 4; l++) {
      const q = this.lanes[l];
      let n = q[this.qpos[l]];
      while (n && n.s === 0 && t - n.t > WIN.good) {
        n.s = 3; this.qpos[l]++;
        if (n.el) n.el.classList.add('dead');
        this.register('miss', 0, l);
        n = q[this.qpos[l]];
      }
      const h = this.holding[l];
      if (h && t >= h.end && this.down[l]) this.finishHold(h, l);
      else if (h && t > h.end + WIN.good) this.finishHold(h, l);
    }
    // 오버드라이브
    if (this.odOn) {
      const left = this.odUntil - t;
      this.od = clamp((left / OD_DUR) * 100, 0, 100);
      if (left <= 0) { this.odOn = false; this.od = 0; $('#screen-play').classList.remove('od-on'); $('#odGlow').style.opacity = 0; }
    }
    // 고스트 기록
    const idx = clamp(Math.floor((t / this.duration) * 100), 0, 100);
    for (let i = this.recIdx || 0; i <= idx; i++) this.rec[i] = this.score;
    this.recIdx = idx + 1;
    // 종료
    if (!this.failed && t > Math.min(this.duration, this.lastEnd + 3) && this.noPending()) this.finish(false);
  }
  noPending() {
    return this.qpos.every((p, l) => p >= this.lanes[l].length) && this.fpos >= this.flicks.length && this.epos >= this.ends.length;
  }

  finish(failed) {
    if (this.state === 'done') return;
    this.failed = failed;
    this.state = 'done';
    cancelAnimationFrame(this.raf);
    // 남은 노트는 모두 MISS 처리 (실패 시)
    if (failed) {
      for (const n of this.notes) {
        if (n.kind === 'bomb') continue;
        if (n.s === 0 || n.s === 1) { this.counts.miss++; this.judged++; n.s = 3; }
        if (n.kind === 'slide' && n.endNode.s === 0) { this.counts.miss++; this.judged++; n.endNode.s = 3; }
      }
    }
    const acc = this.calcAcc(false);
    for (let i = this.recIdx || 0; i <= 100; i++) this.rec[i] = this.score;
    const result = {
      song: this.song, diffKey: this.diffKey, stage: this.stage, chart: this.chart,
      counts: { ...this.counts }, score: Math.round(this.score), acc, maxCombo: this.maxCombo,
      total: this.total, devs: this.devs, accHist: this.accHist, missIdx: this.missIdx,
      sync: Math.round(this.sync), failed, rank: rankOf(acc, failed), ghost: this.rec, auto: this.auto, bombs: this.bombHits,
    };
    this.audio.stopSong();
    this.clearNotes();
    this.cb.onFinish(result);
  }

  // ---------- 렌더 ----------
  isDone(n) {
    switch (n.kind) {
      case 'slide': return n.s >= 2 && n.endNode.s >= 2;
      case 'bomb': return n.s >= 1;
      default: return n.s >= 2;
    }
  }
  mkEl(n) {
    const cls = LANE_CLS[n.lane];
    const left = n.lane * LANE_W + 4;
    const pool = this.pool[n.kind] || (this.pool[n.kind] = []);
    let el = pool.pop();
    if (!el) el = document.createElement('div');
    el._kind = n.kind;
    if (n.kind === 'ln') {
      if (!el.firstChild) el.innerHTML = '<div class="body"></div><div class="head"></div>';
      el.className = 'ln ' + cls;
      const lenPx = n.len * this.pxs;
      el.firstChild.style.height = lenPx + NOTE_H / 2 + 'px';
      el.lastChild.style.top = lenPx + 'px';
      el.style.left = left + 'px';
    } else if (n.kind === 'flick') {
      el.className = 'note flick ' + (n.dir < 0 ? 'l' : 'r');
      el.textContent = n.dir < 0 ? '‹‹‹' : '›››';
      el.style.left = left + 'px';
    } else if (n.kind === 'bomb') {
      if (!el.firstChild) el.innerHTML = '<svg width="72" height="44" viewBox="0 0 72 44"><polygon points="18,2 54,2 70,14 70,30 54,42 18,42 2,30 2,14" fill="#1a0f08" stroke="#ff7a1a" stroke-width="3"/><path d="M26 14L46 30M46 14L26 30" stroke="#ff7a1a" stroke-width="5" stroke-linecap="round"/></svg>';
      el.className = 'bomb';
      el.style.left = n.lane * LANE_W + 16 + 'px';
    } else if (n.kind === 'slide') {
      const span = (n.t2 - n.t) * this.pxs;
      const xA = n.lane * LANE_W + 4, xB = n.lane2 * LANE_W + 4, L = Math.min(xA, xB), W = Math.abs(xB - xA) + 97;
      const hx = xA - L, ex = xB - L, H = span + 20;
      el.className = 'slide';
      el.style.left = L + 'px'; el.style.width = W + 'px'; el.style.height = H + 'px';
      el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><polygon points="${hx + 14},${span + 10} ${hx + 83},${span + 10} ${ex + 83},10 ${ex + 14},10" fill="rgba(77,255,154,.26)" stroke="#4dff9a" stroke-width="2"/><line x1="${hx + 48.5}" y1="${span + 10}" x2="${ex + 48.5}" y2="10" stroke="#bfffd8" stroke-width="2" stroke-dasharray="8 8" stroke-opacity=".8"/></svg><div class="sh" style="left:${hx}px;top:${span}px"></div><div class="se" style="left:${ex}px;top:0">${n.lane2 > n.lane ? '››' : '‹‹'}</div>`;
    } else {
      el.className = 'note ' + cls;
      el.style.left = left + 'px';
    }
    el.style.display = '';
    if (n.kind === 'ln' && n.s === 1) el.classList.add('hold');
    if (n.kind === 'slide' && n.s === 2) el.classList.add('hit');
    if (n.s === 3 || n.s === 4 && n.kind !== 'bomb' || (n.kind === 'slide' && n.endNode.s === 3)) el.classList.add('dead');
    this.E.notes.appendChild(el);
    return el;
  }
  releaseEl(n) {
    if (!n.el) return;
    n.el.style.display = 'none';
    (this.pool[n.el._kind] || (this.pool[n.el._kind] = [])).push(n.el);
    n.el = null;
  }

  render(t) {
    const pxs = this.pxs;
    const horizon = (LINE + 40) / pxs;
    // 비트 라인
    const P = this.beatPx;
    const off = this.chart.offset;
    const y4 = (((LINE + (t - off) * pxs) % (P * 4)) + P * 4) % (P * 4);
    this.bl.style.transform = `translate3d(0,${y4}px,0)`;

    const notes = this.notes;
    for (let i = this.first; i < notes.length; i++) {
      const n = notes[i];
      const k = n.kind;
      if (!n.el && i === this.first && this.isDone(n) && t - n.fin > 0.5) { this.first++; continue; }
      if (n.t - t > horizon) break;
      if (k === 'bomb' ? n.s === 1 : k === 'slide' ? n.s === 2 && n.endNode.s === 2 : n.s === 2) continue;   // 이미 처리되어 사라진 노트
      let y, lenPx = 0;
      if (k === 'ln') {
        lenPx = n.len * pxs;
        if (n.s === 1) { lenPx = Math.max(0, (n.end - t) * pxs); y = LINE - NOTE_H / 2; }
        else y = LINE - (n.t - t) * pxs - NOTE_H / 2;
      } else if (k === 'slide') y = LINE - (n.t2 - t) * pxs - NOTE_H / 2;     // 끝 노드가 맨 위
      else if (k === 'bomb') y = LINE - (n.t - t) * pxs - 22;
      else y = LINE - (n.t - t) * pxs - NOTE_H / 2;
      const yTop = k === 'ln' ? y - lenPx : y;
      if (yTop > HW_H + 20 || (k !== 'slide' && y < -120)) { if (n.el) this.releaseEl(n); continue; }
      if (!n.el) n.el = this.mkEl(n);
      const el = n.el;
      if (k === 'ln' && n.s === 1) {
        el.firstChild.style.height = lenPx + NOTE_H / 2 + 'px';
        el.lastChild.style.top = lenPx + 'px';
      }
      el.style.transform = `translate3d(0,${yTop}px,0)`;
    }
  }

  updateHUD(force, t) {
    const c = this.cache, E = this.E;
    const set = (id, v) => { if (force || c[id] !== v) { c[id] = v; E[id].textContent = v; } };
    const sc = Math.round(this.score);
    if (force || c.sc !== sc) { c.sc = sc; E.hScore.textContent = fmtNum(sc); }
    const cn = this.counts;
    if (force || c.cp !== cn.perfect) { c.cp = cn.perfect; E.cP.textContent = fmtNum(cn.perfect); }
    if (force || c.cg !== cn.great) { c.cg = cn.great; E.cG.textContent = fmtNum(cn.great); }
    if (force || c.co !== cn.good) { c.co = cn.good; E.cO.textContent = fmtNum(cn.good); }
    if (force || c.cm !== cn.miss) { c.cm = cn.miss; E.cM.textContent = fmtNum(cn.miss); }
    const acc = this.calcAcc(true);
    set('hAcc', acc.toFixed(2) + '%');
    const rank = rankOf(acc, false);
    if (force || c.rank !== rank) {
      c.rank = rank;
      const r = E.hRank; r.textContent = rank; r.style.background = rankColor(rank);
      r.style.fontSize = rank.length > 1 ? '24px' : '30px';
    }
    // 콤보
    if (force || c.combo !== this.combo) {
      c.combo = this.combo;
      E.combo.textContent = this.combo;
      const show = this.combo >= 2 ? 1 : 0;
      E.combo.style.opacity = show; E.comboLbl.style.opacity = show;
    }
    // SYNC
    const seg = Math.ceil(this.sync / 5);
    if (force || c.seg !== seg) {
      c.seg = seg;
      const sb = E.syncBar, low = this.sync < 30;
      sb.style.clipPath = `inset(${(20 - seg) * 15}px 0 0 0)`;
      if (c.low !== low) {
        c.low = low;
        sb.style.background = low
          ? 'repeating-linear-gradient(to top,#ff2a6d 0,#ff2a6d 12px,transparent 12px,transparent 15px)'
          : 'repeating-linear-gradient(to top,#00f0ff 0,#00f0ff 12px,transparent 12px,transparent 15px)';
        sb.style.filter = `drop-shadow(0 0 5px ${low ? 'rgba(255,42,109,.8)' : 'rgba(0,240,255,.8)'})`;
      }
    }
    set('syncPct', Math.round(this.sync) + '%');
    // OVERDRIVE
    const odq = Math.round(this.od * 5) / 5;
    if (force || c.odq !== odq) { c.odq = odq; E.odRing.setAttribute('stroke-dasharray', `${(odq / 100) * 339.3} 339.3`); }
    set('odPct', Math.floor(this.od) + '%');
    set('odNote', this.odOn ? 'ACTIVE · ×1.5' : this.od >= 100 ? 'PRESS SPACE' : 'READY AT 100%');
    if (force || c.odOn !== this.odOn) { c.odOn = this.odOn; E.odRing.style.stroke = this.odOn ? '#ff2a6d' : '#00f0ff'; }
    // 시간/진행 (transform 만 사용: 레이아웃 없음)
    const tt = t === undefined ? 0 : clamp(t, 0, this.duration);
    set('tCur', fmtTime(tt));
    const p = this.duration ? tt / this.duration : 0;
    const pq = Math.round(p * 1000);
    if (force || c.pq !== pq) { c.pq = pq; E.progFill.style.transform = `scaleX(${p})`; E.progMark.style.transform = `translateX(${p * this.progW}px)`; }
    const tl = this.timeline;
    if (t !== undefined && tl) {
      let i = this.tlIdx;
      while (i > 0 && t < tl[i].t0) i--;
      while (i < tl.length - 1 && t >= tl[i + 1].t0) i++;
      if (i !== this.tlIdx || force) { this.tlIdx = i; setTheme(tl[i].theme); }
    }
    set('secName', tl ? tl[this.tlIdx].name : '');
    // 판정 텍스트 페이드
    if (this.judgeAt && performance.now() - this.judgeAt > 700 && this.state !== 'lead') {
      E.judgeText.style.opacity = 0; E.judgeSub.style.opacity = 0; this.judgeAt = 0;
    }
    this.updateGhost(p);
    // 스펙트럼은 30Hz 로만 갱신
    if (force || (++this.fcount & 1) === 0) {
      this.audio.spectrum(SPEC_N, this.specVals);
      for (let i = 0; i < SPEC_N; i++) {
        const v = this.specVals[i], q = Math.round(v * 46);
        if (c['sp' + i] === q) continue;
        c['sp' + i] = q;
        const h = 4 + v * 92, e = this.specEls[i];
        e.setAttribute('y', (100 - h).toFixed(1)); e.setAttribute('height', h.toFixed(1));
        e.setAttribute('fill', v > 0.62 ? '#ff2a6d' : '#00f0ff');
      }
    }
  }

  updateGhost(p) {
    const c = this.cache, E = this.E;
    const you = Math.round(this.score);
    const set = (id, v) => { if (c[id] !== v) { c[id] = v; E[id].textContent = v; } };
    if (c.gy !== you) { c.gy = you; E.gYou.textContent = fmtNum(you); }
    if (!this.ghost) {
      set('gDelta', '—'); set('gGhost', '—'); set('gNote', 'NO RECORD YET');
      if (!c.gNoGhost) { c.gNoGhost = true; E.gDelta.style.color = 'var(--mut)'; E.gYouBar.style.transform = 'scaleX(1)'; E.gGhostBar.style.transform = 'scaleX(0)'; }
      return;
    }
    c.gNoGhost = false;
    const f = clamp(p, 0, 1) * 100, i0 = Math.floor(f), i1 = Math.min(100, i0 + 1);
    const g = this.ghost[i0] + (this.ghost[i1] - this.ghost[i0]) * (f - i0);
    const d = Math.round(you - g);
    const dKey = d + ':' + Math.round(g);
    if (c.gk === dKey) return;   // 값이 안 바뀌면 아무 것도 안 함
    c.gk = dKey;
    set('gDelta', (d >= 0 ? '+' : '−') + fmtNum(Math.abs(d)));
    E.gDelta.style.color = d >= 0 ? 'var(--cy)' : 'var(--pk)';
    E.gDelta.style.textShadow = `0 0 14px ${d >= 0 ? 'rgba(0,240,255,.5)' : 'rgba(255,42,109,.5)'}`;
    set('gGhost', fmtNum(Math.round(g)));
    set('gNote', 'SAME POINT IN SONG');
    const mx = Math.max(you, g, 1);
    E.gYouBar.style.transform = `scaleX(${you / mx})`;
    E.gGhostBar.style.transform = `scaleX(${g / mx})`;
  }
}
