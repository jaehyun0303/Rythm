// 플레이 화면: 하이웨이 렌더링, 입력/판정, HUD
import { $, clamp, fmtNum, fmtTime } from './util.js';
import { coverSVG } from './cover.js';
import { buildThemes, setTheme, resetTheme } from './themes.js';

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
  laneAt(clientX) {
    const r = $('#stage').getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * 1280;
    if (x < 400 || x > 880) return -1;
    return clamp(Math.floor((x - 430) / LANE_W), 0, 3);
  }
  bindPointers() {
    const scr = $('#screen-play');
    this.ptr = new Map();
    scr.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button,.ov,#odPanel')) return;
      const lane = this.laneAt(e.clientX);
      if (lane < 0) return;
      e.preventDefault();
      this.ptr.set(e.pointerId, lane);
      this.press(lane, e.timeStamp);
    });
    const up = (e) => {
      const l = this.ptr.get(e.pointerId);
      if (l === undefined) return;
      this.ptr.delete(e.pointerId);
      this.release(l, e.timeStamp);
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
    this.notes = chart.notes.map((n) => ({ ...n, s: 0, el: null, j: null }));
    this.total = this.notes.length;
    this.lastEnd = this.notes.reduce((m, n) => Math.max(m, n.end || n.t), 0);
    this.lanes = [[], [], [], []];
    this.notes.forEach((n) => this.lanes[n.lane].push(n));
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

  press(lane, perf) {
    if (this.state !== 'play' && this.state !== 'lead') return;
    if (this.auto) return;
    this.setPad(lane, true);
    this.tryHit(lane, this.now(perf));
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
    if (!n || n.s !== 0) return;
    const dt = t - n.t;
    if (dt < -WIN.good) return; // 너무 이른 입력은 무시
    const adt = Math.abs(dt);
    const j = adt <= WIN.perfect ? 'perfect' : adt <= WIN.great ? 'great' : 'good';
    n.j = j;
    if (n.len > 0) {
      n.s = 1; this.holding[lane] = n;
      if (n.el) n.el.classList.add('hold');
    } else {
      n.s = 2; this.qpos[lane]++;
      this.releaseEl(n);
    }
    this.register(j, dt * 1000, lane);
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
      $('#combo').classList.remove('bump'); void $('#combo').offsetWidth; $('#combo').classList.add('bump');
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

  showJudge(j, devMs) {
    const J = JUDGE[j], el = $('#judgeText'), sub = $('#judgeSub');
    el.textContent = J.txt;
    el.style.color = J.col;
    el.style.textShadow = `3px 0 rgba(255,42,109,.9),-3px 0 rgba(0,240,255,.9),0 0 22px ${J.glow}`;
    el.style.opacity = 1;
    el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    if (j === 'miss') sub.textContent = '';
    else {
      const m = Math.round(devMs);
      const pts = PTS[j] * (this.odOn ? OD_MULT : 1);
      sub.textContent = `${m < 0 ? '−' : '+'}${Math.abs(m)} ms · +${fmtNum(pts)}`;
    }
    sub.style.opacity = 1;
    this.judgeAt = performance.now();
  }

  addDevTick(ms, bad) {
    const box = $('#devTicks');
    const d = document.createElement('div');
    d.className = 'devtick' + (bad ? ' bad' : '');
    d.style.left = clamp(145 + ms * 1.8, 0, 288) + 'px';
    box.appendChild(d);
    requestAnimationFrame(() => { d.style.opacity = 0; });
    setTimeout(() => d.remove(), 3100);
    // 평균 마커
    const recent = this.devs.slice(-16);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    $('#devAvg').style.left = clamp(144 + avg * 1.8, 0, 288) + 'px';
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
      $('#judgeText').style.opacity = 0; $('#judgeText').textContent = '';
    }

    if (this.state === 'lead') {
      const c = Math.ceil(-t);
      const el = $('#judgeText');
      if (c <= 3 && c > 0) {
        if (el.textContent !== String(c)) { el.textContent = String(c); el.style.color = '#fff'; el.style.opacity = 1; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); $('#judgeSub').style.opacity = 0; }
      }
    }
    if (this.state === 'play') {
      this.update(t);
      if (this.state === 'done') return;
    }
    this.render(Math.max(t, -LEAD_IN));
    this.updateHUD(false, t);
  }

  update(t) {
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
    return this.qpos.every((p, l) => p >= this.lanes[l].length);
  }

  finish(failed) {
    if (this.state === 'done') return;
    this.failed = failed;
    this.state = 'done';
    cancelAnimationFrame(this.raf);
    // 남은 노트는 모두 MISS 처리 (실패 시)
    if (failed) {
      for (const n of this.notes) {
        if (n.s === 0 || n.s === 1) { this.counts.miss++; this.judged++; n.s = 3; }
      }
    }
    const acc = this.calcAcc(false);
    for (let i = this.recIdx || 0; i <= 100; i++) this.rec[i] = this.score;
    const result = {
      song: this.song, diffKey: this.diffKey, stage: this.stage, chart: this.chart,
      counts: { ...this.counts }, score: Math.round(this.score), acc, maxCombo: this.maxCombo,
      total: this.total, devs: this.devs, accHist: this.accHist, missIdx: this.missIdx,
      sync: Math.round(this.sync), failed, rank: rankOf(acc, failed), ghost: this.rec, auto: this.auto,
    };
    this.audio.stopSong();
    this.clearNotes();
    this.cb.onFinish(result);
  }

  // ---------- 렌더 ----------
  mkEl(n) {
    const cls = LANE_CLS[n.lane];
    const left = n.lane * LANE_W + 4;
    let el;
    if (n.len > 0) {
      el = this.pool.ln.pop();
      if (!el) {
        el = document.createElement('div');
        el.innerHTML = '<div class="body"></div><div class="head"></div>';
      }
      el.className = 'ln ' + cls;
      const lenPx = n.len * this.pxs;
      el.firstChild.style.height = lenPx + NOTE_H / 2 + 'px';
      el.lastChild.style.top = lenPx + 'px';
      el.style.left = left + 'px';
      el._len = lenPx;
      el._ln = true;
    } else {
      el = this.pool.tap.pop();
      if (!el) { el = document.createElement('div'); }
      el.className = 'note ' + cls;
      el.style.left = left + 'px';
      el._ln = false;
    }
    el.style.display = '';
    if (n.s === 1) el.classList.add('hold');
    if (n.s >= 3) el.classList.add('dead');
    $('#notes').appendChild(el);
    return el;
  }
  releaseEl(n) {
    if (!n.el) return;
    n.el.style.display = 'none';
    (n.el._ln ? this.pool.ln : this.pool.tap).push(n.el);
    n.el = null;
  }

  render(t) {
    const pxs = this.pxs;
    const horizon = (LINE + 40) / pxs;
    // 비트 라인
    const P = this.beatPx;
    const off = this.chart.offset;
    const y0 = (((LINE + (t - off) * pxs) % P) + P) % P;
    const y4 = (((LINE + (t - off) * pxs) % (P * 4)) + P * 4) % (P * 4);
    this.bl.style.backgroundPosition = `0 ${y4}px, 0 ${y0}px`;

    let i = this.first;
    for (; i < this.notes.length; i++) {
      const n = this.notes[i];
      if (n.s >= 2 && !n.el && t - (n.end || n.t) > 0.5 && i === this.first) { this.first++; continue; }
      if (n.t - t > horizon) break;
      if (n.s === 2) continue;
      let yHead, lenPx = 0;
      if (n.len > 0) {
        lenPx = n.len * pxs;
        if (n.s === 1) { lenPx = Math.max(0, (n.end - t) * pxs); yHead = LINE - NOTE_H / 2; }
        else yHead = LINE - (n.t - t) * pxs - NOTE_H / 2;
      } else {
        yHead = LINE - (n.t - t) * pxs - NOTE_H / 2;
      }
      const yTop = yHead - lenPx;
      if (yTop > HW_H + 20 || yHead < -120) { if (n.el) this.releaseEl(n); continue; }
      if (!n.el) n.el = this.mkEl(n);
      const el = n.el;
      if (n.len > 0) {
        if (n.s === 1) {
          el.firstChild.style.height = lenPx + NOTE_H / 2 + 'px';
          el.lastChild.style.top = lenPx + 'px';
        }
        el.style.transform = `translate3d(0,${yTop}px,0)`;
      } else {
        el.style.transform = `translate3d(0,${yHead}px,0)`;
      }
    }
  }

  updateHUD(force, t) {
    const c = this.cache;
    const set = (id, v) => { if (force || c[id] !== v) { c[id] = v; $('#' + id).textContent = v; } };
    set('hScore', fmtNum(this.score));
    const acc = this.calcAcc(true);
    set('hAcc', acc.toFixed(2) + '%');
    const rank = rankOf(acc, false);
    if (force || c.rank !== rank) {
      c.rank = rank;
      const r = $('#hRank'); r.textContent = rank; r.style.background = rankColor(rank);
      r.style.fontSize = rank.length > 1 ? '24px' : '30px';
    }
    set('cP', fmtNum(this.counts.perfect)); set('cG', fmtNum(this.counts.great));
    set('cO', fmtNum(this.counts.good)); set('cM', fmtNum(this.counts.miss));
    // 콤보
    const cb = $('#combo'), cl = $('#comboLbl');
    if (force || c.combo !== this.combo) {
      c.combo = this.combo;
      cb.textContent = this.combo;
      const show = this.combo >= 2 ? 1 : 0;
      cb.style.opacity = show; cl.style.opacity = show;
    }
    // SYNC
    const seg = Math.ceil(this.sync / 5);
    if (force || c.seg !== seg) {
      c.seg = seg;
      $('#syncBar').style.clipPath = `inset(${(20 - seg) * 15}px 0 0 0)`;
      $('#syncBar').style.background = this.sync < 30
        ? 'repeating-linear-gradient(to top,#ff2a6d 0,#ff2a6d 12px,transparent 12px,transparent 15px)'
        : 'repeating-linear-gradient(to top,#00f0ff 0,#00f0ff 12px,transparent 12px,transparent 15px)';
      $('#syncBar').style.filter = `drop-shadow(0 0 5px ${this.sync < 30 ? 'rgba(255,42,109,.8)' : 'rgba(0,240,255,.8)'})`;
    }
    set('syncPct', Math.round(this.sync) + '%');
    // OVERDRIVE
    const odp = Math.floor(this.od);
    $('#odRing').setAttribute('stroke-dasharray', `${(this.od / 100) * 339.3} 339.3`);
    set('odPct', odp + '%');
    const note = this.odOn ? 'ACTIVE · ×1.5' : this.od >= 100 ? 'PRESS SPACE' : 'READY AT 100%';
    set('odNote', note);
    $('#odRing').style.stroke = this.odOn ? '#ff2a6d' : '#00f0ff';
    // 시간/진행
    const tt = t === undefined ? 0 : clamp(t, 0, this.duration);
    set('tCur', fmtTime(tt));
    const p = this.duration ? tt / this.duration : 0;
    $('#progFill').style.width = p * 100 + '%';
    $('#progMark').style.left = p * 100 + '%';
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
      $('#judgeText').style.opacity = 0; $('#judgeSub').style.opacity = 0; this.judgeAt = 0;
    }
    // 고스트
    this.updateGhost(p);
    // 스펙트럼
    this.audio.spectrum(SPEC_N, this.specVals);
    for (let i = 0; i < SPEC_N; i++) {
      const v = this.specVals[i];
      const h = 4 + v * 92;
      const e = this.specEls[i];
      e.setAttribute('y', (100 - h).toFixed(1)); e.setAttribute('height', h.toFixed(1));
      e.setAttribute('fill', v > 0.62 ? '#ff2a6d' : '#00f0ff');
    }
  }

  updateGhost(p) {
    const c = this.cache;
    const you = Math.round(this.score);
    const set = (id, v) => { if (c[id] !== v) { c[id] = v; $('#' + id).textContent = v; } };
    set('gYou', fmtNum(you));
    if (!this.ghost) {
      set('gDelta', '—'); set('gGhost', '—'); set('gNote', 'NO RECORD YET');
      $('#gDelta').style.color = 'var(--mut)';
      $('#gYouBar').style.width = '268px';
      $('#gGhostBar').style.width = '0px';
      return;
    }
    const f = clamp(p, 0, 1) * 100, i0 = Math.floor(f), i1 = Math.min(100, i0 + 1);
    const g = this.ghost[i0] + (this.ghost[i1] - this.ghost[i0]) * (f - i0);
    const d = Math.round(you - g);
    const dEl = $('#gDelta');
    set('gDelta', (d >= 0 ? '+' : '−') + fmtNum(Math.abs(d)));
    dEl.style.color = d >= 0 ? 'var(--cy)' : 'var(--pk)';
    dEl.style.textShadow = `0 0 14px ${d >= 0 ? 'rgba(0,240,255,.5)' : 'rgba(255,42,109,.5)'}`;
    set('gGhost', fmtNum(Math.round(g)));
    set('gNote', 'SAME POINT IN SONG');
    const mx = Math.max(you, g, 1);
    $('#gYouBar').style.width = (you / mx) * 268 + 'px';
    $('#gGhostBar').style.width = (g / mx) * 268 + 'px';
  }
}
