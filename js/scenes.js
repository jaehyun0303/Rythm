// 곡 전용 배경 장면들. 곡마다 조용함 / 중간 / 강함 3장면을 곡의 분위기에 맞춰 직접 구성한다.
// 공용 부품(꽃잎, 보케, 오로라, 스포트라이트 ...)을 조합해서 만들고, 각 장면은 { bg, svg } 형태.
import { mulberry32 } from './util.js';

const n0 = (v) => Math.round(v);
const lin = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
const rad = (id, stops, extra = '') =>
  `<radialGradient id="${id}" ${extra}>${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`;
const sFade = (sid, y = 400, a = 0.94) => `<defs>${lin(sid + 'fd', [[0, '#07060d', 0], [1, '#07060d', a]])}</defs><rect x="0" y="${y}" width="1280" height="${720 - y}" fill="url(#${sid}fd)"/>`;
const sRings = (a, b, ao = 0.35, bo = 0.3) => `<circle cx="640" cy="250" r="270" fill="none" stroke="${a}" stroke-opacity="${ao}" stroke-width="2"/><circle cx="640" cy="250" r="236" fill="none" stroke="${b}" stroke-opacity="${bo}" stroke-width="1" stroke-dasharray="3 9"/>`;

// ---------- 부품 ----------
function sStars(n, seed, ymax, color = '#fff', big = 1.6) {
  const r = mulberry32(seed);
  let h = '';
  for (let i = 0; i < n; i++) {
    h += `<circle class="${r() < 0.35 ? 'tw' : ''}" style="animation-delay:${(r() * 4).toFixed(1)}s" cx="${n0(r() * 1280)}" cy="${n0(r() * ymax)}" r="${(0.5 + r() * big).toFixed(1)}" fill="${color}" opacity="${(0.35 + r() * 0.65).toFixed(2)}"/>`;
  }
  return h;
}

// 떨어지는 조각(꽃잎/종이/컨페티). shape: 'petal' | 'page' | 'rect'
function fall(n, seed, cols, shape = 'petal', size = 1, dur0 = 9, dur1 = 10) {
  const r = mulberry32(seed);
  const D = {
    petal: 'M0 0C5-9 15-6 11 5C7 13-3 9 0 0Z',
    page: 'M-9-12H9V12H-9Z M-6-6H6 M-6-1H6 M-6 4H3',
    rect: 'M-4-2H4V2H-4Z',
  }[shape];
  let h = '';
  for (let i = 0; i < n; i++) {
    const x = n0(r() * 1280), y0 = n0(r() * 720), s = (0.6 + r() * 0.9) * size;
    const dur = (dur0 + r() * dur1).toFixed(1), del = (-r() * 18).toFixed(1), dx = n0((r() - 0.5) * 260);
    const c = cols[i % cols.length], rot = n0(r() * 360);
    const look = shape === 'page' ? `fill="${c}" fill-opacity=".85" stroke="#1a1030" stroke-opacity=".35" stroke-width="1"` : `fill="${c}" opacity=".85"`;
    h += `<g transform="translate(${x} ${y0})"><g class="pf" style="--y0:${y0}px;--dx:${dx}px;animation-duration:${dur}s;animation-delay:${del}s"><path transform="rotate(${rot}) scale(${s.toFixed(2)})" d="${D}" ${look}/></g></g>`;
  }
  return h;
}

// 보케(부드러운 빛 원)
function bokeh(sid, n, seed, cols, rmin, rmax, op = 0.5, y0 = 0, y1 = 720) {
  const r = mulberry32(seed);
  let defs = '', h = '';
  cols.forEach((c, i) => { defs += rad(`${sid}bk${i}`, [[0, c, 0.95], [0.55, c, 0.4], [1, c, 0]]); });
  for (let i = 0; i < n; i++) {
    const rr = rmin + r() * (rmax - rmin);
    h += `<circle class="bk" style="animation-duration:${(5 + r() * 6).toFixed(1)}s;animation-delay:${(-r() * 8).toFixed(1)}s" cx="${n0(r() * 1280)}" cy="${n0(y0 + r() * (y1 - y0))}" r="${rr.toFixed(0)}" fill="url(#${sid}bk${i % cols.length})" opacity="${(op * (0.5 + r() * 0.5)).toFixed(2)}"/>`;
  }
  return `<defs>${defs}</defs>${h}`;
}

function shooting(sid, n, seed, col = '#fff') {
  const r = mulberry32(seed);
  let h = `<defs>${lin(sid + 'ss', [[0, col, 0], [1, col, 1]], 1, 0, 0, 1)}</defs>`;
  for (let i = 0; i < n; i++) {
    const x = n0(500 + r() * 780), y = n0(20 + r() * 300);
    h += `<line class="ss" style="animation-duration:${(7 + r() * 6).toFixed(1)}s;animation-delay:${(r() * 8).toFixed(1)}s" x1="${x + 110}" y1="${y - 55}" x2="${x}" y2="${y}" stroke="url(#${sid}ss)" stroke-width="2.4" stroke-linecap="round"/>`;
  }
  return h;
}

function aurora(sid, cols, baseY, seed) {
  const r = mulberry32(seed);
  let defs = '', h = '';
  cols.forEach((c, i) => {
    defs += lin(`${sid}au${i}`, [[0, c, 0], [0.5, c, 0.5], [1, c, 0]]);
    const y = baseY + i * 46, a = 60 + r() * 50;
    const p = `M-40 ${y} C 200 ${y - a} 420 ${y + a} 640 ${y - a / 2} S 1060 ${y + a} 1320 ${y - a / 3} L1320 ${y + 150} C 1060 ${y + 150 - a} 860 ${y + 150 + a} 640 ${y + 150} S 200 ${y + 150 + a} -40 ${y + 150}Z`;
    h += `<path class="sway" style="animation-duration:${(14 + i * 5)}s;animation-delay:${-i * 3}s" d="${p}" fill="url(#${sid}au${i})"/>`;
  });
  return `<defs>${defs}</defs>${h}`;
}

