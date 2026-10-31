// 곡 선택 화면
import { $, $$, clamp, fmtNum, fmtTime, pad2, store, levelInfo, playerRating } from './util.js';
import { coverSVG } from './cover.js';
import { DIFFS } from './chart.js';
import { rankColor } from './game.js';

// 슬롯별 기하 (목업 좌표). off = 선택 곡 기준 오프셋
const SLOT = {
  '-3': { top: 106, left: 160, w: 440, h: 60, o: 0.7 },
  '-2': { top: 176, left: 112, w: 488, h: 60, o: 0.85 },
  '-1': { top: 246, left: 72, w: 528, h: 60, o: 0.95 },
  '0': { top: 316, left: 40, w: 560, h: 96, o: 1 },
  '1': { top: 422, left: 72, w: 528, h: 60, o: 0.95 },
  '2': { top: 492, left: 112, w: 488, h: 60, o: 0.85 },
  '3': { top: 562, left: 160, w: 440, h: 60, o: 0.7 },
};

function titleLines(t) {
  const w = t.split(' ');
  if (w.length < 2) return [t];
  let best = 1, diff = 1e9;
  for (let i = 1; i < w.length; i++) {
    const d = Math.abs(w.slice(0, i).join(' ').length - w.slice(i).join(' ').length);
    if (d < diff) { diff = d; best = i; }
  }
  return [w.slice(0, best).join(' '), w.slice(best).join(' ')];
}

export class SongSelect {
  constructor(app) {
    this.app = app;   // { songs, audio, startSong(song, diffIdx), openOptions(), back() }
    this.songs = app.songs;
    this.filter = 'all';
    this.view = [];
    this.sel = 0;
    this.diff = 2;
    this.rows = new Map();
    this.build();
  }

  build() {
    const list = $('#list');
    for (const s of this.songs) {
      const r = document.createElement('div');
      r.className = 'row gone';
      r.dataset.id = s.id;
      r.innerHTML = `<div class="rbar"></div><div class="rc">${coverSVG(s, { size: 44, border: 0 })}</div>
        <div class="rt"></div><div class="ra"></div><div class="rfav">★</div><div class="rlv"></div>
        <div class="rchips"><span class="chip pk"></span><span class="chip cy"></span></div><div class="rrank"></div>`;
      r.querySelector('.rt').textContent = s.title;
      r.querySelector('.ra').textContent = s.artist;
      r.addEventListener('click', () => {
        const i = this.view.indexOf(s);
        if (i < 0) return;
        if (i === this.sel) this.start(); else this.move(i - this.sel);
      });
      list.appendChild(r);
      this.rows.set(s.id, r);
    }
    $$('#filters .tab').forEach((b) => b.addEventListener('click', () => this.setFilter(b.dataset.f)));
    $('#btnStart').addEventListener('click', () => this.start());
    $('#btnOpt').addEventListener('click', () => this.app.openOptions());
    $('#list').addEventListener('wheel', (e) => { e.preventDefault(); this.move(e.deltaY > 0 ? 1 : -1); }, { passive: false });
    $('#detail').addEventListener('wheel', (e) => e.stopPropagation());
  }

