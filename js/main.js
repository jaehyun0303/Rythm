// 진입점: 화면 라우팅, 옵션, 키 입력 분배
import { $, $$, store, clamp } from './util.js';
import { SONGS } from './songs.js';
import { AudioEngine } from './audio.js';
import { DIFFS } from './chart.js';
import { Game } from './game.js';
import { SongSelect } from './select.js';
import { showResults } from './results.js';

store.load();
const audio = new AudioEngine();
audio.volume = store.data.settings.volume;

let screen = 'title';
let optOpen = false;
let optIdx = 0;
let last = null; // 마지막 플레이 { song, diffIdx }
let lastResult = null;

function go(name) {
  screen = name;
  $$('.screen').forEach((s) => s.classList.toggle('on', s.id === 'screen-' + name));
}

// ---- 스테이지 스케일 (1280×720 기준) ----
const stage = $('#stage');
function fit() {
  const s = Math.min(innerWidth / 1280, innerHeight / 720);
  stage.style.transform = `translate(${(innerWidth - 1280 * s) / 2}px,${(innerHeight - 720 * s) / 2}px) scale(${s})`;
}
addEventListener('resize', fit);
fit();

// ---- 앱 ----
const app = {
  songs: SONGS, audio,
  openOptions, back() { audio.stopPreview(0.2); go('title'); },
  async startSong(song, diffIdx) {
    last = { song, diffIdx };
    const d = DIFFS[diffIdx];
    $('#loading').style.display = 'flex';
    const entry = await audio.load(song);
    await audio.unlock();
    $('#loading').style.display = 'none';
    audio.stopPreview(0.1);
    go('play');
    game.start({ song, entry, diffKey: d.key, diffName: d.name, level: song.levels[diffIdx], chart: entry.charts[d.key] });
  },
};

const game = new Game(audio, store, {
  onFinish(r) {
    lastResult = r;
    showResults(r, last.song.levels[last.diffIdx]);
    go('results');
  },
  onQuit() { game.stop(); selectUI.show(); go('select'); },
  onRetry() { app.startSong(last.song, last.diffIdx); },
});
const selectUI = new SongSelect(app);

// ---- 옵션 ----
const OPTS = [
  { key: 'speed', name: 'SCROLL SPEED', min: 1, max: 10, step: 0.5, fmt: (v) => v.toFixed(1) },
  { key: 'offset', name: 'AUDIO OFFSET', min: -200, max: 200, step: 5, fmt: (v) => (v > 0 ? '+' : '') + v + ' ms' },
  { key: 'volume', name: 'MUSIC VOLUME', min: 0, max: 1, step: 0.05, fmt: (v) => Math.round(v * 100) + '%' },
  { key: 'hitsound', name: 'HIT SOUND', bool: true },
  { key: 'auto', name: 'AUTO PLAY', bool: true },
];
function renderOpts() {
  const st = store.data.settings;
  $('#optRows').innerHTML = OPTS.map((o, i) => {
    const v = st[o.key];
    const txt = o.bool ? (v ? 'ON' : 'OFF') : '◀ ' + o.fmt(v) + ' ▶';
    return `<div class="orow${i === optIdx ? ' on' : ''}" data-i="${i}" style="top:${70 + i * 46}px"><span class="n">${o.name}</span><span class="v">${txt}</span></div>`;
  }).join('') + `<div class="mono lbl" style="position:absolute;left:28px;top:304px;letter-spacing:.1em;line-height:16px;width:464px">OFFSET +: 판정이 빠르게 / −: 늦게 (계속 LATE 로 치면 + 로)</div>`;
  $$('#optRows .orow').forEach((r) => {
    r.addEventListener('click', (e) => {
      optIdx = +r.dataset.i;
      const o = OPTS[optIdx];
      if (o.bool) changeOpt(1);
      else { const rect = r.getBoundingClientRect(); changeOpt(e.clientX < rect.left + rect.width / 2 ? -1 : 1); }
    });
  });
}
function openOptions() { optOpen = true; optIdx = 0; renderOpts(); $('#optOv').style.display = 'flex'; }
function closeOptions() { optOpen = false; $('#optOv').style.display = 'none'; store.save(); }
function changeOpt(d) {
  const o = OPTS[optIdx], st = store.data.settings;
  if (o.bool) st[o.key] = !st[o.key];
  else {
    const v = clamp(st[o.key] + d * o.step, o.min, o.max);
    st[o.key] = Math.round(v * 1000) / 1000;
  }
  if (o.key === 'volume') audio.setVolume(st.volume);
  renderOpts();
}
$('#optOv').addEventListener('click', (e) => { if (e.target.id === 'optOv') closeOptions(); });

// ---- 키 입력 ----
const BLOCK = new Set(['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
addEventListener('keydown', (e) => {
  if (BLOCK.has(e.code)) e.preventDefault();
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (optOpen) {
    if (e.code === 'ArrowUp') optIdx = (optIdx + OPTS.length - 1) % OPTS.length, renderOpts();
    else if (e.code === 'ArrowDown') optIdx = (optIdx + 1) % OPTS.length, renderOpts();
    else if (e.code === 'ArrowLeft') changeOpt(-1);
    else if (e.code === 'ArrowRight') changeOpt(1);
    else if (['Enter', 'Tab', 'Escape'].includes(e.code)) closeOptions();
    return;
  }
  if (screen === 'title') {
    if (e.repeat) return;
    enterFromTitle();
  } else if (screen === 'select') {
    if (!e.repeat || e.code.startsWith('Arrow')) selectUI.onKey(e);
  } else if (screen === 'play') {
    game.onKeyDown(e);
  } else if (screen === 'results') {
    if (e.code === 'KeyR') app.startSong(last.song, last.diffIdx);
    else if (e.code === 'Enter' || e.code === 'Escape' || e.code === 'NumpadEnter') toSelect();
  }
});
addEventListener('keyup', (e) => { if (screen === 'play') game.onKeyUp(e); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden && screen === 'play' && (game.state === 'play' || game.state === 'lead')) game.togglePause();
});

function toSelect() { selectUI.show(); go('select'); }
async function enterFromTitle() {
  await audio.unlock();
  toSelect();
}
$('#screen-title').addEventListener('click', enterFromTitle);
$('#btnRetry').addEventListener('click', () => app.startSong(last.song, last.diffIdx));
$('#btnCont').addEventListener('click', toSelect);

// 디버그/테스트용 핸들
window.__rythm = { app, game, audio, store, selectUI, go };