function cloudSea(y, col, op, seed, hi = null) {
  const r = mulberry32(seed);
  let h = '';
  for (let x = -80; x < 1360; x += 80 + r() * 70) {
    const rx = 100 + r() * 90, ry = 34 + r() * 34, cy = y + r() * 40;
    h += `<ellipse cx="${n0(x)}" cy="${n0(cy)}" rx="${n0(rx)}" ry="${n0(ry)}" fill="${col}" opacity="${op}"/>`;
    if (hi) h += `<ellipse cx="${n0(x)}" cy="${n0(cy - ry * 0.35)}" rx="${n0(rx * 0.8)}" ry="${n0(ry * 0.55)}" fill="${hi}" opacity="${op * 0.55}"/>`;
  }
  h += `<rect x="0" y="${y + 40}" width="1280" height="${720 - y}" fill="${col}" opacity="${op}"/>`;
  return h;
}

function sCloud(x, y, s, o, cls = 'drift') {
  const e = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`;
  return `<g class="${cls}" fill="#fff" opacity="${o}"><g transform="translate(${x} ${y}) scale(${s})">${e(0, 0, 90, 26)}${e(-50, -14, 44, 28)}${e(10, -26, 52, 32)}${e(56, -8, 40, 24)}</g></g>`;
}

function rays(sid, cx, cy, n, col, op, len = 1500, wfrac = 0.26) {
  const step = 360 / n, w = step * wfrac;
  let p = '';
  for (let i = 0; i < n; i++) {
    const a = ((i * step) * Math.PI) / 180, a1 = a - (w * Math.PI) / 180, a2 = a + (w * Math.PI) / 180;
    p += `<polygon points="${cx},${cy} ${n0(cx + len * Math.cos(a1))},${n0(cy + len * Math.sin(a1))} ${n0(cx + len * Math.cos(a2))},${n0(cy + len * Math.sin(a2))}" fill="url(#${sid}rg)"/>`;
  }
  return `<defs>${rad(sid + 'rg', [[0, col, op], [1, col, 0]], `gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${len}"`)}</defs><g class="spin" style="transform-origin:${cx}px ${cy}px;transform-box:view-box">${p}</g>`;
}

function speed(sid, n, seed, col, y0 = 60, y1 = 560) {
  const r = mulberry32(seed);
  let h = `<defs>${lin(sid + 'sp', [[0, col, 0.85], [1, col, 0]], 0, 0, 1, 0)}</defs>`;
  for (let i = 0; i < n; i++) {
    h += `<rect class="sp" style="animation-duration:${(0.7 + r() * 1.2).toFixed(2)}s;animation-delay:${(-r() * 2).toFixed(2)}s" x="${n0(r() * 1300)}" y="${n0(y0 + r() * (y1 - y0))}" width="${n0(160 + r() * 340)}" height="${(1 + r() * 2).toFixed(1)}" fill="url(#${sid}sp)"/>`;
  }
  return h;
}

function birds(n, seed, col = '#0b1330', yMin = 80, yMax = 360) {
  const r = mulberry32(seed);
  let h = '';
  for (let i = 0; i < n; i++) {
    const s = 0.7 + r() * 0.9;
    h += `<g transform="translate(0 ${n0(yMin + r() * (yMax - yMin))})"><g class="fly" style="animation-duration:${n0(26 + r() * 30)}s;animation-delay:${n0(-r() * 40)}s"><path transform="scale(${s.toFixed(2)})" d="M0 0 q8 -9 16 0 q8 -9 16 0" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round"/></g></g>`;
  }
  return h;
}

// 위에서 내려오는 스포트라이트 빔 (좌우로 천천히 스윙)
function spots(sid, list, wide = 110) {
  let defs = '', h = '';
  list.forEach(([x, col, op, dur, del, w], i) => {
    const ww = w || wide;
    defs += lin(`${sid}sl${i}`, [[0, col, op], [1, col, 0]]);
    h += `<polygon class="swing" style="transform-origin:${x}px -20px;transform-box:view-box;animation-duration:${dur}s;animation-delay:${del}s" points="${x - 7},-20 ${x + 7},-20 ${x + ww},800 ${x - ww},800" fill="url(#${sid}sl${i})"/>`;
  });
  return `<defs>${defs}</defs>${h}`;
}

function crowd(seed, y, stickCols) {
  const r = mulberry32(seed);
  let h = '';
  for (let row = 0; row < 2; row++) {
    const yy = y + row * 34 + (row ? -18 : 0), sc = row ? 0.78 : 1, fill = row ? '#0c0a1c' : '#04030a';
    for (let x = -20 + r() * 20; x < 1300; x += 40 + r() * 16) {
      if (x > 400 && x < 880) continue; // 하이웨이 + 키패드는 가리지 않음
      const hx = n0(x), up = r() < 0.55;
      h += `<circle cx="${hx}" cy="${n0(yy - 30 * sc)}" r="${n0(11 * sc)}" fill="${fill}"/><path d="M${hx - 16 * sc} 760 Q${hx - 17 * sc} ${n0(yy - 16 * sc)} ${hx} ${n0(yy - 16 * sc)} Q${hx + 17 * sc} ${n0(yy - 16 * sc)} ${hx + 16 * sc} 760Z" fill="${fill}"/>`;
      if (up && stickCols) {
        const c = stickCols[n0(r() * 99) % stickCols.length], ax = hx + n0((r() - 0.5) * 26);
        h += `<line x1="${hx + 8 * sc}" y1="${n0(yy - 10 * sc)}" x2="${ax}" y2="${n0(yy - 62 * sc)}" stroke="${fill}" stroke-width="${n0(7 * sc)}" stroke-linecap="round"/>` +
          `<rect class="ls" style="animation-delay:${(-r() * 3).toFixed(1)}s;animation-duration:${(1.2 + r() * 1.2).toFixed(1)}s" x="${ax - 2}" y="${n0(yy - 88 * sc)}" width="5" height="${n0(28 * sc)}" rx="2" fill="${c}"/>`;
      }
    }
  }
  return h;
}

