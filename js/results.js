// 결과 화면
import { $, clamp, fmtNum, store, levelInfo, xpForLevel, chartRating, playerRating, canRaise, stageOf, RAISE_REQ, MAX_STAGE } from './util.js';
import { coverSVG } from './cover.js';
import { DIFFS } from './chart.js';
import { rankColor } from './game.js';

const BARS = [
  ['PERFECT', 'perfect', '#00f0ff', 'var(--tx)'],
  ['GREAT', 'great', '#e9f7ff', 'var(--tx)'],
  ['GOOD', 'good', '#a89dff', 'var(--tx)'],
  ['MISS', 'miss', '#ff2a6d', '#ff2a6d'],
];

export function showResults(r, level) {
  const d = store.data;
  const df = DIFFS.find((x) => x.key === r.diffKey);
  const key = r.song.id + ':' + r.diffKey + ':' + r.stage;
  const prev = d.bests[key];

  // ---- 저장: 최고 기록 / 레이팅 / XP ----
  const beforeRating = playerRating(d.bests);
  const rating = chartRating(Math.min(level, 30), r.acc); // 극악 곡의 초고레벨로 레이팅이 폭주하지 않게 상한
  const isRecord = !r.failed && !r.auto && (!prev || r.score > prev.score);
  if (isRecord) d.bests[key] = { score: r.score, acc: r.acc, rank: r.rank, combo: r.maxCombo, ghost: r.ghost, rating: Math.max(rating, prev ? prev.rating || 0 : 0) };
  else if (!r.failed && !r.auto && prev && rating > (prev.rating || 0)) prev.rating = rating;
  const afterRating = playerRating(d.bests);
  const xpGain = r.auto ? 0 : Math.round((r.failed ? r.score * 0.4 : r.score) / 565);
  const li0 = levelInfo(d.profile.xp);
  d.profile.xp += xpGain;
  const li1 = levelInfo(d.profile.xp);
  store.save();

  // ---- 헤더 ----
  $('#rTitle').textContent = r.failed ? 'SYNC LOST' : 'TRACK CLEARED';
  $('#rSync').textContent = `SYNC ${r.sync}% · ${r.failed ? 'FAILED' : 'SAFE'}`;
  $('#rSync').style.color = r.failed ? 'var(--pk)' : 'var(--cy)';
  $('#rSync').style.borderColor = r.failed ? 'rgba(255,42,109,.6)' : 'rgba(0,240,255,.5)';

  // ---- 랭크 ----
  const rc = rankColor(r.rank);
  for (const id of ['rkA', 'rkB', 'rkC']) {
    const el = document.getElementById(id);
    el.textContent = r.rank;
    el.setAttribute('font-size', r.rank.length > 1 ? 110 : 150);
  }
  $('#rkC').setAttribute('fill', '#e9f7ff');
  $('#rkB').setAttribute('fill', rc === '#ff2a6d' ? '#a89dff' : '#00f0ff');
  $('#rAcc').textContent = r.acc.toFixed(2) + '%';
  $('#rCombo').textContent = fmtNum(r.maxCombo);
  const dr = afterRating - beforeRating;
  $('#rRating').innerHTML = `${beforeRating.toFixed(2)} → ${afterRating.toFixed(2)} <span style="color:${dr >= 0 ? '#00f0ff' : '#ff2a6d'};font-size:14px">${dr >= 0 ? '+' : '−'}${Math.abs(dr).toFixed(2)}</span>`;

  // ---- 곡 정보 ----
  $('#rCover').innerHTML = coverSVG(r.song, { size: 72, border: 2 });
  $('#rSong').textContent = r.song.short || r.song.title;
  $('#rArtist').textContent = r.song.artist;
  $('#rDiff').textContent = df.name + ' ' + level + (r.stage ? ' ▲' + r.stage : '');
  // 튜닝 해금 안내
  const ul = $('#rUnlock'), stNow = stageOf(r.song.id, r.diffKey);
  if (!r.failed && !r.auto && canRaise(r.song.id, r.diffKey)) { ul.style.display = 'block'; ul.textContent = `▲ TUNING UNLOCKED · RAISE IT FROM TRACK SELECT [U]`; }
  else if (!r.failed && !r.auto && stNow < MAX_STAGE) { ul.style.display = 'block'; ul.style.color = 'var(--mut)'; ul.textContent = `${RAISE_REQ[stNow]}%+ ACCURACY UNLOCKS THE NEXT TUNING STAGE`; }
  else ul.style.display = 'none';
  if (canRaise(r.song.id, r.diffKey)) ul.style.color = 'var(--pk)';
  $('#rBpm').textContent = Math.round(r.chart.bpm) + ' BPM';

  // ---- 점수 (카운트업) ----
  const sc = $('#rScore');
  const t0 = performance.now();
  const tick = (now) => {
    const k = clamp((now - t0) / 900, 0, 1), e = 1 - Math.pow(1 - k, 3);
    sc.textContent = fmtNum(r.score * e);
    if (k < 1 && document.getElementById('screen-results').classList.contains('on')) requestAnimationFrame(tick);
    else sc.textContent = fmtNum(r.score);
  };
  requestAnimationFrame(tick);

  const rec = $('#rRecord');
  if (r.auto) {
    rec.innerHTML = '<span class="chip cy" style="font-size:12px;letter-spacing:.2em">AUTO PLAY · NOT RANKED</span>';
    rec.style.visibility = 'visible';
  } else {
    rec.innerHTML = '<span class="chip pk" style="font-size:12px;letter-spacing:.2em;padding:3px 10px;line-height:16px">NEW RECORD</span><span id="rRecDelta" class="orb" style="font-weight:700;font-size:16px;color:var(--cy)"></span>';
    rec.style.visibility = isRecord ? 'visible' : 'hidden';
    if (isRecord) $('#rRecDelta').textContent = prev ? '+' + fmtNum(r.score - prev.score) : 'FIRST CLEAR';
  }

  // ---- 판정 막대 ----
  const total = Math.max(1, r.total);
  $('#rBars').innerHTML = BARS.map(([lbl, k, col, tc], i) => {
    const n = r.counts[k], pc = (n / total) * 100;
    return `<div class="bar-row" style="top:${348 + i * 44}px"><div class="nm"><i style="background:${col}"></i><span style="color:${tc}">${lbl}</span></div>
      <div class="tr"><div data-w="${pc}" style="width:0;background:${col};${k === 'perfect' ? 'box-shadow:0 0 8px rgba(0,240,255,.7)' : ''}"></div></div>
      <span class="ct" style="${k === 'miss' ? 'color:#ff2a6d' : ''}">${fmtNum(n)}</span><span class="pc">${pc.toFixed(1)}%</span></div>`;
  }).join('');
  requestAnimationFrame(() => requestAnimationFrame(() => document.querySelectorAll('#rBars .tr div').forEach((e) => { e.style.width = Math.max(e.dataset.w > 0 ? 2 : 0, e.dataset.w) + '%'; })));
  $('#rTotal').textContent = 'TOTAL NOTES ' + fmtNum(r.total);

  drawTimeline(r);
  drawHist(r);

  // ---- 경험치 ----
  $('#rLv').textContent = 'LV ' + li1.lv;
  $('#rXp').textContent = '+' + fmtNum(xpGain) + ' XP' + (li1.lv > li0.lv ? ' · LEVEL UP!' : '');
  const bar = $('#rXpBar');
  bar.style.transition = 'none';
  bar.style.width = (li1.lv > li0.lv ? 0 : (li0.into / li0.need) * 100) + '%';
  void bar.offsetWidth;
  bar.style.transition = '';
  requestAnimationFrame(() => { bar.style.width = (li1.into / li1.need) * 100 + '%'; });
  $('#rXpNote').textContent = `${fmtNum(li1.need - li1.into)} XP TO LV ${li1.lv + 1}`;
}