  applyFilter() {
    const favs = store.data.favorites;
    this.view = this.songs.filter((s) => {
      if (this.filter === 'new') return s.isNew;
      if (this.filter === 'fav') return favs.includes(s.id);
      if (this.filter === 'bpm') return s.bpm >= 150;
      return true;
    });
  }
  setFilter(f) {
    const cur = this.view[this.sel];
    this.filter = f;
    $$('#filters .tab').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.f === f)));
    this.applyFilter();
    const i = this.view.indexOf(cur);
    this.sel = i >= 0 ? i : 0;
    this.layout(); this.select();
  }

  show() {
    this.applyFilter();
    this.sel = clamp(this.sel, 0, Math.max(0, this.view.length - 1));
    this.refreshPlayer();
    this.layout();
    this.select(true);
  }
  refreshPlayer() {
    const d = store.data, li = levelInfo(d.profile.xp);
    $('#plName').textContent = d.profile.name;
    $('#plSub').textContent = `LV ${li.lv} · RATING ${playerRating(d.bests).toFixed(2)}`;
    $('#plHex').textContent = d.profile.name[0] || 'P';
  }

  move(d) {
    const n = clamp(this.sel + d, 0, this.view.length - 1);
    if (n === this.sel) return;
    this.sel = n;
    this.layout(); this.select();
  }
  moveDiff(d) {
    this.diff = clamp(this.diff + d, 0, 3);
    this.renderDetail();
    this.layout();
  }

  layout() {
    const sels = this.view[this.sel];
    this.rows.forEach((r, id) => {
      const s = this.songs.find((x) => x.id === id);
      const vi = this.view.indexOf(s);
      if (vi < 0) { r.classList.add('gone'); r.style.opacity = 0; return; }
      const off = vi - this.sel;
      const slot = SLOT[clamp(off, -3, 3)];
      const hidden = Math.abs(off) > 3;
      r.classList.toggle('gone', hidden);
      r.classList.toggle('sel', off === 0);
      r.classList.toggle('fav', store.data.favorites.includes(s.id));
      Object.assign(r.style, {
        top: slot.top + (hidden ? Math.sign(off) * 30 : 0) + 'px', left: slot.left + 'px',
        width: slot.w + 'px', height: slot.h + 'px', opacity: hidden ? 0 : slot.o,
      });
      r.querySelector('.rlv').textContent = 'LV ' + s.levels[this.diff];
      const best = store.data.bests[s.id + ':' + DIFFS[this.diff].key];
      const rk = r.querySelector('.rrank');
      rk.classList.toggle('has', !!best);
      if (best) { rk.textContent = best.rank; rk.style.background = rankColor(best.rank); rk.style.fontSize = best.rank.length > 1 ? '16px' : '22px'; }
      const chips = r.querySelectorAll('.rchips .chip');
      chips[0].textContent = DIFFS[this.diff].name + ' ' + s.levels[this.diff];
      chips[1].textContent = Math.round(s.bpm) + ' BPM';
    });
    const n = this.view.length;
    $('#selCount').textContent = `${pad2(n ? this.sel + 1 : 0)} / ${pad2(n)}`;
    $('#emptyMsg').style.display = n ? 'none' : 'block';
    const trackH = 516, th = 40;
    $('#scrollThumb').style.top = 106 + (n > 1 ? (this.sel / (n - 1)) * (trackH - th) : 0) + 'px';
    $('#detail').style.visibility = n ? 'visible' : 'hidden';
    if (sels) $('#selBg').innerHTML = coverSVG(sels, { size: 760, border: 0 });
  }

  // 선택 변경 시: 상세 갱신 + 음원 로드/분석 + 미리듣기
  select(immediate) {
    const s = this.view[this.sel];
    if (!s) { this.app.audio.stopPreview(0.2); return; }
    this.renderDetail();
    const token = ++this.tok;
    clearTimeout(this.loadTimer);
    this.loadTimer = setTimeout(async () => {
      const entry = await this.app.audio.load(s);
      if (token !== this.tok || this.view[this.sel] !== s) return;
      this.entry = entry;
      this.renderDetail();
      this.app.audio.playPreview(entry, s.preview ?? entry.duration * 0.35);
    }, immediate ? 0 : 260);
  }
  tok = 0;

  renderDetail() {
    const s = this.view[this.sel];
    if (!s) return;
    const d = DIFFS[this.diff];
    const entry = this.app.audio.cache.get(s.id) || (this.app.audio.chartKeep && this.app.audio.chartKeep.get(s.id)) || null;
    const chart = entry ? entry.charts[d.key] : null;
    $('#dCover').innerHTML = coverSVG(s, { size: 220, border: 1 });
    $('#dNo').textContent = 'TRACK ' + pad2(this.songs.indexOf(s) + 1);
    $('#dTitle').replaceChildren(...titleLines(s.title).map((l) => {
      const d = document.createElement('div');
      d.style.height = '36px'; d.textContent = l; return d;
    }));
    $('#dArtist').textContent = s.artist;
    $('#dArtist').style.top = titleLines(s.title).length === 1 ? '90px' : '126px';
    $('#dBpm').textContent = entry ? Math.round(entry.bpm) : Math.round(s.bpm);
    $('#dTime').textContent = fmtTime(entry ? entry.duration : s.duration);
    $('#dNotes').textContent = chart ? fmtNum(chart.total) : '…';
    const pv = s.preview ?? 0;
    $('#dPrevTxt').textContent = 'PREVIEW ' + fmtTime(pv);
    const src = $('#dSrc');
    if (entry) {
      src.textContent = entry.source === 'file' ? '' : 'NO AUDIO FILE · DEMO BEAT';
      src.style.color = 'var(--pk)';
    } else { src.textContent = 'ANALYZING…'; src.style.color = 'var(--mut)'; }

    // 난이도 버튼
    $('#diffs').innerHTML = '';
    DIFFS.forEach((df, i) => {
      const b = document.createElement('button');
      b.className = 'dbtn'; b.style.left = 24 + i * 134 + 'px';
      b.setAttribute('aria-pressed', String(i === this.diff));
      b.innerHTML = `<span>${df.name}</span><span>${s.levels[i]}</span>`;
      b.addEventListener('click', () => { this.diff = i; this.renderDetail(); this.layout(); });
      $('#diffs').appendChild(b);
    });

    // 밀도 그래프
    const svg = $('#dDens');
    if (chart) {
      const dn = chart.density, mx = Math.max(...dn, 1);
      const pts = dn.map((v, i) => [i * (532 / 18), 52 - (v / mx) * 46 - 2]);
      const line = pts.map((p) => p.join(',')).join(' ');
      svg.innerHTML = `<polygon points="${line} 532,56 0,56" fill="#00f0ff" fill-opacity=".18"/><polyline points="${line}" fill="none" stroke="#00f0ff" stroke-width="2"/>` +
        [0.25, 0.48, 0.76].map((p) => `<line x1="${p * 532}" y1="0" x2="${p * 532}" y2="56" stroke="#e9f7ff" stroke-opacity=".3" stroke-dasharray="3 4"/>`).join('');
    } else svg.innerHTML = '';

    // 최고 기록
    const best = store.data.bests[s.id + ':' + d.key];
    $('#dBestLbl').textContent = best ? `BEST · ${best.rank} · ${best.acc.toFixed(1)}%` : 'BEST';
    $('#dBest').textContent = best ? fmtNum(best.score) : '—';
    $('#btnStart').disabled = !entry;
  }

  start() {
    const s = this.view[this.sel];
    if (!s || !this.app.audio.cache.get(s.id)) return;
    this.app.startSong(s, this.diff);
  }

  toggleFav() {
    const s = this.view[this.sel];
    if (!s) return;
    const f = store.data.favorites, i = f.indexOf(s.id);
    if (i >= 0) f.splice(i, 1); else f.push(s.id);
    store.save();
    this.layout();
    if (this.filter === 'fav') this.setFilter('fav');
  }

  onKey(e) {
    switch (e.code) {
      case 'ArrowUp': this.move(-1); return true;
      case 'ArrowDown': this.move(1); return true;
      case 'ArrowLeft': this.moveDiff(-1); return true;
      case 'ArrowRight': this.moveDiff(1); return true;
      case 'Enter': case 'NumpadEnter': this.start(); return true;
      case 'KeyF': this.toggleFav(); return true;
      case 'Tab': this.app.openOptions(); return true;
      case 'Escape': this.app.back(); return true;
    }
    return false;
  }
}