function hills(color, base, amp, seed, op = 1, w = 160) {
  const r = mulberry32(seed);
  let d = `M-40 720 L-40 ${n0(base)}`;
  for (let x = -40; x < 1340; x += w) d += ` Q ${n0(x + w / 2)} ${n0(base - amp * (0.4 + r()))} ${n0(x + w)} ${n0(base - amp * 0.2 * r())}`;
  d += ' L1340 720Z';
  return `<path d="${d}" fill="${color}" opacity="${op}"/>`;
}

function sSkyline(color, seed, base, minH, maxH, opacity) {
  const r = mulberry32(seed);
  let h = '', x = -20;
  while (x < 1300) {
    const w = 46 + r() * 70, ht = minH + r() * (maxH - minH);
    h += `<rect x="${n0(x)}" y="${n0(base - ht)}" width="${n0(w)}" height="${n0(ht + 400)}" fill="${color}" opacity="${opacity}"/>`;
    x += w + 3 + r() * 8;
  }
  return h;
}

function heart(x, y, s, col, op = 0.8, rot = 0) {
  return `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 18C-26 0 -12 -18 0 -6C12 -18 26 0 0 18Z" fill="${col}" opacity="${op}"/>`;
}

function flower(sid, cx, cy, n, len, w, c1, c2, op = 0.55) {
  let h = `<defs>${rad(sid + 'fl', [[0, c1, op], [1, c2, op * 0.55]], 'cx="50%" cy="100%" r="100%"')}</defs><g class="spin2" style="transform-origin:${cx}px ${cy}px;transform-box:view-box">`;
  for (let i = 0; i < n; i++) h += `<ellipse cx="${cx}" cy="${cy - len / 2}" rx="${w}" ry="${len / 2}" transform="rotate(${(i * 360) / n} ${cx} ${cy})" fill="url(#${sid}fl)"/>`;
  return h + '</g>';
}

function branch(seed, flip, col = '#3a1530', blossom = ['#ffb3cf', '#ff8fb8', '#ffd6e6']) {
  const r = mulberry32(seed);
  const pts = [[-30, 60], [90, 86], [200, 56], [330, 110], [440, 80]];
  const X = (x) => (flip ? 1280 - x : x);
  const d = 'M' + pts.map(([x, y]) => `${X(x)} ${y}`).join(' L');
  let h = `<path d="${d}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
  for (let k = 0; k < 26; k++) {
    const p = pts[k % pts.length], bx = X(p[0] + (r() - 0.5) * 120), by = p[1] + (r() - 0.2) * 90, s = 6 + r() * 10;
    h += `<g opacity="${(0.65 + r() * 0.35).toFixed(2)}">`;
    for (let q = 0; q < 5; q++) { const a = (q * 72 * Math.PI) / 180; h += `<circle cx="${(bx + Math.cos(a) * s * 0.9).toFixed(1)}" cy="${(by + Math.sin(a) * s * 0.9).toFixed(1)}" r="${(s * 0.7).toFixed(1)}" fill="${blossom[q % blossom.length]}"/>`; }
    h += `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${(s * 0.35).toFixed(1)}" fill="#fff2a8"/></g>`;
  }
  return h;
}

function cup(x, y, s, col, sleeve = '#c98a2b') {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 0L22 0L16 58L-16 58Z" fill="${col}"/><path d="M-19 16L19 16L17 38L-17 38Z" fill="${sleeve}"/><ellipse cx="0" cy="0" rx="24" ry="5" fill="${col}"/><ellipse cx="0" cy="0" rx="20" ry="3.2" fill="#00000030"/></g>`;
}

function notes(n, seed, col) {
  const r = mulberry32(seed);
  let h = '';
  for (let i = 0; i < n; i++) {
    const x = n0(r() * 1280), y0 = n0(120 + r() * 600);
    h += `<g transform="translate(${x} ${y0})"><g class="nt" style="--y0:${y0}px;animation-duration:${(8 + r() * 8).toFixed(1)}s;animation-delay:${(-r() * 14).toFixed(1)}s"><path d="M0 0V-22 M0 -22 q8 2 10 10 M0 0 a6 4.5 -20 1 1 -0.1 0" fill="${col}" stroke="${col}" stroke-width="3" stroke-linecap="round" opacity=".75"/></g></g>`;
  }
  return h;
}

function bulbs(sid, y, sag, col, n = 14) {
  let h = `<defs>${rad(sid + 'bl', [[0, col, 1], [0.5, col, 0.45], [1, col, 0]])}</defs><path d="M-10 ${y} Q640 ${y + sag} 1290 ${y}" fill="none" stroke="#2a1608" stroke-width="2.5"/>`;
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = -10 + t * 1300, yy = y + 2 * (1 - t) * t * sag;
    h += `<circle class="tw" style="animation-delay:${(i * 0.3).toFixed(1)}s" cx="${n0(x)}" cy="${n0(yy + 8)}" r="14" fill="url(#${sid}bl)"/><circle cx="${n0(x)}" cy="${n0(yy + 8)}" r="3.4" fill="#fff6d0"/>`;
  }
  return h;
}