function drawTimeline(r) {
  const svg = $('#rTimeline');
  const h = r.accHist;
  const X0 = 44, X1 = 320, YT = 8, YB = 108;
  if (!h.length) { svg.innerHTML = ''; return; }
  const N = 14;
  const samples = [];
  for (let i = 0; i < N; i++) samples.push(h[Math.min(h.length - 1, Math.floor((i / (N - 1)) * (h.length - 1)))]);
  const lo = Math.max(0, Math.floor(Math.min(...samples, ...r.missIdx.map((m) => h[Math.min(h.length - 1, m)])) / 2) * 2 - 2);
  const hi = 100, mid = (lo + hi) / 2;
  const y = (v) => YT + (1 - (v - lo) / (hi - lo)) * (YB - YT);
  const pts = samples.map((v, i) => [X0 + (i / (N - 1)) * (X1 - X0), y(v)]);
  const line = pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const dots = r.missIdx.slice(0, 40).map((m) => {
    const f = m / Math.max(1, h.length - 1);
    const v = h[Math.min(h.length - 1, m)];
    return `<circle cx="${(X0 + f * (X1 - X0)).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3.5" fill="#ff2a6d"/>`;
  }).join('');
  const lab = (v, yy) => `<text x="0" y="${yy + 4}" font-family="Share Tech Mono, monospace" font-size="11" fill="#9aa0c8">${Math.round(v)}%</text>`;
  svg.innerHTML = [YT, (YT + YB) / 2, YB].map((yy) => `<line x1="${X0}" y1="${yy}" x2="${X1}" y2="${yy}" stroke="#e9f7ff" stroke-opacity=".12"/>`).join('') +
    lab(hi, YT) + lab(mid, (YT + YB) / 2) + lab(lo, YB) +
    `<polygon points="${X0},${YB} ${line} ${X1},${YB}" fill="#00f0ff" fill-opacity=".14"/>` +
    `<polyline points="${line}" fill="none" stroke="#00f0ff" stroke-width="2"/>` + dots;
}

function drawHist(r) {
  const BINS = 17, svg = $('#rHist');
  const bins = new Array(BINS).fill(0);
  for (const d of r.devs) {
    const k = clamp(Math.floor(((d + 80) / 160) * BINS), 0, BINS - 1);
    bins[k]++;
  }
  const mx = Math.max(...bins, 1);
  let h = '';
  bins.forEach((v, i) => {
    const bh = Math.max(v ? 3 : 2, (v / mx) * 96);
    const near = Math.abs(i - 8) <= 2;
    h += `<rect x="${(5 + i * 18.5).toFixed(1)}" y="${(100 - bh).toFixed(1)}" width="14" height="${bh.toFixed(1)}" fill="${near ? '#00f0ff' : '#ff2a6d'}"/>`;
  });
  svg.innerHTML = h + '<rect x="0" y="101" width="320" height="2" fill="#e9f7ff" fill-opacity=".3"/>';
  const n = r.devs.length;
  const avg = n ? r.devs.reduce((a, b) => a + b, 0) / n : 0;
  const sd = n ? Math.sqrt(r.devs.reduce((a, b) => a + (b - avg) ** 2, 0) / n) : 0;
  const m = Math.round(avg);
  $('#rStats').innerHTML = `<span>AVG ${m < 0 ? '−' : '+'}${Math.abs(m)} ms</span><span>σ ${Math.round(sd)} ms</span>`;
}
