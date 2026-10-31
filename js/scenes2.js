// 곡 전용 배경 장면 2차분: FADED, Shape of You, Sugar, IDGAF, Dangerously, I Ain't Worried,
// Stay at Your House, Spectre, Understand, Out of Reach.  (scenes.js 의 부품 H 를 재사용)
import { mulberry32 } from './util.js';
import { H } from './scenes.js';

export const SCENES2 = (() => {
  const { n0, lin, rad, sFade, sRings, sStars, fall, bokeh, shooting, sCloud, rays, speed, spots, hills, sSkyline, heart, bulbs, drip, cloudSea, notes, crowd } = { ...H };
  const S = {};
  const add = (id, bg, svg) => { S[id] = { bg, svg }; };

  // ---------- 새 부품 ----------
  const fog = (sid, n, seed, col, y0, y1, op = 0.25) => {
    const r = mulberry32(seed);
    let h = `<defs>${rad(sid + 'fg', [[0, col, 0.8], [1, col, 0]])}</defs>`;
    for (let i = 0; i < n; i++) {
      h += `<ellipse class="drift ${['', 'd2', 'd3'][i % 3]}" cx="${n0(r() * 1280)}" cy="${n0(y0 + r() * (y1 - y0))}" rx="${n0(170 + r() * 190)}" ry="${n0(36 + r() * 56)}" fill="url(#${sid}fg)" opacity="${(op * (0.6 + r() * 0.6)).toFixed(2)}"/>`;
    }
    return h;
  };
  const ocean = (sid, y, top, bot, wave) => {
    let h = `<defs>${lin(sid + 'oc', [[0, top], [1, bot]])}</defs><rect x="0" y="${y}" width="1280" height="${720 - y}" fill="url(#${sid}oc)"/>`;
    for (let i = 0; i < 7; i++) {
      let d = `M-40 ${y + 16 + i * 26}`;
      for (let x = -40; x < 1340; x += 90) d += ` q 22 ${i % 2 ? -7 : 7} 45 0 t 45 0`;
      h += `<path class="sway" style="animation-duration:${10 + i * 3}s;animation-delay:${-i * 2}s" d="${d}" fill="none" stroke="${wave}" stroke-opacity="${(0.1 + i * 0.035).toFixed(2)}" stroke-width="2"/>`;
    }
    return h;
  };
  const moonPath = (cx, y0, w, col) => {
    let h = '';
    for (let i = 0; i < 12; i++) h += `<rect x="${n0(cx - (w * (1 - i * 0.06)) / 2)}" y="${n0(y0 + i * 17)}" width="${n0(w * (1 - i * 0.06))}" height="4" fill="${col}" opacity="${(0.55 - i * 0.04).toFixed(2)}"/>`;
    return h;
  };
  const lighthouse = (sid, x, y, col) => `<defs>${lin(sid + 'lb', [[0, col, 0.7], [1, col, 0]], 0, 0, 1, 0)}</defs>
    <polygon class="swing" style="transform-origin:${x}px ${y - 128}px;transform-box:view-box;animation-duration:8s" points="${x},${y - 128} ${x - 1000},${y - 230} ${x - 1000},${y - 30}" fill="url(#${sid}lb)" transform="rotate(0)"/>
    <polygon points="${x - 14},${y} ${x + 14},${y} ${x + 9},${y - 118} ${x - 9},${y - 118}" fill="#03101a"/><rect x="${x - 13}" y="${y - 134}" width="26" height="16" fill="#03101a"/><circle cx="${x}" cy="${y - 128}" r="5" fill="${col}"/>`;
  const discoBall = (sid, cx, cy, r) => {
    let h = `<defs>${rad(sid + 'db', [[0, '#ffffff'], [0.5, '#b8b8d8'], [1, '#4a4a78']], 'cx="35%" cy="30%" r="75%"')}</defs><line x1="${cx}" y1="0" x2="${cx}" y2="${cy - r}" stroke="#aaa" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${sid}db)"/>`;
    for (let i = -3; i <= 3; i++) h += `<ellipse cx="${cx}" cy="${cy}" rx="${n0(Math.abs(i) * r / 3.4 + 1)}" ry="${r}" fill="none" stroke="#2a2a58" stroke-opacity=".5"/>`;
    for (let j = -2; j <= 2; j++) h += `<line x1="${cx - r}" y1="${cy + j * r / 2.6}" x2="${cx + r}" y2="${cy + j * r / 2.6}" stroke="#2a2a58" stroke-opacity=".5"/>`;
    return h;
  };
  const lightDots = (n, seed, cols, y0 = 0, y1 = 720) => {
    const r = mulberry32(seed);
    let h = '';
    for (let i = 0; i < n; i++) h += `<rect class="tw" style="animation-delay:${(r() * 3).toFixed(1)}s" x="${n0(r() * 1280)}" y="${n0(y0 + r() * (y1 - y0))}" width="${n0(5 + r() * 9)}" height="${n0(5 + r() * 9)}" fill="${cols[i % cols.length]}" opacity="${(0.4 + r() * 0.5).toFixed(2)}" transform="rotate(${n0(r() * 90)})"/>`;
    return h;
  };
  const palm = (x, base, hgt, flip, col) => {
    const f = flip ? -1 : 1;
    const tx = x + 30 * f, ty = base - hgt;
    let h = `<path d="M${x} ${base} Q${x + 34 * f} ${base - hgt / 2} ${tx} ${ty}" fill="none" stroke="${col}" stroke-width="11" stroke-linecap="round"/>`;
    for (let i = 0; i < 8; i++) {
      const a = (-160 + i * 20) * Math.PI / 180, dx = Math.cos(a) * 120, dy = Math.sin(a) * 70;
      h += `<path d="M${tx} ${ty} Q${n0(tx + dx * 0.5)} ${n0(ty + dy - 36)} ${n0(tx + dx)} ${n0(ty + dy + 44)}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round"/>`;
    }
    return h;
  };
  const lollipop = (cx, cy, r, cols, n = 12, cls = 'spin2') => {
    let h = `<rect x="${cx - 5}" y="${cy + r - 10}" width="10" height="${720 - cy}" fill="#ffffff" opacity=".75"/><g class="${cls}" style="transform-origin:${cx}px ${cy}px;transform-box:view-box">`;
    for (let i = 0; i < n; i++) {
      const a0 = (i * 360 / n) * Math.PI / 180, a1 = ((i + 1) * 360 / n) * Math.PI / 180;
      h += `<path d="M${cx} ${cy} L${n0(cx + r * Math.cos(a0))} ${n0(cy + r * Math.sin(a0))} A${r} ${r} 0 0 1 ${n0(cx + r * Math.cos(a1))} ${n0(cy + r * Math.sin(a1))}Z" fill="${cols[i % cols.length]}"/>`;
    }
    return h + `</g><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ffffff" stroke-opacity=".6" stroke-width="3"/>`;
  };
  const flames = (sid, y, seed, cols, n) => {
    const r = mulberry32(seed);
    let h = `<defs>${lin(sid + 'fl', [[0, cols[0], 0.95], [0.55, cols[1], 0.9], [1, cols[2], 0]])}</defs>`;
    for (let i = 0; i < n; i++) {
      const x = n0(-20 + (i + r() * 0.8) * (1320 / n)), hh = 150 + r() * 220, w = 34 + r() * 40;
      h += `<path class="flick" style="animation-duration:${(0.9 + r() * 1.1).toFixed(2)}s;animation-delay:${(-r() * 2).toFixed(2)}s" d="M${x - w} ${y} C${n0(x - w * 1.3)} ${n0(y - hh * 0.4)} ${n0(x - w * 0.2)} ${n0(y - hh * 0.55)} ${x} ${n0(y - hh)} C${n0(x + w * 0.2)} ${n0(y - hh * 0.55)} ${n0(x + w * 1.3)} ${n0(y - hh * 0.4)} ${x + w} ${y}Z" fill="url(#${sid}fl)"/>`;
    }
    return h;
  };
  const embers = (n, seed, col, y0 = 380) => {
    const r = mulberry32(seed);
    let h = `<g fill="${col}">`;
    for (let i = 0; i < n; i++) h += `<circle class="em" style="animation-delay:${(r() * 6).toFixed(1)}s;animation-duration:${(5 + r() * 5).toFixed(1)}s" cx="${n0(r() * 1280)}" cy="${n0(y0 + r() * (720 - y0))}" r="${(1 + r() * 2.4).toFixed(1)}"/>`;
    return h + '</g>';
  };
  const jet = (x, y, s, rot, col, trail = 700) => `<defs>${lin('jt' + x + y, [[0, '#ffffff', 0.85], [1, '#ffffff', 0]], 1, 0, 0, 0)}</defs>
    <g transform="translate(${x} ${y}) rotate(${rot})"><rect x="${-trail}" y="-2" width="${trail}" height="4" fill="url(#jt${x}${y})" transform="translate(-30 0)" opacity=".9"/>
    <g transform="scale(${s})" fill="${col}"><path d="M-40 0 L22 -7 L52 0 L22 7Z"/><path d="M-4 -3 L-30 -42 L-20 -42 L16 -4Z"/><path d="M-4 3 L-30 42 L-20 42 L16 4Z"/><path d="M-34 -2 L-48 -15 L-43 -15 L-26 -2Z"/><path d="M-34 2 L-48 15 L-43 15 L-26 2Z"/></g></g>`;
  const balloons = (sid, n, seed, cols, size = 1) => {
    const r = mulberry32(seed);
    let h = '';
    for (let i = 0; i < n; i++) {
      const x = n0(r() * 1280), y0 = n0(60 + r() * 640), s = (0.7 + r() * 0.8) * size, c = cols[i % cols.length], dx = n0((r() - 0.5) * 120);
      h += `<g transform="translate(${x} ${y0})"><g class="up" style="--y0:${y0}px;--dx:${dx}px;animation-duration:${n0(24 + r() * 26)}s;animation-delay:${n0(-r() * 40)}s"><g transform="scale(${s.toFixed(2)})"><ellipse cx="0" cy="0" rx="22" ry="27" fill="${c}" opacity=".92"/><ellipse cx="-8" cy="-10" rx="6" ry="9" fill="#fff" opacity=".35"/><path d="M-4 27 L4 27 L0 33Z" fill="${c}"/><path d="M0 33 Q-8 52 0 70 Q8 88 -2 110" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="1.4"/></g></g></g>`;
    }
    return h;
  };
  const lanterns = (n, seed) => {
    const r = mulberry32(seed);
    let h = `<defs>${rad('lnt', [[0, '#ffd27a', 0.9], [1, '#ffd27a', 0]])}</defs>`;
    for (let i = 0; i < n; i++) {
      const x = n0(r() * 1280), y0 = n0(80 + r() * 640), s = 0.6 + r() * 0.9, dx = n0((r() - 0.5) * 100);
      h += `<g transform="translate(${x} ${y0})"><g class="up" style="--y0:${y0}px;--dx:${dx}px;animation-duration:${n0(26 + r() * 28)}s;animation-delay:${n0(-r() * 50)}s"><g transform="scale(${s.toFixed(2)})"><circle r="46" fill="url(#lnt)"/><rect x="-14" y="-18" width="28" height="34" rx="6" fill="#ffb454"/><rect x="-14" y="-18" width="28" height="7" rx="3" fill="#ffe0a0"/><circle cy="2" r="6" fill="#fff4c8"/></g></g></g>`;
    }
    return h;
  };
  const glitch = (n, seed, cols, y0 = 0, y1 = 720) => {
    const r = mulberry32(seed);
    let h = '';
    for (let i = 0; i < n; i++) h += `<rect class="gl" style="animation-duration:${(1.4 + r() * 2.2).toFixed(1)}s;animation-delay:${(-r() * 3).toFixed(1)}s" x="${n0(r() * 1100)}" y="${n0(y0 + r() * (y1 - y0))}" width="${n0(60 + r() * 360)}" height="${n0(3 + r() * 10)}" fill="${cols[i % cols.length]}" opacity="${(0.25 + r() * 0.4).toFixed(2)}"/>`;
    return h;
  };
  const wisps = (sid, n, seed, col, yBase) => {
    const r = mulberry32(seed);
    let h = `<defs>${lin(sid + 'ws', [[0, col, 0], [0.5, col, 0.55], [1, col, 0]])}</defs>`;
    for (let i = 0; i < n; i++) {
      const x = n0(80 + r() * 1100), y = n0(yBase + r() * 200);
      h += `<path class="sway" style="animation-duration:${n0(10 + r() * 14)}s;animation-delay:${n0(-r() * 12)}s" d="M${x} ${y} C${x + 130} ${y - 90} ${x - 110} ${y - 190} ${x + 60} ${y - 300}" fill="none" stroke="url(#${sid}ws)" stroke-width="${n0(8 + r() * 16)}" stroke-linecap="round"/>`;
    }
    return h;
  };
  const moonBig = (sid, cx, cy, r, c1, c2) => {
    let h = `<defs>${rad(sid + 'mn', [[0, c1], [1, c2]], 'cx="38%" cy="34%" r="80%"')}${rad(sid + 'mh', [[0, c1, 0.5], [1, c1, 0]])}</defs><circle cx="${cx}" cy="${cy}" r="${n0(r * 2.2)}" fill="url(#${sid}mh)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${sid}mn)"/>`;
    [[-0.32, -0.18, 0.2], [0.22, 0.1, 0.28], [-0.1, 0.38, 0.14], [0.4, -0.3, 0.12], [-0.45, 0.2, 0.1]].forEach(([dx, dy, k]) => { h += `<circle cx="${n0(cx + dx * r)}" cy="${n0(cy + dy * r)}" r="${n0(r * k)}" fill="${c2}" opacity=".35"/>`; });
    return h;
  };
  const lightning = (sid, x, seed, col) => {
    const r = mulberry32(seed);
    let px = x, py = -10, d = `M${px} ${py}`;
    while (py < 520) { px += (r() - 0.5) * 90; py += 40 + r() * 50; d += ` L${n0(px)} ${n0(py)}`; }
    return `<g class="tw" style="animation-duration:${(2 + r() * 2).toFixed(1)}s"><path d="${d}" fill="none" stroke="${col}" stroke-width="9" stroke-opacity=".25" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></g>`;
  };
  const shards = (n, seed, cols, y0 = 0, y1 = 720) => {
    const r = mulberry32(seed);
    let h = '';
    for (let i = 0; i < n; i++) {
      const x = n0(r() * 1280), y = n0(y0 + r() * (y1 - y0)), s = 14 + r() * 40;
      h += `<polygon class="drift ${['', 'd2', 'd3'][i % 3]}" points="${x},${y} ${n0(x + s)},${n0(y + s * 0.4)} ${n0(x + s * 0.3)},${n0(y + s)}" fill="${cols[i % cols.length]}" opacity="${(0.35 + r() * 0.5).toFixed(2)}" transform="rotate(${n0(r() * 360)} ${x} ${y})"/>`;
    }
    return h;
  };
  const neon = (x, y, w, h2, col, rx = 8, delay = 0) => `<g class="tw" style="animation-delay:${delay}s"><rect x="${x}" y="${y}" width="${w}" height="${h2}" rx="${rx}" fill="none" stroke="${col}" stroke-width="10" stroke-opacity=".22"/><rect x="${x}" y="${y}" width="${w}" height="${h2}" rx="${rx}" fill="none" stroke="${col}" stroke-width="3.4"/></g>`;
  const mesas = (col, base, seed, op = 1) => {
    const r = mulberry32(seed);
    let h = '', x = -60;
    while (x < 1320) { const w = 160 + r() * 200, ht = 60 + r() * 110; h += `<polygon points="${n0(x)},${base} ${n0(x + 24)},${n0(base - ht)} ${n0(x + w - 24)},${n0(base - ht)} ${n0(x + w)},${base}" fill="${col}" opacity="${op}"/>`; x += w + 20 + r() * 120; }
    return h + `<rect x="0" y="${base}" width="1280" height="${720 - base}" fill="${col}" opacity="${op}"/>`;
  };
  const stroke = (d, col, w = 16) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity=".88"/>`;
  const trees = (seed, col, base, n) => {
    const r = mulberry32(seed);
    let h = '';
    for (let i = 0; i < n; i++) {
      const x = n0(r() * 1280), hh = 150 + r() * 150;
      let d = `M${x} ${base} L${x} ${base - hh}`;
      for (let k = 0; k < 5; k++) { const yy = base - hh * (0.35 + k * 0.14), dx = (k % 2 ? 1 : -1) * (40 + r() * 50); d += ` M${x} ${n0(yy)} L${n0(x + dx)} ${n0(yy - 40 - r() * 30)}`; }
      h += `<path d="${d}" stroke="${col}" stroke-width="${n0(4 + r() * 3)}" fill="none" stroke-linecap="round"/>`;
    }
    return h;
  };
  const bottles = (seed, y, col) => {
    const r = mulberry32(seed);
    let h = '';
    for (let x = 30; x < 1280; x += 34 + r() * 22) {
      const hh = 70 + r() * 60, w = 14 + r() * 10, c = ['#d98a3a', '#3a9d7a', '#c04a6a', '#6a7ad8'][n0(r() * 3.4)];
      h += `<rect x="${n0(x)}" y="${n0(y - hh)}" width="${n0(w)}" height="${n0(hh)}" rx="4" fill="${c}" opacity=".5"/><rect x="${n0(x + w / 2 - 3)}" y="${n0(y - hh - 22)}" width="6" height="24" fill="${c}" opacity=".5"/><rect x="${n0(x + 3)}" y="${n0(y - hh + 8)}" width="3" height="${n0(hh - 16)}" fill="#fff" opacity=".25"/>`;
    }
    return h + `<rect x="0" y="${y}" width="1280" height="6" fill="${col}"/>`;
  };
  const fade = sFade;
  const rings = sRings;

  // ================= 1) FADED : 사라져가는 것, 안개와 바다 =================
  add('fad-fog',
    'linear-gradient(to bottom,#04101c 0,#0a2a3a 56%,#0e3340 100%)',
    `${sStars(60, 71, 260, '#cfe8ff', 1)}
     ${rings('#4ad0e0', '#9fb8d0', 0.3, 0.25)}
     <circle cx="860" cy="130" r="30" fill="#dcecf8" opacity=".55"/>
     <path d="M850 200 Q930 168 1010 200Z" fill="#03101a"/>
     ${lighthouse('flh', 930, 200, '#bfe8ff')}
     ${fog('ffg', 10, 4, '#8fc8d8', 200, 640, 0.46)}
     <rect x="0" y="600" width="1280" height="120" fill="#04121c"/>
     ${fog('ffg2', 7, 8, '#a9d0dc', 520, 700, 0.42)}
     ${sFade('ffd', 430)}`);
  add('fad-ocean',
    'linear-gradient(to bottom,#030a1c 0,#0c2a4e 50%,#103a5c 100%)',
    `${sStars(90, 73, 340, '#dff0ff', 1.3)}
     ${rings('#bfe8ff', '#4ad0e0', 0.4, 0.3)}
     <circle cx="640" cy="230" r="200" fill="#bfe8ff" opacity=".1"/><circle cx="640" cy="230" r="78" fill="#eaf6ff"/><circle cx="618" cy="214" r="12" fill="#c6dcec" opacity=".6"/><circle cx="662" cy="248" r="16" fill="#c6dcec" opacity=".5"/>
     ${ocean('fo', 430, '#0d3556', '#04101e', '#bfe8ff')}
     ${moonPath(640, 436, 120, '#eaf6ff')}
     <path d="M240 560 L420 560 L420 566 L240 566Z" fill="#02080f"/><g fill="#02080f"><circle cx="300" cy="532" r="9"/><path d="M290 560 Q292 536 300 540 Q308 536 310 560Z"/></g>
     ${sFade('fod', 450)}`);
  add('fad-dissolve',
    'radial-gradient(ellipse 560px 420px at 640px 260px,rgba(120,230,255,.5),rgba(120,230,255,0)),linear-gradient(to bottom,#02060e 0,#07243a 60%,#02060e 100%)',
    `${rays('fdr', 640, 250, 16, '#bfeaff', 0.4)}
     ${rings('#eaf6ff', '#4ad0e0', 0.55, 0.45)}
     <circle cx="640" cy="250" r="120" fill="#eaf6ff" opacity=".9"/><circle cx="640" cy="250" r="230" fill="#9fdcff" opacity=".18"/>
     ${embers(70, 5, '#bfeaff', 120)}
     ${shards(26, 6, ['#6fd8ff', '#eaf6ff', '#2a8fb8'], 100, 640)}
     ${glitch(14, 3, ['#4ad0e0', '#ffffff'], 80, 640)}
     ${bokeh('fdb', 16, 2, ['#bfeaff', '#4ad0e0'], 10, 44, 0.5, 100, 640)}
     ${sFade('fdd', 440)}`);

  // ================= 2) Shape of You : 바, 댄스플로어, 열대의 밤 =================
  add('soy-bar',
    'linear-gradient(to bottom,#1a0a1e 0,#3a1330 56%,#150812 100%)',
    `${rings('#ff6fa8', '#ffb347', 0.3, 0.26)}
     ${bottles(2, 380, '#6d3a2a')}${bottles(7, 470, '#6d3a2a')}
     ${neon(470, 60, 340, 70, '#ff4f9a', 14)}${neon(520, 82, 240, 26, '#ffb347', 6, 0.6)}
     ${bokeh('sbb', 26, 5, ['#ffb347', '#ff6fa8', '#ffe0a0'], 14, 50, 0.6, 120, 640)}
     <rect x="0" y="640" width="1280" height="80" fill="#2a120a"/><rect x="0" y="640" width="1280" height="6" fill="#8a5a3a"/>
     ${sFade('sbd', 440)}`);
  add('soy-dance',
    'linear-gradient(to bottom,#14052e 0,#3a0f52 50%,#0f0420 100%)',
    `${rays('sdr', 640, 130, 20, '#ffb8f0', 0.28)}
     ${rings('#ff4fd8', '#4fe0ff', 0.4, 0.34)}
     ${spots('sdp', [[200, '#ff4fd8', 0.5, 6, 0], [1080, '#4fe0ff', 0.5, 7, -2], [420, '#ffd04f', 0.4, 8, -3, 80], [860, '#ff4fd8', 0.4, 7, -1, 80]], 100)}
     ${discoBall('sdb', 640, 120, 56)}
     ${lightDots(60, 3, ['#ff4fd8', '#4fe0ff', '#ffd04f', '#ffffff'], 40, 520)}
     <polygon points="0,720 1280,720 1280,640 0,640" fill="#1b0a3a"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${i * 160}" y="640" width="150" height="76" fill="${['#ff4fd8', '#4fe0ff', '#ffd04f', '#8f6bff'][i % 4]}" opacity=".22"/>`).join('')}
     ${sFade('sdd', 470, 0.7)}`);
  add('soy-tropic',
    'linear-gradient(to bottom,#3a0b5e 0,#c2306a 40%,#ff7a4a 72%,#ffc060 100%)',
    `<defs>${lin('stp-s', [[0, '#ffe27a'], [1, '#ff4f7a']])}</defs>
     ${sStars(40, 11, 200)}
     ${rings('#ffd27a', '#ff6fa8', 0.45, 0.4)}
     <circle cx="640" cy="330" r="140" fill="url(#stp-s)"/><g fill="#d83a6a" opacity=".85"><rect x="490" y="330" width="300" height="6"/><rect x="490" y="352" width="300" height="9"/><rect x="490" y="378" width="300" height="12"/></g>
     <rect x="0" y="450" width="1280" height="270" fill="#4a0f4a"/>${moonPath(640, 456, 260, '#ffd27a')}
     ${palm(120, 700, 420, false, '#1a0620')}${palm(1180, 700, 400, true, '#1a0620')}${palm(300, 700, 260, true, '#2a0a30')}
     ${bokeh('stp', 18, 4, ['#ffd27a', '#ff6fa8'], 10, 40, 0.5, 120, 600)}
     ${sFade('stpd', 450)}`);

  // ================= 3) Sugar : 달콤한 설탕 세상 =================
  add('sug-cloud',
    'linear-gradient(to bottom,#7a3aa8 0,#d65fa8 40%,#ff9ac4 72%,#ffd0e0 100%)',
    `${rings('#ffe0f0', '#b8e0ff', 0.45, 0.4)}
     ${sStars(70, 21, 360, '#fff', 1.4)}
     ${sCloud(190, 330, 1.5, 0.78)}${sCloud(1100, 300, 1.6, 0.78, 'drift d2')}${sCloud(640, 460, 2.1, 0.55, 'drift d3')}
     <g fill="#9fd8ff" opacity=".6"><g class="drift d2"><ellipse cx="880" cy="180" rx="90" ry="26"/><ellipse cx="840" cy="166" rx="44" ry="28"/></g><g class="drift"><ellipse cx="380" cy="150" rx="80" ry="24"/><ellipse cx="350" cy="138" rx="40" ry="26"/></g></g>
     ${fall(16, 9, ['#fff', '#ffe0f0'], 'petal', 0.7)}
     ${bokeh('sgc', 14, 3, ['#ffffff', '#ffd0e8', '#b8e0ff'], 14, 46, 0.45, 80, 600)}
     ${sFade('sgd', 420, 0.88)}`);
  add('sug-candy',
    'linear-gradient(135deg,#ff4f9a 0,#ff94c8 45%,#6fd0ff 100%)',
    `${rings('#ffffff', '#fff0b8', 0.55, 0.45)}
     ${lollipop(150, 330, 110, ['#ff2a6d', '#ffffff'], 14)}${lollipop(1130, 300, 130, ['#00c8ff', '#ffffff'], 14)}${lollipop(640, 120, 70, ['#ffd04f', '#ff7a4a'], 10)}
     <g stroke="#ffffff" stroke-opacity=".28" stroke-width="22">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${-80 + i * 240} 720 L${180 + i * 240} 0"/>`).join('')}</g>
     ${fall(60, 12, ['#ff2a6d', '#ffd04f', '#4fe0ff', '#ffffff', '#8f6bff'], 'rect', 1.3, 5, 6)}
     ${bokeh('sgy', 14, 8, ['#ffffff', '#ffe0f0'], 12, 40, 0.4, 60, 660)}
     ${sFade('sgyd', 440, 0.85)}`);
  add('sug-rush',
    'radial-gradient(ellipse 560px 440px at 640px 260px,rgba(255,236,130,.7),rgba(255,236,130,0)),linear-gradient(to bottom,#5a1a9a 0,#d6309a 48%,#ff6a8a 100%)',
    `${rays('sgr', 640, 260, 24, '#fff0a0', 0.55)}
     ${rings('#fff0a0', '#ffffff', 0.7, 0.55)}
     ${lollipop(640, 260, 120, ['#ffffff', '#ff4f9a', '#ffd04f', '#4fe0ff'], 16, 'spin')}
     ${heart(210, 250, 1.8, '#ffd0e8', 0.6, -14)}${heart(1070, 190, 2.1, '#ffffff', 0.5, 12)}${heart(1140, 440, 1.2, '#ffd04f', 0.55, -8)}${heart(130, 470, 1.2, '#4fe0ff', 0.5, 10)}
     ${fall(90, 14, ['#ff2a6d', '#ffd04f', '#4fe0ff', '#ffffff', '#a8ff7a'], 'rect', 1.6, 3, 4)}
     ${bokeh('sgrb', 18, 3, ['#fff0a0', '#ffffff', '#ff9ac4'], 14, 60, 0.5, 40, 680)}
     ${sFade('sgrd', 450, 0.86)}`);

  // ================= 4) IDGAF : 삐딱한 반항 =================
  add('idg-room',
    'linear-gradient(to bottom,#0c0f1c 0,#1a2036 55%,#10121e 100%)',
    `<defs>${rad('idr-l', [[0, '#ffd9a0', 0.75], [1, '#ffd9a0', 0]])}</defs>
     ${rings('#ff4f6a', '#4ad0e0', 0.26, 0.22)}
     <rect x="500" y="40" width="280" height="300" fill="#0a1226"/><g stroke="#1b2540" stroke-width="7"><path d="M640 40V340M500 190H780"/><rect x="496" y="36" width="288" height="308" fill="none"/></g>
     ${sSkyline('#0d1a38', 4, 340, 20, 110, 1)}<g opacity=".9">${bokeh('idr', 18, 6, ['#ffcf7a', '#ff6f8a', '#8ab4ff'], 5, 16, 0.95, 160, 338)}</g>
     <g stroke="#0a0c18" stroke-width="2"><rect x="110" y="40" width="96" height="124" fill="#ff4f6a" fill-opacity=".55"/><rect x="226" y="70" width="80" height="100" fill="#4ad0e0" fill-opacity=".5"/><rect x="990" y="40" width="100" height="130" fill="#ffd04f" fill-opacity=".45"/><rect x="1110" y="80" width="90" height="96" fill="#a88bff" fill-opacity=".5"/></g>
     <path d="M1000 640 L1050 520 L1100 470" stroke="#0a0c18" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M1080 460 L1140 500 L1090 520Z" fill="#0a0c18"/><circle cx="1110" cy="500" r="170" fill="url(#idr-l)"/>
     ${bokeh('idr2', 14, 9, ['#ffd9a0'], 2, 6, 0.9, 120, 600)}
     <rect x="0" y="610" width="1280" height="110" fill="#080a14"/>
     ${sFade('idrd', 440)}`);
  add('idg-wall',
    'linear-gradient(to bottom,#150a1c 0,#2a1230 60%,#0c060f 100%)',
    `<defs><pattern id="idw-b" width="90" height="44" patternUnits="userSpaceOnUse"><rect width="90" height="44" fill="#2a1424"/><path d="M0 0H90M0 22H90M45 0V22M0 22V44M90 22V44" stroke="#12060f" stroke-width="3"/></pattern></defs>
     <rect width="1280" height="720" fill="url(#idw-b)" opacity=".55"/>
     ${rings('#ff4fa8', '#ffe04f', 0.35, 0.3)}
     ${stroke('M120 220 C 260 80 330 360 470 190', '#ff2a8a', 22)}${stroke('M820 150 C 940 60 1040 260 1170 120', '#ffe04f', 20)}${stroke('M250 500 C 340 420 440 560 560 470', '#4ad0e0', 18)}${stroke('M880 470 C 980 400 1060 540 1180 450', '#a8ff7a', 16)}
     <g stroke="#ff2a8a" stroke-width="4" opacity=".7"><path d="M200 232V300M350 262V340M440 218V270"/></g><g stroke="#ffe04f" stroke-width="4" opacity=".7"><path d="M900 172V250M1060 190V270"/></g>
     <path d="M560 70 L720 210 M720 70 L560 210" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".5"/>
     ${neon(150, 560, 220, 60, '#ff4fa8', 10)}${neon(900, 570, 240, 56, '#4ad0e0', 10, 1.1)}
     ${bokeh('idw', 12, 3, ['#ff4fa8', '#ffe04f'], 14, 40, 0.3, 80, 640)}
     ${sFade('idwd', 450)}`);
  add('idg-riot',
    'radial-gradient(ellipse 560px 400px at 640px 300px,rgba(255,40,60,.6),rgba(255,40,60,0)),linear-gradient(to bottom,#0a0206 0,#3a0612 50%,#12040a 100%)',
    `${rays('irr', 640, 300, 18, '#ff4a5a', 0.45)}
     ${rings('#ff4a5a', '#ffffff', 0.6, 0.5)}
     ${lightning('irl', 330, 4, '#ff6a7a')}${lightning('irl2', 960, 9, '#ff6a7a')}
     <g class="spin2" style="transform-origin:640px 300px;transform-box:view-box"><path d="M520 180 L760 420 M760 180 L520 420" stroke="#ffffff" stroke-width="16" stroke-linecap="round" opacity=".55"/></g>
     ${shards(40, 8, ['#ff2a4a', '#ffffff', '#12040a', '#ff7a8a'], 40, 700)}
     ${embers(60, 3, '#ff9a6a', 200)}${glitch(12, 5, ['#ff2a4a', '#ffffff'], 60, 660)}
     ${speed('irs', 12, 6, '#ffb0b8', 100, 600)}
     ${sFade('irrd', 450)}`);

  // ================= 5) Dangerously : 위험한 사랑, 밤과 불 =================
  add('dng-rain',
    'linear-gradient(to bottom,#04060e 0,#0a1428 56%,#07101e 100%)',
    `${rings('#5a8aff', '#ff4a5a', 0.3, 0.26)}
     <polygon points="560,330 720,330 1180,720 100,720" fill="#050912"/>
     <g stroke="#fff3c0" stroke-opacity=".5">${[0, 1, 2, 3, 4, 5, 6].map((i) => { const t = (i + 1) / 7, y = 330 + t * t * 390, w = 3 + t * 16, h = 8 + t * 40; return `<rect x="${n0(640 - w / 2)}" y="${n0(y)}" width="${n0(w)}" height="${n0(h)}" fill="#fff3c0" stroke="none" opacity="${(0.25 + t * 0.4).toFixed(2)}"/>`; }).join('')}</g>
     ${sSkyline('#0a1226', 3, 332, 20, 120, 0.95)}
     ${bokeh('dnr', 22, 8, ['#fff3c0', '#ff4a5a', '#8ab4ff'], 8, 36, 0.8, 300, 640)}
     ${drip(5, 120)}${drip(9, 60)}
     <ellipse cx="640" cy="600" rx="420" ry="40" fill="#8ab4ff" opacity=".1"/>
     ${sFade('dnrd', 470)}`);
  add('dng-neon',
    'linear-gradient(to bottom,#14020e 0,#4a0a2a 56%,#1a0412 100%)',
    `${rings('#ff2a6d', '#ff9a4a', 0.5, 0.4)}
     <circle cx="640" cy="260" r="120" fill="#ff2a4a" opacity=".8"/><circle cx="640" cy="260" r="250" fill="#ff2a6d" opacity=".16"/>
     ${sSkyline('#1a0615', 6, 520, 80, 280, 1)}
     ${[[120, 300, 40, 150, '#ff2a6d'], [300, 340, 30, 100, '#ffb347'], [980, 310, 44, 160, '#ff4fa8'], [1140, 360, 28, 90, '#ffb347']].map(([x, y, w, h, c], i) => neon(x, y, w, h, c, 4, i * 0.5)).join('')}
     ${fog('dnn', 10, 3, '#ff4a7a', 380, 700, 0.3)}
     ${bokeh('dnn2', 16, 5, ['#ff2a6d', '#ffb347'], 12, 50, 0.5, 120, 640)}
     ${sFade('dnnd', 450)}`);
  add('dng-flame',
    'linear-gradient(to bottom,#1a0204 0,#6a0e08 46%,#ff5a1a 100%)',
    `${rays('dgf', 640, 300, 14, '#ffb050', 0.4)}
     ${rings('#ffd27a', '#ff4a2a', 0.55, 0.45)}
     <circle cx="640" cy="260" r="130" fill="#1a0204"/><circle cx="640" cy="260" r="136" fill="none" stroke="#ff9a3a" stroke-width="4"/>
     ${flames('dgfa', 760, 7, ['#fff0a0', '#ff8a2a', '#c4180a'], 14)}${flames('dgfb', 790, 11, ['#ffd27a', '#ff5a1a', '#8a0a0a'], 10)}
     ${embers(90, 2, '#ffc070', 240)}
     ${sFade('dgfd', 560, 0.35)}`);

  // ================= 6) I Ain't Worried : 거침없는 하늘, 제트 =================
  add('iaw-runway',
    'linear-gradient(to bottom,#2a1a6a 0,#c0508a 40%,#ff9a5a 68%,#ffd27a 100%)',
    `${rings('#ffe9a6', '#ff9aa8', 0.45, 0.4)}
     <circle cx="640" cy="360" r="90" fill="#fff0c0" opacity=".95"/><circle cx="640" cy="360" r="200" fill="#ffd27a" opacity=".25"/>
     ${mesas('#5a2a58', 420, 3, 0.95)}
     <polygon points="610,400 670,400 1000,720 280,720" fill="#2a1630"/>
     ${[0, 1, 2, 3, 4, 5].map((i) => { const t = (i + 1) / 6, y = 400 + t * t * 320, w = 3 + t * 14, h = 8 + t * 38; return `<rect x="${n0(640 - w / 2)}" y="${n0(y)}" width="${n0(w)}" height="${n0(h)}" fill="#fff6d8" opacity="${(0.4 + t * 0.4).toFixed(2)}"/>`; }).join('')}
     <g fill="#1a0c22"><path d="M600 396 L700 392 L720 398 L700 404Z"/><path d="M640 396 L618 378 L626 378 L652 394Z"/></g>
     <rect x="0" y="396" width="1280" height="26" fill="#ffd27a" opacity=".16"/>
     ${sFade('iarf', 450)}`);
  add('iaw-sky',
    'linear-gradient(to bottom,#0a52d6 0,#2d8cff 44%,#8fd4ff 82%,#e6f7ff 100%)',
    `${rays('iask', 1000, 40, 14, '#ffffff', 0.3)}
     ${rings('#ffffff', '#cdeaff', 0.55, 0.45)}
     ${sCloud(180, 520, 1.6, 0.6)}${sCloud(1100, 560, 1.7, 0.6, 'drift d2')}${sCloud(640, 330, 1.2, 0.35, 'drift d3')}
     ${jet(560, 200, 1.1, 14, '#0b1c40', 900)}${jet(470, 260, 0.9, 14, '#0b1c40', 900)}${jet(650, 262, 0.9, 14, '#0b1c40', 900)}
     ${speed('iass', 12, 4, '#ffffff', 80, 600)}
     ${sFade('iasd', 400)}`);
  add('iaw-sunburst',
    'radial-gradient(ellipse 600px 440px at 640px 300px,rgba(255,226,140,.8),rgba(255,226,140,0)),linear-gradient(to bottom,#4a1a7a 0,#e0508a 40%,#ff9a3a 74%,#ffd060 100%)',
    `${rays('iab', 640, 300, 20, '#fff0b0', 0.55)}
     ${rings('#fff0b0', '#ffffff', 0.65, 0.5)}
     <circle cx="640" cy="300" r="110" fill="#fffbe0"/><circle cx="640" cy="300" r="240" fill="#ffd27a" opacity=".22"/>
     ${jet(300, 180, 1.2, -12, '#2a0f3a', 800)}${jet(980, 150, 1.0, 10, '#2a0f3a', 800)}${jet(1100, 360, 0.8, 8, '#2a0f3a', 800)}
     ${mesas('#6a2a50', 560, 5, 0.95)}${mesas('#3a1442', 640, 8, 1)}
     ${bokeh('iabk', 18, 2, ['#fff0b0', '#ffffff', '#ff9ac4'], 10, 50, 0.5, 60, 620)}
     ${sFade('iabd', 460)}`);

  // ================= 7) Stay at Your House : 비 내리는 밤, 달에 닿고 싶은 마음 =================
  add('stay-rain',
    'linear-gradient(to bottom,#06121a 0,#0c2a34 56%,#0a1a24 100%)',
    `${rings('#4ad0e0', '#ff4fa8', 0.3, 0.26)}
     ${sSkyline('#07202a', 2, 480, 120, 380, 1)}
     <defs>${rad('srg1', [[0, '#ff4fa8', 0.5], [1, '#ff4fa8', 0]])}${rad('srg2', [[0, '#4ad0e0', 0.5], [1, '#4ad0e0', 0]])}${rad('srg3', [[0, '#ffd04f', 0.45], [1, '#ffd04f', 0]])}</defs>
     <circle cx="173" cy="250" r="170" fill="url(#srg1)"/><circle cx="330" cy="295" r="130" fill="url(#srg2)"/><circle cx="1035" cy="240" r="170" fill="url(#srg3)"/><circle cx="1168" cy="280" r="130" fill="url(#srg1)"/>
     ${neon(150, 140, 46, 220, '#ff4fa8', 6)}${neon(310, 220, 38, 150, '#4ad0e0', 6, 0.7)}${neon(1010, 120, 50, 240, '#ffd04f', 6, 0.3)}${neon(1150, 200, 36, 160, '#ff4fa8', 6, 1.1)}
     ${fog('str', 8, 6, '#6fc8d8', 420, 700, 0.3)}
     ${drip(3, 140)}${drip(8, 70)}
     <rect x="0" y="620" width="1280" height="100" fill="#06141c"/><g opacity=".4"><rect x="140" y="624" width="64" height="70" fill="#ff4fa8"/><rect x="300" y="624" width="50" height="60" fill="#4ad0e0"/><rect x="1000" y="624" width="64" height="70" fill="#ffd04f"/></g>
     ${sFade('strd', 450)}`);
  add('stay-rooftop',
    'linear-gradient(to bottom,#0a0830 0,#1c1470 52%,#2a1450 100%)',
    `${sStars(120, 91, 380, '#e8f0ff')}
     ${rings('#bfd0ff', '#ff6fa8', 0.35, 0.3)}
     ${moonBig('srm', 640, 270, 160, '#fff6e0', '#d6c8e0')}
     ${sSkyline('#0c0a30', 12, 560, 100, 300, 1)}
     <g stroke="#0c0a30" stroke-width="3"><path d="M200 330 V200 M260 340 V250 M900 330 V190 M1010 350 V240"/><path d="M200 220 L1010 250 M260 270 L900 210" stroke-opacity=".6" fill="none"/></g>
     ${neon(110, 360, 70, 36, '#ff4fa8', 4)}${neon(1090, 380, 80, 34, '#4ad0e0', 4, 0.8)}
     ${shooting('srs', 2, 3, '#ffffff')}
     ${sFade('srd', 470)}`);
  add('stay-moon',
    'radial-gradient(ellipse 620px 440px at 640px 400px,rgba(255,111,168,.45),rgba(255,111,168,0)),linear-gradient(to bottom,#100a3a 0,#2a1070 50%,#0a0624 100%)',
    `${sStars(150, 93, 460, '#fff')}
     ${rings('#4ad0e0', '#ff6fa8', 0.5, 0.4)}
     ${moonBig('smm', 640, 420, 250, '#fff2d8', '#c9b8e8')}
     <g fill="none" stroke="#4ad0e0" stroke-opacity=".6" stroke-width="2">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect class="drift ${['', 'd2', 'd3'][i % 3]}" x="${180 + i * 130}" y="${100 + (i % 3) * 90}" width="${20 + (i % 3) * 10}" height="${20 + (i % 3) * 10}"/>`).join('')}</g>
     ${glitch(10, 4, ['#4ad0e0', '#ff6fa8'], 80, 620)}
     ${bokeh('smb', 18, 5, ['#fff2d8', '#ff9acb', '#4ad0e0'], 8, 36, 0.55, 100, 640)}
     ${shooting('smm', 3, 6, '#ffe6f6')}
     ${sFade('smd', 480)}`);

  // ================= 8) Spectre : 유령, 어둠, 균열 =================
  add('spc-mist',
    'linear-gradient(to bottom,#07040f 0,#1a1030 56%,#0a0714 100%)',
    `${sStars(50, 41, 280, '#cdbfff', 1)}
     ${rings('#9a7aff', '#bfd0ff', 0.3, 0.26)}
     <circle cx="900" cy="160" r="52" fill="#e0dcff" opacity=".8"/><circle cx="900" cy="160" r="120" fill="#9a7aff" opacity=".14"/>
     ${trees(5, '#05030c', 640, 9)}
     ${fog('spm', 10, 8, '#8a78c8', 380, 700, 0.34)}
     <rect x="0" y="640" width="1280" height="80" fill="#05030c"/>
     ${sFade('spmd', 450)}`);
  add('spc-wisps',
    'linear-gradient(to bottom,#041020 0,#0c2a4a 54%,#06101c 100%)',
    `${sStars(80, 43, 340, '#bfe0ff')}
     ${rings('#6fb8ff', '#d6ecff', 0.4, 0.34)}
     ${wisps('spw', 9, 5, '#9fd0ff', 340)}${wisps('spw2', 6, 9, '#ffffff', 420)}
     ${fog('spw3', 8, 4, '#6fa8e0', 300, 700, 0.3)}
     ${bokeh('spwb', 22, 3, ['#bfe0ff', '#ffffff'], 4, 16, 0.8, 100, 640)}
     ${shards(14, 7, ['#9fd0ff', '#ffffff'], 80, 600)}
     ${sFade('spwd', 450)}`);
  add('spc-void',
    'radial-gradient(ellipse 540px 400px at 640px 280px,rgba(255,40,70,.5),rgba(255,40,70,0)),linear-gradient(to bottom,#030208 0,#10061a 56%,#030208 100%)',
    `${rings('#ff3a5a', '#ffffff', 0.6, 0.5)}
     <g class="spin" style="transform-origin:640px 280px;transform-box:view-box"><circle cx="640" cy="280" r="190" fill="none" stroke="#ff3a5a" stroke-width="5" stroke-dasharray="60 40" opacity=".8"/></g>
     <g class="spin2" style="transform-origin:640px 280px;transform-box:view-box"><circle cx="640" cy="280" r="140" fill="none" stroke="#ffffff" stroke-width="3" stroke-dasharray="20 30" opacity=".7"/><circle cx="640" cy="280" r="240" fill="none" stroke="#ff3a5a" stroke-width="2" stroke-dasharray="6 16" opacity=".6"/></g>
     <circle cx="640" cy="280" r="60" fill="#ff3a5a" opacity=".9"/><circle cx="640" cy="280" r="26" fill="#030208"/>
     ${lightning('spl', 250, 6, '#ff5a7a')}${lightning('spl2', 1030, 3, '#ff5a7a')}
     ${glitch(18, 2, ['#ff3a5a', '#ffffff', '#8a2aff'], 40, 680)}
     ${shards(34, 9, ['#ff3a5a', '#ffffff', '#6a1aaa'], 40, 680)}
     ${embers(50, 4, '#ff7a8a', 160)}
     ${sFade('spvd', 450)}`);

  // ================= 9) Understand : 조용히 이해받고 싶은 밤 =================
  add('und-balcony',
    'linear-gradient(to bottom,#080c2e 0,#14205a 56%,#0c1030 100%)',
    `${sStars(130, 61, 400, '#e8f0ff')}
     <path d="M170 110 a40 40 0 1 0 40 56 a32 32 0 1 1 -40 -56Z" fill="#fff0c8" opacity=".9"/>
     ${rings('#ffd9a0', '#8ab4ff', 0.28, 0.24)}
     ${bokeh('unb', 26, 8, ['#ffcf7a', '#ff9acb', '#8ab4ff'], 8, 30, 0.6, 300, 620)}
     ${bulbs('unl', 150, 90, '#ffd9a0', 14)}
     <g stroke="#04061a" stroke-width="7" fill="none"><path d="M0 610 H1280"/>${Array.from({ length: 22 }, (_, i) => `<path d="M${i * 62} 610 V720"/>`).join('')}</g><rect x="0" y="606" width="1280" height="14" fill="#04061a"/>
     ${sFade('und', 460)}`);
  add('und-fireflies',
    'linear-gradient(to bottom,#1a0a4a 0,#4a2a8a 40%,#2a6a7a 78%,#14323a 100%)',
    `${sStars(60, 63, 240, '#fff', 1.2)}
     ${rings('#d9c8ff', '#a8ff7a', 0.35, 0.3)}
     <circle cx="640" cy="200" r="90" fill="#f4eaff" opacity=".85"/><circle cx="640" cy="200" r="200" fill="#c8b8ff" opacity=".14"/>
     ${hills('#1c3a50', 560, 70, 3, 0.95)}${hills('#0f2236', 630, 60, 7, 1)}
     <g>${Array.from({ length: 40 }, (_, i) => { const r = mulberry32(100 + i); return `<circle class="bk" style="animation-duration:${(3 + r() * 4).toFixed(1)}s;animation-delay:${(-r() * 6).toFixed(1)}s" cx="${n0(r() * 1280)}" cy="${n0(330 + r() * 340)}" r="${(2 + r() * 3).toFixed(1)}" fill="#d8ff7a" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/><circle cx="${n0(r() * 1280)}" cy="${n0(330 + r() * 340)}" r="10" fill="#d8ff7a" opacity=".1"/>`; }).join('')}</g>
     ${bokeh('unf', 12, 6, ['#d8ff7a'], 14, 36, 0.3, 330, 660)}
     ${sFade('unfd', 470)}`);
  add('und-lanterns',
    'radial-gradient(ellipse 620px 440px at 640px 380px,rgba(255,170,80,.45),rgba(255,170,80,0)),linear-gradient(to bottom,#0c0a36 0,#2a1658 52%,#4a2038 100%)',
    `${sStars(140, 65, 420, '#fff2d8')}
     ${rings('#ffd27a', '#ff9acb', 0.45, 0.38)}
     ${lanterns(34, 5)}
     ${hills('#1a0c30', 640, 50, 3, 1)}
     <rect x="0" y="660" width="1280" height="60" fill="#0c0820"/><g opacity=".5">${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${200 + i * 160}" y="${668 + (i % 2) * 14}" width="70" height="3" fill="#ffd27a"/>`).join('')}</g>
     ${bokeh('unl', 16, 3, ['#ffd27a', '#ffb454', '#ff9acb'], 8, 34, 0.5, 100, 640)}
     ${sFade('unld', 470)}`);

  // ================= 10) Out of Reach : 닿을 수 없는 곳을 향한 그리움 =================
  add('oor-hill',
    'linear-gradient(to bottom,#2a1a6a 0,#8a4aa8 42%,#ff8aa8 76%,#ffc8a0 100%)',
    `${sStars(60, 81, 260, '#fff', 1.2)}
     ${rings('#ffd0e8', '#b8c8ff', 0.4, 0.34)}
     <circle cx="880" cy="190" r="70" fill="#fff0f0" opacity=".85"/>
     ${balloons('orh', 1, 9, ['#ff4f6a'], 1.6)}
     ${hills('#4a2468', 580, 80, 4, 0.95)}${hills('#2a1448', 650, 60, 6, 1)}
     <g fill="#14082a"><path d="M300 590 Q302 520 300 470"  stroke="#14082a" stroke-width="7" fill="none"/><ellipse cx="300" cy="450" rx="56" ry="44"/><ellipse cx="270" cy="470" rx="36" ry="28"/><ellipse cx="334" cy="472" rx="34" ry="26"/></g>
     <g fill="#14082a"><circle cx="420" cy="570" r="8"/><path d="M412 596 Q413 576 420 579 Q427 576 428 596Z"/></g>
     ${bokeh('orhb', 12, 3, ['#ffd0e8', '#ffffff'], 8, 28, 0.5, 200, 600)}
     ${sFade('orhd', 460)}`);
  add('oor-balloons',
    'linear-gradient(to bottom,#3a6ae0 0,#74a8f4 46%,#c8e0ff 80%,#fff0f4 100%)',
    `${rings('#ffffff', '#ffd0e8', 0.5, 0.42)}
     ${sCloud(160, 420, 1.5, 0.7)}${sCloud(1120, 380, 1.6, 0.7, 'drift d2')}${sCloud(660, 560, 2.2, 0.55, 'drift d3')}
     ${balloons('orb', 26, 5, ['#ff4f6a', '#ffd04f', '#4fe0ff', '#a88bff', '#ff8fb8', '#7affb8'])}
     ${bokeh('orbb', 14, 2, ['#ffffff', '#ffe0f0'], 10, 34, 0.5, 60, 600)}
     ${sFade('orbd', 420, 0.9)}`);
  add('oor-skyward',
    'radial-gradient(ellipse 600px 440px at 640px 260px,rgba(255,236,150,.8),rgba(255,236,150,0)),linear-gradient(to bottom,#ff7a8a 0,#ffb87a 46%,#ffe39a 100%)',
    `${rays('osw', 640, 260, 22, '#fffbe0', 0.6)}
     ${rings('#ffffff', '#fff0b8', 0.7, 0.55)}
     <circle cx="640" cy="260" r="120" fill="#fffef0"/><circle cx="640" cy="260" r="260" fill="#fff0b8" opacity=".3"/>
     ${balloons('osw', 40, 9, ['#ff4f6a', '#ffffff', '#ffd04f', '#4fa8ff', '#ff8fb8'], 1.3)}
     ${fall(50, 13, ['#ffffff', '#fff0b8', '#ffc8d8'], 'rect', 1.4, 4, 5)}
     ${bokeh('oswb', 20, 4, ['#ffffff', '#fff0b8'], 12, 50, 0.55, 40, 660)}
     ${sFade('oswd', 450, 0.8)}`);

  // ---------- 극악 곡 전용 부품 ----------
  const dataRain = (seed, n, col, len = 22) => {
    const r = mulberry32(seed);
    let h = '';
    for (let i = 0; i < n; i++) { const x = n0(r() * 1300); h += `<rect class="rain" style="animation-duration:${(0.6 + r() * 1.2).toFixed(2)}s;animation-delay:${(-r()).toFixed(2)}s" x="${x}" y="${740 - len}" width="2" height="${n0(len * (0.5 + r()))}" fill="${col}" opacity="${(0.3 + r() * 0.5).toFixed(2)}"/>`; }
    return h;
  };
  const staff = (sid, y, seed, col) => {
    const r = mulberry32(seed);
    let h = `<g stroke="${col}" stroke-opacity=".35" stroke-width="1.4">${[0, 1, 2, 3, 4].map((i) => `<line x1="0" y1="${y + i * 12}" x2="1280" y2="${y + i * 12}"/>`).join('')}</g><g class="drift ${['', 'd2'][seed % 2]}" fill="${col}" fill-opacity=".6" stroke="${col}" stroke-opacity=".6">`;
    for (let x = 40; x < 1300; x += 70 + r() * 60) { const yy = y + n0(r() * 5) * 12 - 6; h += `<ellipse cx="${n0(x)}" cy="${yy}" rx="8" ry="5.6" transform="rotate(-20 ${n0(x)} ${yy})"/><line x1="${n0(x) + 7}" y1="${yy - 2}" x2="${n0(x) + 7}" y2="${yy - 36}" stroke-width="2"/>`; }
    return h + '</g>';
  };
  const chandelier = (cx, y, col) => {
    let h = `<line x1="${cx}" y1="0" x2="${cx}" y2="${y}" stroke="${col}" stroke-width="3"/><g class="tw" style="animation-duration:5s">`;
    for (let k = -3; k <= 3; k++) { const x = cx + k * 54, yy = y + 40 + Math.abs(k) * 12; h += `<line x1="${cx}" y1="${y}" x2="${x}" y2="${yy}" stroke="${col}" stroke-width="2"/><circle cx="${x}" cy="${yy}" r="9" fill="#fff2c0"/><circle cx="${x}" cy="${yy}" r="30" fill="#ffd27a" opacity=".16"/><path d="M${x} ${yy + 9} L${x - 4} ${yy + 30} L${x + 4} ${yy + 30}Z" fill="${col}" opacity=".7"/>`; }
    return h + `</g><ellipse cx="${cx}" cy="${y}" rx="120" ry="14" fill="none" stroke="${col}" stroke-width="3"/>`;
  };
  const pianoKeys = (sid, vx, vy, col1, col2) => {
    let h = `<defs>${lin(sid + 'wk', [[0, col1, 0.05], [1, col1, 0.55]])}</defs>`;
    const n = 15;
    for (let i = 0; i < n; i++) {
      const x0 = -300 + i * ((1880) / n), x1 = x0 + 1880 / n - 4;
      h += `<polygon points="${vx + (x0 - vx) * 0.22},${vy + 40} ${vx + (x1 - vx) * 0.22},${vy + 40} ${x1},760 ${x0},760" fill="url(#${sid}wk)" stroke="${col2}" stroke-opacity=".5"/>`;
      if (i % 7 !== 2 && i % 7 !== 6) {
        const bx0 = x1 - 14, bx1 = bx0 + 30;
        h += `<polygon points="${vx + (bx0 - vx) * 0.22},${vy + 40} ${vx + (bx1 - vx) * 0.22},${vy + 40} ${bx1 + 4},${n0(vy + 40 + (760 - vy - 40) * 0.58)} ${bx0 + 2},${n0(vy + 40 + (760 - vy - 40) * 0.58)}" fill="#05030c" opacity=".92"/>`;
      }
    }
    return h;
  };
  const virus = (cx, cy, r, col, cls = 'spin2') => {
    let h = `<g class="${cls}" style="transform-origin:${cx}px ${cy}px;transform-box:view-box"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" opacity=".8"/>`;
    for (let i = 0; i < 14; i++) { const a = (i * 360 / 14) * Math.PI / 180, x1 = cx + Math.cos(a) * r, y1 = cy + Math.sin(a) * r, x2 = cx + Math.cos(a) * (r * 1.45), y2 = cy + Math.sin(a) * (r * 1.45); h += `<line x1="${n0(x1)}" y1="${n0(y1)}" x2="${n0(x2)}" y2="${n0(y2)}" stroke="${col}" stroke-width="${n0(r * 0.12)}" stroke-linecap="round" opacity=".8"/><circle cx="${n0(x2)}" cy="${n0(y2)}" r="${n0(r * 0.16)}" fill="${col}" opacity=".9"/>`; }
    return h + `<circle cx="${cx}" cy="${cy}" r="${n0(r * 0.45)}" fill="#05030c" opacity=".55"/><circle cx="${cx - r * 0.2}" cy="${cy - r * 0.2}" r="${n0(r * 0.16)}" fill="#fff" opacity=".35"/></g>`;
  };
  const ribbon = (sid, d, col, w) => `<defs>${lin(sid, [[0, col, 0], [0.4, col, 0.8], [1, col, 0]], 0, 0, 0, 1)}</defs><path class="sway" style="animation-duration:${n0(10 + w)}s" d="${d}" fill="none" stroke="url(#${sid})" stroke-width="${w}" stroke-linecap="round"/>`;
  const pixels = (n, seed, cols, y0, y1) => {
    const r = mulberry32(seed);
    let h = '';
    for (let i = 0; i < n; i++) { const s = n0(10 + r() * 28); h += `<rect class="gl" style="animation-duration:${(1 + r() * 2.4).toFixed(1)}s;animation-delay:${(-r() * 3).toFixed(1)}s" x="${n0(r() * 1260)}" y="${n0(y0 + r() * (y1 - y0))}" width="${s}" height="${s}" fill="${cols[i % cols.length]}" opacity="${(0.3 + r() * 0.5).toFixed(2)}"/>`; }
    return h;
  };

  // ================= 11) Beethoven Virus : 클래식을 감염시킨 바이러스 =================
  add('bv-hall',
    'linear-gradient(to bottom,#0a0624 0,#1a1048 54%,#0a0618 100%)',
    `${rings('#ffd27a', '#b98aff', 0.4, 0.32)}
     <g fill="#0a0620">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${60 + i * 190}" y="170" width="40" height="470"/><path d="M${60 + i * 190} 170 q50 -60 100 0" />`).join('')}</g>
     ${staff('bvs', 100, 3, '#ffd27a')}${staff('bvs2', 470, 8, '#b98aff')}
     ${chandelier(640, 110, '#ffd27a')}
     ${spots('bvh', [[260, '#ffe9bd', 0.55, 8, 0, 120]], 120)}
     <g fill="#05030c"><path d="M110 640 Q150 590 260 596 L400 604 L400 650 L110 650Z"/><rect x="130" y="650" width="8" height="60"/><rect x="360" y="650" width="8" height="60"/><path d="M130 600 L330 520 L400 600Z" opacity=".95"/></g>
     ${notes(10, 5, '#ffd27a')}
     ${bokeh('bvhb', 14, 3, ['#ffd27a', '#b98aff'], 8, 30, 0.45, 140, 620)}
     ${sFade('bvhd', 450)}`);
  add('bv-keys',
    'radial-gradient(ellipse 600px 380px at 640px 300px,rgba(140,80,255,.45),rgba(140,80,255,0)),linear-gradient(to bottom,#07031c 0,#180a46 56%,#05030c 100%)',
    `${rings('#b98aff', '#4fe0ff', 0.45, 0.38)}
     ${pianoKeys('bvk', 640, 330, '#b98aff', '#4fe0ff')}
     ${staff('bvk1', 150, 5, '#4fe0ff')}
     ${notes(18, 4, '#ffffff')}
     ${glitch(10, 3, ['#ff3a5a', '#4fe0ff'], 60, 640)}
     ${shooting('bvk', 3, 7, '#d6c8ff')}
     ${sFade('bvkd', 480, 0.7)}`);
  add('bv-virus',
    'radial-gradient(ellipse 560px 420px at 640px 290px,rgba(255,30,60,.55),rgba(255,30,60,0)),linear-gradient(to bottom,#080206 0,#2a0612 54%,#07020a 100%)',
    `${rays('bvr', 640, 290, 20, '#ff3a5a', 0.45)}
     ${rings('#ff3a5a', '#7aff7a', 0.6, 0.5)}
     ${virus(640, 290, 90, '#ff3a5a', 'spin')}${virus(180, 190, 54, '#7aff7a')}${virus(1120, 420, 66, '#ff3a5a')}${virus(250, 520, 40, '#ff8a3a')}${virus(900, 112, 40, '#7aff7a')}
     ${staff('bvr', 560, 9, '#ff7a8a')}
     ${lightning('bvl', 420, 3, '#ff6a7a')}${lightning('bvl2', 860, 8, '#ff6a7a')}
     ${glitch(22, 4, ['#ff3a5a', '#7aff7a', '#ffffff'], 40, 680)}
     ${shards(30, 6, ['#ff3a5a', '#ffffff', '#7aff7a'], 40, 680)}
     ${embers(60, 2, '#ff9a8a', 200)}
     ${sFade('bvrd', 450)}`);

  // ================= 12) 하츠네 미쿠의 소실 : 사라져 가는 가상의 가수 =================
  add('cos-stage',
    'linear-gradient(to bottom,#02121a 0,#06323c 56%,#03141a 100%)',
    `${rings('#39e6d0', '#ff7ac8', 0.4, 0.34)}
     ${spots('cst', [[300, '#39e6d0', 0.55, 7, 0, 90], [640, '#ffffff', 0.35, 9, -2, 70], [980, '#ff7ac8', 0.5, 8, -4, 90]], 90)}
     <defs>${lin('cst-g', [[0, '#39e6d0', 0], [1, '#39e6d0', 0.55]])}</defs>
     <g stroke="#39e6d0" stroke-opacity=".5" stroke-width="1.4">${Array.from({ length: 9 }, (_, i) => `<line x1="640" y1="420" x2="${-400 + i * 260}" y2="720"/>`).join('')}${[0, 1, 2, 3, 4].map((i) => { const y = 440 + i * i * 14 + i * 20; return `<line x1="0" y1="${y}" x2="1280" y2="${y}"/>`; }).join('')}</g>
     ${crowd(9, 640, ['#39e6d0', '#ff7ac8', '#ffffff'])}
     ${bokeh('cstb', 14, 2, ['#39e6d0', '#ff7ac8'], 20, 70, 0.3, 100, 560)}
     ${sFade('cstd', 470, 0.6)}`);
  add('cos-ribbon',
    'radial-gradient(ellipse 560px 420px at 640px 300px,rgba(57,230,208,.4),rgba(57,230,208,0)),linear-gradient(to bottom,#03222c 0,#0a4a56 52%,#03141c 100%)',
    `${rings('#7ffbe8', '#ff7ac8', 0.5, 0.4)}
     ${ribbon('cr1', 'M-40 -20 C 240 120 80 320 360 430 S 560 640 700 760', '#39e6d0', 46)}
     ${ribbon('cr2', 'M1320 -20 C 1040 120 1200 320 920 430 S 720 640 580 760', '#7ffbe8', 40)}
     ${ribbon('cr3', 'M-40 80 C 300 40 220 380 520 400', '#ff7ac8', 18)}${ribbon('cr4', 'M1320 80 C 980 40 1060 380 760 400', '#ff7ac8', 18)}
     ${dataRain(4, 70, '#9fffee')}
     ${bokeh('crb', 18, 3, ['#7ffbe8', '#ffffff', '#ff9ad8'], 8, 38, 0.5, 80, 640)}
     ${sStars(60, 33, 400, '#e8ffff', 1.2)}
     ${sFade('crd', 450)}`);
  add('cos-vanish',
    'radial-gradient(ellipse 600px 440px at 640px 280px,rgba(255,255,255,.65),rgba(57,230,208,.3) 40%,rgba(57,230,208,0) 70%),linear-gradient(to bottom,#041a24 0,#0a5a66 46%,#021016 100%)',
    `${rays('cvr', 640, 280, 24, '#ffffff', 0.55)}
     ${rings('#ffffff', '#39e6d0', 0.75, 0.6)}
     <circle cx="640" cy="280" r="100" fill="#ffffff" opacity=".95"/><circle cx="640" cy="280" r="220" fill="#7ffbe8" opacity=".2"/>
     ${pixels(90, 4, ['#ffffff', '#39e6d0', '#7ffbe8', '#ff7ac8'], 20, 700)}
     ${dataRain(8, 110, '#ffffff', 30)}
     ${speed('cvs', 14, 5, '#9fffee', 60, 640)}
     ${glitch(20, 3, ['#39e6d0', '#ffffff', '#ff7ac8'], 40, 680)}
     ${sFade('cvd', 450, 0.8)}`);

  return S;
})();