function drip(seed, n) { // 빗줄기 (애니메이션이 꺼진 저사양 모드에서는 숨김)
  const r = mulberry32(seed);
  let h = '';
  for (let i = 0; i < n; i++) { const x = n0(r() * 1300); h += `<line class="rain" style="animation-duration:${(0.8 + r() * 0.7).toFixed(2)}s;animation-delay:${(-r()).toFixed(2)}s" x1="${x}" y1="740" x2="${x - 6}" y2="712" stroke="#a9c8ff" stroke-opacity=".4" stroke-width="1.3"/>`; }
  return h;
}

// ---------- 장면 정의 ----------
const S = {};
const add = (id, bg, svg) => { S[id] = { bg, svg }; };

// 1) IU - Blueming : 설레는 봄, 푸른빛 + 꽃 피어남
add('blueming-dawn',
  'linear-gradient(to bottom,#2f3a9e 0,#6c6fd6 38%,#e59ac4 74%,#ffcfc4 100%)',
  `<defs>${rad('bdn-m', [[0, '#fff7ea', 1], [1, '#fff7ea', 0]])}</defs>
   ${sStars(40, 31, 200, '#fff', 1.2)}
   ${sRings('#ffd6ea', '#b9c3ff', 0.4, 0.35)}
   <circle cx="640" cy="240" r="230" fill="url(#bdn-m)" opacity=".25"/><circle cx="640" cy="240" r="46" fill="#fff6e4"/>
   ${bokeh('bdn', 16, 3, ['#ffb7d5', '#b9c3ff'], 26, 70, 0.4, 150, 620)}
   ${fall(14, 5, ['#ffc4dc', '#ffe0ee'], 'petal', 0.9)}
   ${hills('#3b2d7a', 560, 70, 4, 0.8)}${hills('#241a55', 640, 50, 9, 0.95)}
   ${sFade('bdn', 400)}`);
add('blueming-petals',
  'linear-gradient(to bottom,#3b63d6 0,#7aa2ee 40%,#f3b3d4 82%,#ffdce6 100%)',
  `${sRings('#ffffff', '#ffc2dd', 0.45, 0.4)}
   ${sCloud(180, 330, 1.2, 0.5)}${sCloud(1110, 340, 1.3, 0.5, 'drift d2')}
   ${bokeh('bpt', 20, 7, ['#ffd0e4', '#ffffff', '#c3d2ff'], 20, 60, 0.45, 100, 640)}
   ${branch(11, false)}${branch(12, true)}
   ${fall(42, 8, ['#ffb3cf', '#ff8fb8', '#ffe0ee', '#fff'], 'petal', 1)}
   ${sFade('bpt', 400)}`);
add('blueming-bloom',
  'radial-gradient(ellipse 620px 420px at 640px 280px,rgba(255,120,190,.65),rgba(255,120,190,0)),linear-gradient(to bottom,#2a2a9a 0,#8b3fc7 46%,#ff7ab3 100%)',
  `${sRings('#ffd0ea', '#9fc3ff', 0.5, 0.4)}
   ${flower('bbl', 640, 270, 10, 300, 52, '#ffe1f0', '#ff6fb0', 0.5)}
   ${flower('bbl2', 640, 270, 6, 190, 36, '#ffffff', '#b9a6ff', 0.55)}
   <circle cx="640" cy="270" r="26" fill="#fff0a8" opacity=".9"/>
   ${bokeh('bbl', 24, 15, ['#ff9fd0', '#9fc3ff', '#ffffff'], 24, 72, 0.5, 60, 660)}
   ${heart(210, 250, 1.6, '#ff9fd0', 0.55, -14)}${heart(1060, 190, 2, '#ffd0ea', 0.5, 12)}${heart(1130, 430, 1.2, '#9fc3ff', 0.5, -8)}${heart(120, 470, 1.1, '#ffd0ea', 0.45, 10)}
   ${fall(56, 21, ['#ffc4dc', '#ffffff', '#ff8fb8'], 'petal', 1.1, 6, 7)}
   ${sFade('bbl', 420)}`);

// 2) Lost Sky - Dreams : 꿈결, 떠다니는 빛
add('dreams-night',
  'linear-gradient(to bottom,#03061c 0,#0a1a45 55%,#07060d 100%)',
  `${sStars(120, 41, 460)}
   ${aurora('dna', ['#33ffc4', '#4d8bff'], 100, 2)}
   <circle cx="190" cy="132" r="32" fill="#e8f0ff" opacity=".9"/><circle cx="203" cy="123" r="28" fill="#0a1a45"/>
   ${sRings('#4dffd0', '#7aa8ff', 0.3, 0.28)}
   ${shooting('dns', 2, 6)}
   ${hills('#060a22', 640, 60, 5, 0.95)}
   ${sFade('dna', 440)}`);
add('dreams-nebula',
  'radial-gradient(ellipse 560px 360px at 28% 30%,rgba(255,80,200,.4),rgba(255,80,200,0)),radial-gradient(ellipse 620px 400px at 78% 55%,rgba(60,120,255,.45),rgba(60,120,255,0)),linear-gradient(to bottom,#0b0626 0,#1d0c52 60%,#07060d 100%)',
  `${sStars(150, 43, 560)}
   ${sRings('#c06bff', '#5fc8ff', 0.38, 0.32)}
   <g class="drift d3"><ellipse cx="640" cy="260" rx="380" ry="90" fill="none" stroke="#d9a8ff" stroke-opacity=".28" stroke-width="2" transform="rotate(-12 640 260)"/><ellipse cx="640" cy="260" rx="300" ry="60" fill="none" stroke="#7fd4ff" stroke-opacity=".3" stroke-width="1.5" transform="rotate(-12 640 260)" stroke-dasharray="4 10"/></g>
   ${bokeh('dnb', 14, 8, ['#ff7ad9', '#7aa8ff'], 40, 110, 0.35, 80, 600)}
   <g class="drift"><path d="M210 520 L330 520 L300 560 L240 560Z" fill="#150a3a"/><ellipse cx="270" cy="520" rx="60" ry="9" fill="#2a1766"/></g>
   <g class="drift d2"><path d="M940 440 L1060 440 L1030 480 L970 480Z" fill="#150a3a"/><ellipse cx="1000" cy="440" rx="60" ry="9" fill="#2a1766"/></g>
   ${shooting('dnb', 3, 9, '#ffd6ff')}
   ${sFade('dnb', 430)}`);
add('dreams-ascend',
  'linear-gradient(to bottom,#1a2fb8 0,#4a6cf0 30%,#7fe0ff 66%,#d8fff4 100%)',
  `${rays('dac', 640, 260, 14, '#ffffff', 0.38)}
   ${sRings('#ffffff', '#b8ecff', 0.55, 0.45)}
   <circle cx="640" cy="260" r="70" fill="#fff" opacity=".9"/><circle cx="640" cy="260" r="150" fill="#fff" opacity=".15"/>
   <g class="drift"><path d="M120 330 L420 330 L360 410 L300 450 L240 410Z" fill="#2c3f9e"/><ellipse cx="270" cy="330" rx="150" ry="22" fill="#6fe0b0"/><path d="M270 450 L270 560" stroke="#bff6ff" stroke-width="4" stroke-opacity=".7"/></g>
   <g class="drift d2"><path d="M880 280 L1180 280 L1120 360 L1060 400 L1000 360Z" fill="#2c3f9e"/><ellipse cx="1030" cy="280" rx="150" ry="22" fill="#6fe0b0"/><path d="M1030 400 L1030 520" stroke="#bff6ff" stroke-width="4" stroke-opacity=".7"/></g>
   ${shooting('dac', 3, 12)}
   ${bokeh('dac', 18, 14, ['#ffffff', '#b8ecff', '#c9b8ff'], 14, 40, 0.5, 40, 560)}
   ${cloudSea(560, '#3a53c8', 0.8, 3, '#8fb4ff')}
   ${sFade('dac', 380)}`);

// 3) Duggy - Running In The Sky : 구름 위를 달리는 속도감
add('rits-dusk',
  'linear-gradient(to bottom,#050a2a 0,#16256e 50%,#3b3a96 74%,#ff9c6b 100%)',
  `${sStars(90, 51, 340)}
   ${sRings('#8ab4ff', '#ffb27a', 0.35, 0.3)}
   <ellipse cx="640" cy="560" rx="360" ry="40" fill="#ff9c6b" opacity=".35"/>
   ${birds(5, 4, '#0a1030')}
   ${cloudSea(520, '#26307c', 0.95, 5, '#5b66c4')}${cloudSea(600, '#171d55', 1, 6)}
   ${sFade('rda', 450)}`);
add('rits-sunrise',
  'linear-gradient(to bottom,#2a2d9c 0,#8b49b8 34%,#ff7a6b 62%,#ffc866 100%)',
  `${rays('rsr', 640, 470, 16, '#fff2b0', 0.5)}
   ${sRings('#ffe9a6', '#ff9aa8', 0.45, 0.4)}
   <circle cx="640" cy="470" r="140" fill="#fff0b0" opacity=".95"/><circle cx="640" cy="470" r="230" fill="#ffd27a" opacity=".22"/>
   ${sCloud(220, 230, 1.1, 0.42)}${sCloud(1080, 200, 1, 0.42, 'drift d2')}
   ${birds(7, 8, '#3a1850')}
   ${speed('rsr', 10, 3, '#ffffff', 80, 440)}
   ${cloudSea(500, '#c4528a', 0.92, 9, '#ffb08a')}${cloudSea(590, '#6d2a77', 1, 10)}
   ${sFade('rsr', 430)}`);
add('rits-zenith',
  'linear-gradient(to bottom,#0a52d6 0,#2d8cff 40%,#8fd4ff 80%,#e6f7ff 100%)',
  `${rays('rzn', 640, 230, 20, '#ffffff', 0.5)}
   ${sRings('#ffffff', '#cdeaff', 0.6, 0.5)}
   <circle cx="640" cy="230" r="86" fill="#fffbe0"/><circle cx="640" cy="230" r="190" fill="#fffbe0" opacity=".22"/>
   ${sCloud(150, 360, 1.5, 0.75, 'drift')}${sCloud(1140, 330, 1.6, 0.75, 'drift d2')}${sCloud(640, 470, 2, 0.5, 'drift d3')}
   ${speed('rzn', 26, 5, '#ffffff', 40, 600)}
   ${birds(6, 11, '#12306e')}
   ${cloudSea(600, '#4c8de0', 0.85, 12, '#bfe3ff')}
   ${sFade('rzn', 400)}`);

// 4) Rewrite the Stars : 별과 서커스, 운명을 다시 쓰는 연인
add('rts-twilight',
  'linear-gradient(to bottom,#0b0b3b 0,#27195e 52%,#5a2a73 82%,#a24a78 100%)',
  `${sStars(110, 61, 420)}
   <circle cx="196" cy="140" r="36" fill="#ffeab0" opacity=".95"/><circle cx="211" cy="130" r="31" fill="#27195e"/>
   ${sRings('#ffd27a', '#b9a6ff', 0.38, 0.3)}
   <path d="M130 600 L260 470 L390 600Z" fill="#12082e"/><rect x="255" y="436" width="3" height="40" fill="#12082e"/><path d="M258 440 l34 10 l-34 10z" fill="#ff2a6d"/>
   <path d="M850 600 L960 500 L1070 600Z" fill="#12082e"/>
   ${bulbs('rtb', 330, 70, '#ffcf7a', 12)}
   ${bokeh('rtt', 18, 5, ['#ffe29a', '#ffb7e0'], 6, 16, 0.7, 360, 640)}
   ${hills('#0c0522', 650, 40, 6, 1)}
   ${sFade('rtt', 440)}`);
add('rts-constellations',
  'radial-gradient(ellipse 600px 380px at 50% 40%,rgba(255,200,120,.2),rgba(255,200,120,0)),linear-gradient(to bottom,#060632 0,#1a1156 55%,#07060d 100%)',
  `${sStars(170, 63, 600, '#fff', 1.4)}
   ${sRings('#ffd27a', '#8ab4ff', 0.4, 0.32)}
   <g stroke="#ffd27a" stroke-opacity=".7" stroke-width="1.6" fill="none"><path d="M260 200 L340 150 L420 190 L470 140"/><path d="M340 150 L360 250 L300 300"/><path d="M880 180 L950 220 L1010 160 L1090 200"/><path d="M950 220 L930 300 L990 340"/></g>
   <g fill="#fff4c8">${[[260, 200], [340, 150], [420, 190], [470, 140], [360, 250], [300, 300], [880, 180], [950, 220], [1010, 160], [1090, 200], [930, 300], [990, 340]].map(([x, y]) => `<circle class="tw" cx="${x}" cy="${y}" r="4.5"/><circle cx="${x}" cy="${y}" r="11" opacity=".18"/>`).join('')}</g>
   ${bulbs('rtc', 70, 50, '#ffcf7a', 14)}
   ${shooting('rtc', 4, 8, '#fff2c0')}
   ${bokeh('rtc', 10, 2, ['#ffcf7a', '#ff9acb'], 30, 80, 0.25, 300, 650)}
   ${sFade('rtc', 450)}`);
add('rts-spectacle',
  'radial-gradient(ellipse 540px 420px at 640px 250px,rgba(255,210,110,.55),rgba(255,210,110,0)),linear-gradient(to bottom,#3a0624 0,#7a0f3b 46%,#1a0614 100%)',
  `${rays('rsp', 640, 250, 18, '#ffe29a', 0.5)}
   ${sRings('#ffd27a', '#ff6fa8', 0.55, 0.45)}
   <polygon points="640,110 664,214 770,214 684,276 716,376 640,314 564,376 596,276 510,214 616,214" fill="#ffe29a" opacity=".92"/>
   ${spots('rsp', [[420, '#fff2c0', 0.4, 7, 0], [860, '#ffc4e0', 0.4, 8, -2], [640, '#fff2c0', 0.32, 9, -4, 90]], 90)}
   <path d="M0 0H210Q150 220 110 460Q70 640 0 720Z" fill="#7a0a2a"/><path d="M0 0H210Q150 220 110 460Q70 640 0 720" fill="none" stroke="#ffd27a" stroke-width="3"/>
   <path d="M1280 0H1070Q1130 220 1170 460Q1210 640 1280 720Z" fill="#7a0a2a"/><path d="M1280 0H1070Q1130 220 1170 460Q1210 640 1280 720" fill="none" stroke="#ffd27a" stroke-width="3"/>
   ${fall(50, 17, ['#ffd27a', '#ff6fa8', '#fff2c0', '#ffffff'], 'rect', 1.4, 5, 6)}
   ${bulbs('rsp', 20, 26, '#fff0b0', 14)}
   ${sFade('rsp', 440)}`);

// 5) Benson Boone - Beautiful Things : 잃을까 두려운 소중함, 황금빛 노을
add('bt-window',
  'linear-gradient(to bottom,#14122a 0,#2b2442 55%,#3a2c3c 100%)',
  `<defs>${lin('btw-s', [[0, '#ffe2a8', 0.55], [1, '#ffe2a8', 0]], 0, 0, 1, 1)}${lin('btw-g', [[0, '#ffd9a0'], [1, '#e8a86a']])}</defs>
   ${sRings('#ffd9a0', '#c9b3ff', 0.28, 0.24)}
   <polygon points="530,300 750,300 1010,720 330,720" fill="url(#btw-s)"/>
   <rect x="530" y="40" width="220" height="270" fill="url(#btw-g)" opacity=".95"/>
   <g stroke="#1b1630" stroke-width="7"><path d="M640 40V310M530 130H750M530 220H750"/><rect x="526" y="36" width="228" height="278" fill="none"/></g>
   <path d="M340 0 Q400 200 360 520 L300 520 Q330 240 290 0Z" fill="#171127" opacity=".9"/><path d="M940 0 Q880 200 920 520 L980 520 Q950 240 990 0Z" fill="#171127" opacity=".9"/>
   ${bokeh('btw', 26, 9, ['#ffd9a0', '#ffe9c8'], 3, 9, 0.9, 200, 640)}
   <rect x="0" y="600" width="1280" height="120" fill="#120d1d" opacity=".9"/>
   ${sFade('btw', 460)}`);
add('bt-golden',
  'linear-gradient(to bottom,#3b2a6e 0,#b5557a 34%,#ff9b5e 62%,#ffd98a 100%)',
  `${rays('btg', 640, 440, 12, '#ffe7b0', 0.4, 1400, 0.2)}
   ${sRings('#ffe0a0', '#ff9ab0', 0.4, 0.35)}
   <circle cx="640" cy="440" r="110" fill="#fff0c0" opacity=".95"/><circle cx="640" cy="440" r="210" fill="#ffd98a" opacity=".25"/>
   ${bokeh('btg', 22, 14, ['#ffe7b0', '#ffb98a', '#ffffff'], 4, 22, 0.8, 120, 560)}
   <circle cx="390" cy="360" r="18" fill="#ffe7b0" opacity=".28"/><circle cx="300" cy="330" r="10" fill="#ffe7b0" opacity=".22"/><circle cx="210" cy="300" r="26" fill="#ffd0a0" opacity=".16"/>
   ${hills('#6b3556', 560, 70, 2, 0.95)}${hills('#3a1a40', 620, 60, 7, 1)}${hills('#1c0b24', 680, 40, 3, 1)}
   ${sFade('btg', 440)}`);
add('bt-burst',
  'radial-gradient(ellipse 560px 420px at 640px 300px,rgba(255,170,90,.7),rgba(255,170,90,0)),linear-gradient(to bottom,#3a0b3e 0,#a3274e 48%,#ff7a4a 100%)',
  `${rays('bbu', 640, 300, 22, '#ffd8a0', 0.55)}
   ${sRings('#ffd8a0', '#ff8fb0', 0.6, 0.5)}
   <circle cx="640" cy="300" r="120" fill="#fff2d0" opacity=".9"/><circle cx="640" cy="300" r="260" fill="#ffb070" opacity=".22"/>
   ${bokeh('bbu', 30, 4, ['#ffd8a0', '#ff9ab0', '#ffffff'], 18, 70, 0.55, 40, 680)}
   ${fall(46, 7, ['#ffd8a0', '#ffb070', '#ff9ab0'], 'rect', 1.2, 5, 6)}
   ${sSkyline('#2a0a2e', 5, 660, 40, 150, 0.95)}
   ${sFade('bbu', 440)}`);

// 6) Anna Kendrick - Cups : 소박하고 경쾌한 어쿠스틱, 빈티지 틸 + 머스터드
add('cups-table',
  'linear-gradient(to bottom,#2c4a4e 0,#3f6a68 55%,#2a3d3b 100%)',
  `<defs><pattern id="cut-p" width="46" height="46" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="4" fill="#f4e4bc" opacity=".12"/><circle cx="35" cy="35" r="4" fill="#f4e4bc" opacity=".12"/></pattern>${rad('cut-sp', [[0, '#ffe9b0', 0.7], [1, '#ffe9b0', 0]])}</defs>
   <rect width="1280" height="720" fill="url(#cut-p)"/>
   ${sRings('#f4d489', '#8fd6c8', 0.35, 0.3)}
   <ellipse cx="640" cy="300" rx="420" ry="260" fill="url(#cut-sp)"/>
   <rect x="0" y="640" width="1280" height="80" fill="#4a2d1a"/><rect x="0" y="640" width="1280" height="7" fill="#6d4426"/>
   ${cup(235, 592, 1.2, '#f6efe0')}${cup(120, 604, 0.95, '#e0a73d')}${cup(345, 608, 0.9, '#e86f5a')}${cup(1050, 592, 1.2, '#f6efe0')}${cup(940, 606, 0.9, '#e0a73d')}${cup(1165, 604, 0.95, '#e86f5a')}
   ${notes(8, 3, '#f4d489')}
   ${sFade('cut', 480)}`);
add('cups-stage',
  'linear-gradient(to bottom,#1c6a72 0,#2a8d8d 60%,#14484e 100%)',
  `<defs><pattern id="cus-p" width="60" height="10" patternUnits="userSpaceOnUse"><rect width="30" height="10" fill="#ffffff" opacity=".07"/></pattern>${rad('cus-sp', [[0, '#fff0b8', 0.8], [1, '#fff0b8', 0]])}</defs>
   <rect width="1280" height="720" fill="url(#cus-p)" transform="rotate(90 640 360)"/>
   ${sRings('#ffd27a', '#ffffff', 0.45, 0.35)}
   <circle cx="640" cy="260" r="250" fill="url(#cus-sp)"/>
   ${[0, 1, 2, 3, 4, 5, 6].map((i) => cup(180 + i * 150, 560 + (i % 2) * 14, 1.1, ['#f6efe0', '#e0a73d', '#e86f5a'][i % 3])).join('')}
   <rect x="0" y="640" width="1280" height="80" fill="#0d2f33"/><rect x="0" y="634" width="1280" height="7" fill="#f0b540"/>
   ${notes(12, 8, '#fff0b8')}
   ${sFade('cus', 470)}`);
add('cups-party',
  'linear-gradient(135deg,#e86f5a 0,#f0b540 34%,#2a9d8f 70%,#264d7a 100%)',
  `${rays('cpy', 640, 260, 16, '#fff6d0', 0.4)}
   ${sRings('#ffffff', '#fff0b8', 0.6, 0.5)}
   <circle cx="640" cy="260" r="150" fill="#fff6d0" opacity=".28"/>
   <g class="spin2" style="transform-origin:640px 260px;transform-box:view-box">${Array.from({ length: 8 }, (_, i) => { const a = (i * 45 * Math.PI) / 180; return cup(640 + Math.cos(a) * 190, 255 + Math.sin(a) * 190, 1, ['#f6efe0', '#e0a73d', '#e86f5a', '#2a9d8f'][i % 4]); }).join('')}</g>
   ${fall(60, 33, ['#ffffff', '#fff0b8', '#ff8f7a', '#7fe0d0', '#264d7a'], 'rect', 1.5, 4, 5)}
   ${notes(14, 5, '#ffffff')}
   ${sFade('cpy', 450, 0.9)}`);

// 7) DAY6 - 한 페이지가 될 수 있게 : 함께한 기억, 넘겨 온 페이지들
add('d6p-night',
  'linear-gradient(to bottom,#0a1230 0,#162b57 55%,#10172e 100%)',
  `${sRings('#8ab4ff', '#ffcf7a', 0.28, 0.25)}
   ${sSkyline('#0b1330', 9, 560, 60, 230, 1)}
   ${bokeh('dpn', 34, 6, ['#ffcf7a', '#ff9acb', '#8ab4ff'], 10, 34, 0.7, 340, 640)}
   ${drip(3, 80)}
   <rect x="0" y="0" width="1280" height="720" fill="#0a1230" opacity=".12"/>
   ${sFade('dpn', 470)}`);
add('d6p-pages',
  'linear-gradient(to bottom,#3a2a66 0,#a35a88 42%,#ff9a78 78%,#ffd6a0 100%)',
  `${sRings('#ffe9c8', '#ffb7d0', 0.42, 0.36)}
   <circle cx="640" cy="280" r="190" fill="#ffe9c8" opacity=".18"/>
   ${fall(36, 12, ['#fff6e4', '#ffe6c8', '#ffd0d8', '#fff'], 'page', 1.5, 8, 9)}
   ${bokeh('dpp', 16, 9, ['#ffe9c8', '#ffb7d0'], 18, 60, 0.4, 80, 600)}
   ${hills('#5a2f66', 600, 50, 3, 0.9)}${hills('#2d1747', 660, 40, 8, 1)}
   ${sFade('dpp', 450)}`);
add('d6p-together',
  'radial-gradient(ellipse 560px 420px at 640px 300px,rgba(255,236,170,.65),rgba(255,236,170,0)),linear-gradient(to bottom,#2a3fb8 0,#6f7be0 40%,#ffb0a8 82%,#ffe6b8 100%)',
  `${rays('dpt', 640, 300, 18, '#fff4c8', 0.5)}
   ${sRings('#ffffff', '#ffe6b8', 0.55, 0.45)}
   <circle cx="640" cy="300" r="90" fill="#fffbe6" opacity=".92"/>
   ${fall(60, 14, ['#ffffff', '#fff2d8', '#ffe0e8', '#d8e6ff'], 'page', 1.7, 5, 6)}
   ${bokeh('dpt', 26, 3, ['#ffe6b8', '#ffffff', '#ffb0c8'], 16, 56, 0.55, 40, 680)}
   ${sSkyline('#2b2f7a', 3, 680, 40, 120, 0.9)}
   ${sFade('dpt', 460)}`);

// 8) DAY6 - Welcome to the Show : 공연장, 무대 조명과 환호
add('wts-backstage',
  'radial-gradient(ellipse 360px 520px at 640px 520px,rgba(255,226,170,.28),rgba(255,226,170,0)),linear-gradient(to bottom,#06040e 0,#110a22 60%,#04030a 100%)',
  `${spots('wbs', [[640, '#ffe9bd', 0.7, 9, 0, 150]], 150)}
   ${sRings('#ff6f8f', '#7fb0ff', 0.28, 0.24)}
   <path d="M0 0H170Q120 260 90 520L0 720Z" fill="#4a0a1e"/><path d="M1280 0H1110Q1160 260 1190 520L1280 720Z" fill="#4a0a1e"/>
   <g fill="#04030a"><rect x="632" y="360" width="16" height="250"/><rect x="600" y="600" width="80" height="12"/><ellipse cx="640" cy="352" rx="14" ry="22"/></g>
   <ellipse cx="640" cy="640" rx="280" ry="38" fill="#ffe9bd" opacity=".22"/>
   ${bulbs('wbs', 40, 24, '#ffd27a', 16)}
   ${sStars(30, 3, 300, '#ffe9bd', 1)}
   ${sFade('wbs', 520, 0.8)}`);
add('wts-lights',
  'linear-gradient(to bottom,#07061a 0,#150b34 62%,#07060d 100%)',
  `${sRings('#ff4fa8', '#4fe0ff', 0.4, 0.34)}
   ${spots('wls', [[180, '#4fe0ff', 0.55, 6, 0], [420, '#ff4fa8', 0.55, 7, -2], [860, '#ffd04f', 0.55, 6.5, -3], [1100, '#8f6bff', 0.55, 7.5, -1]], 100)}
   <rect x="0" y="0" width="1280" height="26" fill="#0c0820"/><g fill="#0c0820"><rect x="0" y="24" width="1280" height="6"/></g>
   ${[100, 340, 580, 700, 940, 1180].map((x, i) => `<circle cx="${x}" cy="22" r="11" fill="${['#4fe0ff', '#ff4fa8', '#ffd04f'][i % 3]}"/>`).join('')}
   ${crowd(7, 640, ['#4fe0ff', '#ffd04f', '#ff4fa8', '#a8ff7a'])}
   ${bokeh('wls', 12, 2, ['#ff4fa8', '#4fe0ff'], 26, 80, 0.28, 120, 560)}
   ${sFade('wls', 520, 0.55)}`);
add('wts-showtime',
  'radial-gradient(ellipse 620px 440px at 640px 300px,rgba(255,240,200,.75),rgba(255,240,200,0)),linear-gradient(to bottom,#23063a 0,#6a0f6a 44%,#ff4f8f 100%)',
  `${rays('wsh', 640, 330, 24, '#fff0c0', 0.6)}
   ${sRings('#ffe9a6', '#4fe0ff', 0.7, 0.55)}
   ${spots('wsh', [[160, '#4fe0ff', 0.7, 3.5, 0], [420, '#ff4fa8', 0.7, 4, -1], [860, '#ffd04f', 0.7, 3.8, -2], [1120, '#8f6bff', 0.7, 4.2, -1]], 110)}
   <circle cx="640" cy="330" r="110" fill="#fff6d8" opacity=".85"/>
   ${fall(70, 19, ['#ffe9a6', '#4fe0ff', '#ff4fa8', '#ffffff'], 'rect', 1.4, 3, 4)}
   ${crowd(11, 620, ['#4fe0ff', '#ffd04f', '#ff4fa8', '#ffffff'])}
   ${bokeh('wsh', 16, 5, ['#fff0c0', '#ff9acb', '#4fe0ff'], 24, 80, 0.4, 100, 560)}
   ${sFade('wsh', 540, 0.5)}`);

export const SCENES = S;
