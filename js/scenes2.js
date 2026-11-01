// 곡 전용 배경 장면 2차분: FADED, Shape of You, Sugar, IDGAF, Dangerously, I Ain't Worried,
// Stay at Your House, Spectre, Understand, Out of Reach.  (scenes.js 의 부품 H 를 재사용)
import { mulberry32 } from './util.js';
import { H } from './scenes.js';

export const SCENES2 = (() => {
  const { n0, lin, rad, sFade, sRings, sStars, fall, bokeh, shooting, sCloud, rays, speed, spots, hills, sSkyline, heart, bulbs, drip, cloudSea, notes, crowd, aurora } = { ...H };
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

  // ---------- 3차 부품 ----------
  const bridge = (deckY, towerH, col, cable) => {
    const tx1 = 300, tx2 = 980, top = deckY - towerH;
    const cy = (x) => (x < tx1 ? top + ((tx1 - x) / (tx1 + 40)) * (towerH - 20) : x > tx2 ? top + ((x - tx2) / (1320 - tx2)) * (towerH - 20) : (deckY - 30) - Math.pow((x - 640) / 340, 2) * (towerH - 30));
    let pts = '', hang = '';
    for (let x = -40; x <= 1320; x += 20) { pts += `${x},${n0(cy(x))} `; if (x % 40 === 0) hang += `<line x1="${x}" y1="${n0(cy(x))}" x2="${x}" y2="${deckY}" stroke="${cable}" stroke-width="1.4" opacity=".7"/>`; }
    return `<rect x="-20" y="${deckY}" width="1340" height="8" fill="${col}"/>${[tx1, tx2].map((x) => `<rect x="${x - 10}" y="${top}" width="20" height="${720 - top}" fill="${col}"/><rect x="${x - 20}" y="${top + 50}" width="40" height="8" fill="${col}"/><rect x="${x - 20}" y="${top + 120}" width="40" height="8" fill="${col}"/>`).join('')}<polyline points="${pts}" fill="none" stroke="${cable}" stroke-width="3"/>${hang}`;
  };
  const hexPattern = (id, col, op) => `<pattern id="${id}" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(1)"><path d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16Z M28 64 L28 97 M0 48 L-28 64 M56 48 L84 64" fill="none" stroke="${col}" stroke-opacity="${op}" stroke-width="1.6"/></pattern>`;
  const microbots = (n, seed, cols, y0, y1) => {
    const r = mulberry32(seed);
    let h = '';
    for (let i = 0; i < n; i++) {
      const x = n0(r() * 1300), y = n0(y0 + r() * (y1 - y0)), z = 5 + r() * 9;
      h += `<rect class="drift ${['', 'd2', 'd3'][i % 3]}" x="${x}" y="${y}" width="${z.toFixed(0)}" height="${z.toFixed(0)}" fill="${cols[i % cols.length]}" opacity="${(0.35 + r() * 0.55).toFixed(2)}" transform="rotate(${n0(r() * 90)} ${x} ${y})"/>`;
    }
    return h;
  };
  const swarm = (sid, y, amp, col, seed) => {
    const r = mulberry32(seed);
    let h = '';
    for (let i = 0; i < 90; i++) { const x = -20 + i * 15, yy = y + Math.sin(i * 0.28 + seed) * amp + (r() - 0.5) * 26, z = 4 + r() * 6; h += `<rect class="tw" style="animation-delay:${(r() * 3).toFixed(1)}s" x="${x}" y="${n0(yy)}" width="${z.toFixed(0)}" height="${z.toFixed(0)}" fill="${col}" opacity="${(0.4 + r() * 0.5).toFixed(2)}" transform="rotate(${n0(r() * 90)} ${x} ${n0(yy)})"/>`; }
    return h;
  };
  const fireworks = (n, seed, cols) => {
    const r = mulberry32(seed);
    let h = '';
    for (let i = 0; i < n; i++) {
      const cx = n0(60 + r() * 1160), cy = n0(60 + r() * 330), R = 40 + r() * 70, c = cols[i % cols.length];
      h += `<g class="tw" style="animation-delay:${(r() * 4).toFixed(1)}s;animation-duration:${(2 + r() * 3).toFixed(1)}s" stroke="${c}" stroke-width="2.2" stroke-linecap="round">`;
      for (let k = 0; k < 14; k++) { const a = (k * 360 / 14) * Math.PI / 180; h += `<line x1="${n0(cx + Math.cos(a) * R * 0.45)}" y1="${n0(cy + Math.sin(a) * R * 0.45)}" x2="${n0(cx + Math.cos(a) * R)}" y2="${n0(cy + Math.sin(a) * R)}"/><circle cx="${n0(cx + Math.cos(a) * R * 1.12)}" cy="${n0(cy + Math.sin(a) * R * 1.12)}" r="2" fill="${c}"/>`; }
      h += '</g>';
    }
    return h;
  };
  const strings = (sid, n, seed, col, w = 1.8) => {
    const r = mulberry32(seed);
    let h = '';
    for (let i = 0; i < n; i++) {
      const x0 = n0(-60 + r() * 1400), y0 = n0(r() * 700), d = `M${x0} ${y0} C ${x0 + n0((r() - 0.5) * 500)} ${y0 + n0((r() - 0.5) * 400)}, ${x0 + n0((r() - 0.5) * 600)} ${y0 + n0((r() - 0.5) * 500)}, ${x0 + n0((r() - 0.5) * 700)} ${y0 + n0((r() - 0.5) * 600)}`;
      h += `<path class="sway" style="animation-duration:${n0(12 + r() * 16)}s;animation-delay:${n0(-r() * 14)}s" d="${d}" fill="none" stroke="${col}" stroke-width="${(w * (0.6 + r() * 0.9)).toFixed(1)}" opacity="${(0.4 + r() * 0.5).toFixed(2)}" stroke-linecap="round"/><circle cx="${x0}" cy="${y0}" r="${(2 + r() * 3).toFixed(1)}" fill="${col}"/>`;
    }
    return h;
  };
  const tarot = (x, y, w, h2, col, sym, rot, cls = 'drift') => {
    const cx = x + w / 2, cy = y + h2 / 2;
    const symbols = {
      star: `<polygon points="${cx},${cy - 34} ${cx + 10},${cy - 10} ${cx + 36},${cy - 10} ${cx + 15},${cy + 6} ${cx + 23},${cy + 32} ${cx},${cy + 16} ${cx - 23},${cy + 32} ${cx - 15},${cy + 6} ${cx - 36},${cy - 10} ${cx - 10},${cy - 10}" fill="${col}"/>`,
      moon: `<path d="M${cx + 14} ${cy - 30} a34 34 0 1 0 0 60 a26 26 0 1 1 0 -60Z" fill="${col}"/>`,
      sun: `<circle cx="${cx}" cy="${cy}" r="16" fill="${col}"/>${Array.from({ length: 10 }, (_, i) => { const a = (i * 36) * Math.PI / 180; return `<line x1="${n0(cx + Math.cos(a) * 24)}" y1="${n0(cy + Math.sin(a) * 24)}" x2="${n0(cx + Math.cos(a) * 38)}" y2="${n0(cy + Math.sin(a) * 38)}" stroke="${col}" stroke-width="3"/>`; }).join('')}`,
      heart: `<path transform="translate(${cx} ${cy}) scale(2)" d="M0 14C-20 0 -10 -14 0 -5C10 -14 20 0 0 14Z" fill="${col}"/>`,
    };
    return `<g class="${cls}"><g transform="rotate(${rot} ${cx} ${cy})"><rect x="${x}" y="${y}" width="${w}" height="${h2}" rx="12" fill="#12041c" fill-opacity=".7" stroke="${col}" stroke-width="3"/><rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h2 - 16}" rx="8" fill="none" stroke="${col}" stroke-opacity=".5"/>${symbols[sym]}</g></g>`;
  };
  const castle = (x, base, s, col, glow) => {
    const T = (tx, th, tw) => `<rect x="${tx - tw / 2}" y="${base - th}" width="${tw}" height="${th}" fill="${col}"/><polygon points="${tx - tw / 2 - 6},${base - th} ${tx + tw / 2 + 6},${base - th} ${tx},${base - th - tw * 1.1}" fill="${col}"/><rect x="${tx - 3}" y="${base - th + 18}" width="6" height="12" fill="${glow}" opacity=".9"/>`;
    return `<g transform="translate(${x} 0) scale(${s}) translate(${-x} ${base * (1 - s) / s})">${T(x, 150, 46)}${T(x - 90, 110, 40)}${T(x + 90, 110, 40)}${T(x - 150, 70, 34)}${T(x + 150, 70, 34)}<rect x="${x - 110}" y="${base - 70}" width="220" height="70" fill="${col}"/><path d="M${x - 24} ${base} V${base - 36} a24 24 0 0 1 48 0 V${base}Z" fill="${glow}" opacity=".85"/><line x1="${x}" y1="${base - 150 - 50}" x2="${x}" y2="${base - 150 - 84}" stroke="${col}" stroke-width="3"/><polygon points="${x},${base - 150 - 84} ${x + 28},${base - 150 - 74} ${x},${base - 150 - 64}" fill="#ff4f6a"/></g>`;
  };
  const crown = (cx, cy, s, col, gem) => `<g transform="translate(${cx} ${cy}) scale(${s})"><path d="M-60 40 L-60 -10 L-35 15 L0 -35 L35 15 L60 -10 L60 40Z" fill="${col}"/><rect x="-60" y="30" width="120" height="14" fill="${col}"/><circle cx="-60" cy="-14" r="8" fill="${gem}"/><circle cx="0" cy="-40" r="9" fill="${gem}"/><circle cx="60" cy="-14" r="8" fill="${gem}"/><circle cx="-24" cy="30" r="6" fill="${gem}"/><circle cx="24" cy="30" r="6" fill="${gem}"/></g>`;
  const pennants = (y, sag, cols) => {
    let h = `<path d="M-10 ${y} Q640 ${y + sag} 1290 ${y}" fill="none" stroke="#3a2418" stroke-width="2.4"/>`;
    for (let i = 0; i < 22; i++) { const t = i / 21, x = -10 + t * 1300, yy = y + 2 * (1 - t) * t * sag; h += `<polygon points="${n0(x)},${n0(yy)} ${n0(x + 26)},${n0(yy)} ${n0(x + 13)},${n0(yy + 34)}" fill="${cols[i % cols.length]}" opacity=".92"/>`; }
    return h;
  };
  const rainbow = (cx, cy, r0) => ['#ff4f6a', '#ffa14f', '#ffe14f', '#7aff7a', '#4fc8ff', '#a88bff'].map((c, i) => `<path d="M${cx - r0 + i * 14} ${cy} A${r0 - i * 14} ${r0 - i * 14} 0 0 1 ${cx + r0 - i * 14} ${cy}" fill="none" stroke="${c}" stroke-width="14" opacity=".62"/>`).join('');
  const shockRings = (cx, cy, cols, n) => {
    let h = '';
    for (let i = 0; i < n; i++) h += `<circle class="pulse" style="animation-delay:${(-i * 3 / n).toFixed(2)}s" cx="${cx}" cy="${cy}" r="90" fill="none" stroke="${cols[i % cols.length]}" stroke-width="${5 - (i % 3)}"/>`;
    return h;
  };
  const chevrons = (n, seed, col, y0, y1) => {
    const r = mulberry32(seed);
    let h = '';
    for (let i = 0; i < n; i++) { const x = n0(r() * 1300), y = n0(y0 + r() * (y1 - y0)), sc = 0.7 + r() * 1.1; h += `<polyline class="sp" style="animation-duration:${(0.8 + r() * 1.4).toFixed(2)}s;animation-delay:${(-r() * 2).toFixed(2)}s" points="${x + 24 * sc},${y} ${x},${y + 16 * sc} ${x + 24 * sc},${y + 32 * sc}" fill="none" stroke="${col}" stroke-width="${(3 * sc).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" opacity="${(0.4 + r() * 0.5).toFixed(2)}"/>`; }
    return h;
  };

  // ================= 13) Immortals : 부서져도 불사신처럼 일어서는 영웅 =================
  add('imm-dusk',
    'linear-gradient(to bottom,#14134e 0,#3a3a9a 40%,#d96a7a 74%,#ffb36a 100%)',
    `${sStars(40, 12, 200)}
     ${rings('#ffd2a0', '#8aa8ff', 0.4, 0.34)}
     <circle cx="640" cy="440" r="90" fill="#ffe2b0" opacity=".9"/><circle cx="640" cy="440" r="200" fill="#ffb36a" opacity=".22"/>
     ${sSkyline('#26225e', 4, 520, 60, 200, 0.95)}
     ${bridge(520, 230, '#120f3a', '#2a2570')}
     ${bokeh('imd', 14, 3, ['#ffd2a0', '#ff8aa0'], 10, 40, 0.5, 100, 600)}
     ${sFade('imdd', 440)}`);
  add('imm-armor',
    'radial-gradient(ellipse 560px 400px at 640px 300px,rgba(60,140,255,.4),rgba(60,140,255,0)),linear-gradient(to bottom,#050a24 0,#0c1a52 56%,#050818 100%)',
    `<defs>${hexPattern('imh', '#4aa8ff', 0.5)}</defs>
     <rect width="1280" height="720" fill="url(#imh)" opacity=".55"/>
     ${rings('#4aa8ff', '#ff8a3a', 0.5, 0.4)}
     ${swarm('ima', 200, 50, '#4aa8ff', 3)}${swarm('imb', 420, 70, '#ff8a3a', 7)}${swarm('imc', 580, 40, '#8ac8ff', 11)}
     ${microbots(50, 4, ['#4aa8ff', '#ffffff', '#ff8a3a'], 60, 680)}
     ${glitch(8, 2, ['#4aa8ff'], 80, 640)}
     ${sFade('ima', 460, 0.8)}`);
  add('imm-rise',
    'radial-gradient(ellipse 560px 440px at 640px 300px,rgba(255,170,60,.65),rgba(255,170,60,0)),linear-gradient(to bottom,#2a0a3a 0,#7a1a4a 46%,#ff7a3a 100%)',
    `${rays('imr', 640, 300, 20, '#ffd27a', 0.5)}
     ${rings('#ffd27a', '#4aa8ff', 0.65, 0.5)}
     <polygon points="640,150 730,200 730,300 640,350 550,300 550,200" fill="none" stroke="#ffd27a" stroke-width="5" opacity=".85"/><polygon points="640,185 700,220 700,285 640,320 580,285 580,220" fill="#ffd27a" opacity=".35"/>
     ${fireworks(7, 5, ['#ffd27a', '#4aa8ff', '#ff6a8a', '#ffffff'])}
     ${sSkyline('#1a0a2a', 8, 680, 40, 160, 0.95)}
     ${embers(60, 3, '#ffc070', 220)}
     ${sFade('imrd', 460, 0.7)}`);

  // ================= 14) (G)I-DLE Fate : 붉은 실로 이어진 운명 =================
  add('fat-thread',
    'linear-gradient(to bottom,#0a0620 0,#1a0f40 56%,#0a0618 100%)',
    `${sStars(90, 77, 360, '#e8d8ff', 1.2)}
     <path d="M190 120 a42 42 0 1 0 42 58 a34 34 0 1 1 -42 -58Z" fill="#f4e6ff" opacity=".9"/>
     ${rings('#ff3a5a', '#c9a8ff', 0.4, 0.3)}
     ${strings('ft', 16, 5, '#ff3a5a', 2.2)}
     ${bokeh('ftb', 12, 3, ['#ff3a5a', '#c9a8ff'], 8, 30, 0.4, 100, 640)}
     ${sFade('ftd', 450)}`);
  add('fat-tarot',
    'radial-gradient(ellipse 600px 420px at 640px 300px,rgba(200,60,160,.4),rgba(200,60,160,0)),linear-gradient(to bottom,#12041e 0,#2a0a46 54%,#0c0414 100%)',
    `${rings('#ffd27a', '#ff5ac8', 0.5, 0.4)}
     ${fog('ftt', 8, 4, '#a860d8', 260, 700, 0.34)}
     ${tarot(150, 110, 120, 190, '#ffd27a', 'moon', -10)}${tarot(1010, 120, 120, 190, '#ffd27a', 'sun', 9, 'drift d2')}${tarot(560, 40, 110, 170, '#ff5ac8', 'star', 3, 'drift d3')}${tarot(330, 480, 100, 160, '#ff5ac8', 'heart', 12, 'drift d2')}${tarot(850, 470, 100, 160, '#ffd27a', 'star', -8)}
     ${strings('ftt', 8, 8, '#ff3a5a', 1.8)}
     ${sStars(50, 41, 400, '#ffe8c8', 1.2)}
     ${sFade('fttd', 450)}`);
  add('fat-crimson',
    'radial-gradient(ellipse 560px 440px at 640px 300px,rgba(255,40,60,.7),rgba(255,40,60,0)),linear-gradient(to bottom,#1a0208 0,#5a0816 50%,#12040a 100%)',
    `${rays('fcr', 640, 300, 26, '#ff4a5a', 0.4)}
     ${rings('#ff3a5a', '#ffd27a', 0.7, 0.55)}
     <circle cx="640" cy="300" r="130" fill="#ff3a5a" opacity=".9"/><circle cx="640" cy="300" r="260" fill="#ff3a5a" opacity=".2"/>
     <g class="spin" style="transform-origin:640px 300px;transform-box:view-box">${Array.from({ length: 24 }, (_, i) => { const a = (i * 15) * Math.PI / 180; return `<line x1="${n0(640 + Math.cos(a) * 130)}" y1="${n0(300 + Math.sin(a) * 130)}" x2="${n0(640 + Math.cos(a) * 900)}" y2="${n0(300 + Math.sin(a) * 900)}" stroke="#ffd27a" stroke-opacity=".28" stroke-width="1.4"/>`; }).join('')}</g>
     ${strings('fcs', 14, 12, '#ffd27a', 2)}
     ${fall(50, 14, ['#ff2a4a', '#ff7a8a', '#ffd27a'], 'petal', 1.3, 6, 7)}
     ${sFade('fcrd', 450)}`);

  // ================= 15) My Kingdom : 달콤하고 웅장한 쿠키 왕국 =================
  add('mk-meadow',
    'linear-gradient(to bottom,#6a8aff 0,#b8a8ff 40%,#ffc8d8 76%,#ffe8c8 100%)',
    `${rings('#ffffff', '#ffe0a0', 0.5, 0.42)}
     ${sCloud(190, 150, 1.2, 0.7)}${sCloud(1090, 190, 1.3, 0.7, 'drift d2')}${sCloud(640, 360, 1.7, 0.5, 'drift d3')}
     ${hills('#8ad8a0', 560, 90, 3, 0.95)}
     ${castle(640, 470, 0.55, '#b88adf', '#fff0a0')}
     ${hills('#5cb878', 620, 70, 8, 1)}${hills('#3a9858', 680, 50, 5, 1)}
     ${bokeh('mkm', 16, 4, ['#ffffff', '#fff0a0', '#ffc8e0'], 6, 22, 0.6, 140, 620)}
     ${fall(14, 6, ['#ffc8e0', '#ffffff'], 'petal', 0.8)}
     ${sFade('mkmd', 460, 0.85)}`);
  add('mk-castle',
    'linear-gradient(to bottom,#4a3a9a 0,#e0709a 40%,#ffa860 72%,#ffe08a 100%)',
    `${rays('mkc', 640, 320, 14, '#fff0b0', 0.4, 1400, 0.2)}
     ${rings('#fff0b0', '#ffd0e8', 0.55, 0.45)}
     <circle cx="640" cy="320" r="100" fill="#fff6d0" opacity=".92"/>
     ${castle(640, 560, 1.15, '#4a2a6a', '#ffe08a')}${castle(220, 600, 0.6, '#5a3a78', '#ffe08a')}${castle(1070, 600, 0.6, '#5a3a78', '#ffe08a')}
     ${pennants(60, 56, ['#ff4f6a', '#ffd04f', '#4fc8ff', '#a88bff', '#7aff7a'])}
     ${hills('#8a4a3a', 640, 60, 3, 1)}
     ${bokeh('mkc', 14, 5, ['#fff0b0', '#ffc8a0'], 8, 28, 0.6, 100, 600)}
     ${sFade('mkcd', 470, 0.8)}`);
  add('mk-royal',
    'radial-gradient(ellipse 600px 440px at 640px 260px,rgba(255,236,150,.8),rgba(255,236,150,0)),linear-gradient(to bottom,#5a2a9a 0,#c04aa8 48%,#ff9a6a 100%)',
    `${rays('mkr', 640, 260, 24, '#fff0a0', 0.55)}
     ${rainbow(640, 600, 520)}
     ${rings('#fff0a0', '#ffffff', 0.75, 0.6)}
     ${crown(640, 250, 2.2, '#ffd04f', '#ff4f6a')}
     ${fireworks(6, 9, ['#ffd04f', '#ff4f9a', '#4fc8ff', '#ffffff'])}
     ${pennants(40, 40, ['#ff4f6a', '#ffd04f', '#4fc8ff', '#a88bff'])}
     ${fall(80, 21, ['#ffd04f', '#ff4f9a', '#4fc8ff', '#7aff7a', '#ffffff'], 'rect', 1.5, 4, 5)}
     ${sFade('mkrd', 470, 0.78)}`);

  // ================= 16) Supersonic : 소리보다 빠르게 =================
  add('sup-dawn',
    'linear-gradient(to bottom,#2a1a7a 0,#7a5ad8 36%,#ff8ac8 70%,#ffd8e8 100%)',
    `${sStars(60, 13, 260, '#fff', 1.3)}
     ${rings('#ffffff', '#8ae8ff', 0.5, 0.42)}
     <circle cx="640" cy="440" r="70" fill="#fff8f0" opacity=".95"/><circle cx="640" cy="440" r="170" fill="#ffd8e8" opacity=".3"/>
     <g stroke="#ffffff" stroke-opacity=".25">${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="0" y1="${450 + i * 38}" x2="1280" y2="${450 + i * 38}" stroke-width="${1 + i * 0.6}"/>`).join('')}</g>
     ${speed('sud', 16, 4, '#ffffff', 80, 640)}
     ${bokeh('sudb', 14, 6, ['#ffffff', '#8ae8ff', '#ffc8e8'], 8, 30, 0.5, 100, 640)}
     ${sFade('sudd', 450, 0.85)}`);
  add('sup-sonic',
    'radial-gradient(ellipse 560px 420px at 640px 300px,rgba(80,200,255,.5),rgba(80,200,255,0)),linear-gradient(to bottom,#06123a 0,#0e2e7a 56%,#050a24 100%)',
    `${shockRings(640, 300, ['#8ae8ff', '#ff8ac8', '#ffffff'], 6)}
     ${rings('#8ae8ff', '#ff8ac8', 0.5, 0.4)}
     ${chevrons(26, 3, '#8ae8ff', 60, 640)}${chevrons(14, 8, '#ff8ac8', 60, 640)}
     <circle cx="640" cy="300" r="50" fill="#ffffff" opacity=".9"/>
     ${speed('sus', 14, 5, '#cdf4ff', 60, 640)}
     ${sStars(50, 21, 400, '#cdf4ff', 1.2)}
     ${sFade('susd', 460, 0.8)}`);
  add('sup-burst',
    'radial-gradient(ellipse 620px 460px at 640px 300px,rgba(255,255,255,.9),rgba(255,140,200,.4) 40%,rgba(255,140,200,0) 70%),linear-gradient(to bottom,#3a1a8a 0,#d04ab8 50%,#4ad8ff 100%)',
    `${rays('sub', 640, 300, 28, '#ffffff', 0.6)}
     <polygon points="640,300 1400,60 1400,540" fill="#ffffff" opacity=".12"/><polygon points="640,300 -120,60 -120,540" fill="#ffffff" opacity=".12"/>
     ${shockRings(640, 300, ['#ffffff', '#ffe0f4', '#c8f4ff'], 5)}
     ${rings('#ffffff', '#ffe0f4', 0.8, 0.65)}
     <circle cx="640" cy="300" r="90" fill="#ffffff"/>
     ${chevrons(20, 4, '#ffffff', 60, 640)}${speed('subs', 20, 7, '#ffffff', 40, 680)}
     ${fall(80, 25, ['#ff8ac8', '#8ae8ff', '#ffffff', '#fff0a0', '#a8ffd0'], 'rect', 1.5, 3, 4)}
     ${bokeh('subb', 16, 3, ['#ffffff', '#ffc8e8'], 12, 50, 0.5, 40, 680)}
     ${sFade('subd', 470, 0.7)}`);

  // ---------- 4차 부품 ----------
  const eyes = (n, seed, col, y0, y1) => {
    const r = mulberry32(seed);
    let h = `<defs>${rad('eyg' + seed, [[0, col, 0.7], [1, col, 0]])}</defs>`;
    for (let i = 0; i < n; i++) {
      const x = n0(40 + r() * 1200), y = n0(y0 + r() * (y1 - y0)), sc = 0.7 + r() * 1.1, gap = 20 * sc;
      h += `<g class="tw" style="animation-duration:${(3 + r() * 5).toFixed(1)}s;animation-delay:${(-r() * 6).toFixed(1)}s"><circle cx="${x}" cy="${y}" r="${n0(30 * sc)}" fill="url(#eyg${seed})"/>` +
        [-1, 1].map((d) => `<ellipse cx="${n0(x + d * gap)}" cy="${y}" rx="${n0(9 * sc)}" ry="${n0(5 * sc)}" fill="${col}"/><rect x="${n0(x + d * gap - 1.2)}" y="${n0(y - 5 * sc)}" width="2.4" height="${n0(10 * sc)}" fill="#05030a"/>`).join('') + '</g>';
    }
    return h;
  };
  const teeth = (y, down, col, glow, n = 14) => {
    const x0 = 340, w = 600 / n;
    let h = '';
    for (let i = 0; i < n; i++) { const x = x0 + i * w, hh = 70 + ((i * 37) % 5) * 14; h += down ? `<polygon points="${n0(x)},${y} ${n0(x + w)},${y} ${n0(x + w / 2)},${y + hh}" fill="${col}"/>` : `<polygon points="${n0(x)},${y} ${n0(x + w)},${y} ${n0(x + w / 2)},${y - hh}" fill="${col}"/>`; }
    return h;
  };
  const claw = (x, y, len, col) => [0, 1, 2].map((i) => `<polygon points="${x + i * 54},${y} ${x + i * 54 + 16},${y} ${x + i * 54 + len * 0.5 + 5},${y + len} ${x + i * 54 + len * 0.5},${y + len}" fill="${col}" opacity=".88"/><polygon points="${x + i * 54 - 6},${y - 6} ${x + i * 54 + 22},${y - 6} ${x + i * 54 + len * 0.5 + 12},${y + len + 6} ${x + i * 54 + len * 0.5 - 7},${y + len + 6}" fill="${col}" opacity=".18"/>`).join('');
  const lasers = (sid, list) => list.map(([ox, oy, tx, ty, col, dur, del], i) => `<line class="swing" style="transform-origin:${ox}px ${oy}px;transform-box:view-box;animation-duration:${dur}s;animation-delay:${del}s" x1="${ox}" y1="${oy}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="3.2" stroke-linecap="round" opacity=".85"/><line class="swing" style="transform-origin:${ox}px ${oy}px;transform-box:view-box;animation-duration:${dur}s;animation-delay:${del}s" x1="${ox}" y1="${oy}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="12" stroke-linecap="round" opacity=".16"/>`).join('');
  const eq = (n, seed, col, base, maxH) => {
    const r = mulberry32(seed);
    let h = '';
    for (let i = 0; i < n; i++) { const hh = n0(30 + r() * maxH), w = 1280 / n - 6; h += `<rect class="flick" style="animation-duration:${(0.4 + r() * 0.9).toFixed(2)}s;animation-delay:${(-r()).toFixed(2)}s" x="${n0(i * (1280 / n) + 3)}" y="${base - hh}" width="${n0(w)}" height="${hh}" fill="${col}" opacity=".26"/>`; }
    return h;
  };
  const guitar = (x, y, s, rot, col) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" fill="${col}"><circle cx="0" cy="0" r="64"/><circle cx="0" cy="-92" r="48"/><rect x="-60" y="-130" width="120" height="70"/><rect x="-9" y="-440" width="18" height="320"/><rect x="-16" y="-480" width="32" height="48" rx="6"/><circle cx="0" cy="-34" r="24" fill="#05030c" opacity=".75"/></g>`;
  const mirrorFrame = (sid, cx, cy, rx, ry, col) => `<defs>${lin(sid + 'mg', [[0, '#ffffff', 0.18], [1, '#ffffff', 0.02]])}</defs><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${sid}mg)" stroke="${col}" stroke-width="12"/><ellipse cx="${cx}" cy="${cy}" rx="${rx - 14}" ry="${ry - 14}" fill="none" stroke="${col}" stroke-opacity=".5" stroke-width="2"/><path d="M${cx - rx * 0.6} ${cy - ry * 0.55} Q${cx - rx * 0.3} ${cy - ry * 0.85} ${cx + rx * 0.1} ${cy - ry * 0.92}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/>`;
  const risingHearts = (n, seed, cols) => {
    const r = mulberry32(seed);
    let h = '';
    for (let i = 0; i < n; i++) {
      const x = n0(r() * 1280), y0 = n0(60 + r() * 640), sc = 0.7 + r() * 1.3, dx = n0((r() - 0.5) * 120), c = cols[i % cols.length];
      h += `<g transform="translate(${x} ${y0})"><g class="up" style="--y0:${y0}px;--dx:${dx}px;animation-duration:${n0(14 + r() * 16)}s;animation-delay:${n0(-r() * 30)}s"><path transform="scale(${sc.toFixed(2)})" d="M0 18C-26 0 -12 -18 0 -6C12 -18 26 0 0 18Z" fill="${c}" opacity=".85"/></g></g>`;
    }
    return h;
  };

  // ================= 17) Monster : 내 안의 괴물 =================
  add('mon-lair',
    'linear-gradient(to bottom,#03060a 0,#0a1a14 56%,#04080a 100%)',
    `${sStars(50, 12, 260, '#bfffd8', 1)}
     <circle cx="900" cy="150" r="46" fill="#d8ffe8" opacity=".6"/><circle cx="900" cy="150" r="120" fill="#4aff9a" opacity=".1"/>
     ${rings('#4aff9a', '#a86bff', 0.3, 0.26)}
     ${trees(5, '#020504', 700, 11)}
     ${fog('mnl', 10, 4, '#4aff9a', 340, 700, 0.3)}
     ${eyes(9, 3, '#7aff4a', 360, 660)}${eyes(3, 8, '#ff3a5a', 200, 360)}
     <rect x="0" y="660" width="1280" height="60" fill="#020504"/>
     ${sFade('mnld', 460)}`);
  add('mon-jaw',
    'radial-gradient(ellipse 600px 380px at 640px 360px,rgba(120,255,80,.5),rgba(120,255,80,0)),linear-gradient(to bottom,#0a0418 0,#2a0a4a 50%,#06020e 100%)',
    `${rings('#7aff4a', '#c06bff', 0.5, 0.4)}
     <rect x="340" y="130" width="600" height="470" fill="#1a3a10" opacity=".45"/>
     ${teeth(130, true, '#eaffd8', '#7aff4a')}${teeth(600, false, '#eaffd8', '#7aff4a')}
     <rect x="330" y="118" width="620" height="14" fill="#2a0a4a"/><rect x="330" y="598" width="620" height="14" fill="#2a0a4a"/>
     ${claw(110, 200, 280, '#c06bff')}${claw(990, 240, 260, '#7aff4a')}
     ${eyes(3, 5, '#7aff4a', 260, 420)}
     ${glitch(10, 3, ['#7aff4a', '#c06bff'], 100, 600)}
     ${sFade('mnjd', 480, 0.6)}`);
  add('mon-rave',
    'radial-gradient(ellipse 600px 420px at 640px 300px,rgba(150,255,60,.55),rgba(150,255,60,0)),linear-gradient(to bottom,#12042e 0,#4a0a7a 48%,#08020e 100%)',
    `${rays('mnr', 640, 300, 22, '#a8ff4a', 0.45)}
     ${rings('#a8ff4a', '#ff4aff', 0.7, 0.55)}
     ${lasers('mnr', [[160, 720, 640, 0, '#a8ff4a', 3.4, 0], [1120, 720, 640, 0, '#ff4aff', 3.8, -1], [420, 720, 900, 0, '#4affff', 4.2, -2], [860, 720, 380, 0, '#a8ff4a', 3.6, -1.5]])}
     <circle cx="640" cy="300" r="90" fill="#eaffd8" opacity=".9"/>${eyes(2, 9, '#05030a', 270, 330)}
     ${eq(40, 4, '#a8ff4a', 720, 150)}
     ${fall(50, 11, ['#a8ff4a', '#ff4aff', '#4affff', '#ffffff'], 'rect', 1.3, 3, 4)}
     ${sFade('mnrd', 560, 0.4)}`);

  // ================= 18) Love Yourself : 담담하게 건네는 이별 인사 =================
  add('lov-roof',
    'linear-gradient(to bottom,#3a2a6a 0,#c0608a 42%,#ff9a6a 74%,#ffd08a 100%)',
    `${rings('#ffe0a0', '#ffb0c8', 0.4, 0.34)}
     <circle cx="640" cy="380" r="84" fill="#fff0c8" opacity=".92"/><circle cx="640" cy="380" r="190" fill="#ffd08a" opacity=".25"/>
     ${sSkyline('#3a2050', 6, 560, 60, 210, 0.95)}${sSkyline('#1e0f30', 9, 640, 40, 140, 1)}
     ${guitar(240, 700, 0.6, -18, '#0e0618')}
     ${bulbs('lvr', 110, 70, '#ffd9a0', 12)}
     ${bokeh('lvrb', 14, 4, ['#ffe0a0', '#ffb0c8'], 8, 30, 0.5, 120, 620)}
     ${sFade('lvrd', 470)}`);
  add('lov-mirror',
    'linear-gradient(to bottom,#0a1038 0,#202a7a 46%,#10183e 100%)',
    `${sStars(110, 44, 330, '#e8f0ff')}
     ${rings('#b8c8ff', '#ffd9a0', 0.4, 0.32)}
     <circle cx="640" cy="250" r="64" fill="#fff4d8" opacity=".92"/>
     <rect x="0" y="380" width="1280" height="340" fill="#0a1030"/>
     <g transform="translate(0 760) scale(1 -1)" opacity=".3"><circle cx="640" cy="250" r="64" fill="#fff4d8"/>${sStars(60, 44, 330, '#e8f0ff')}</g>
     ${[0, 1, 2, 3, 4].map((i) => `<ellipse class="sway" style="animation-duration:${9 + i * 3}s" cx="640" cy="${430 + i * 50}" rx="${160 + i * 70}" ry="${8 + i * 3}" fill="none" stroke="#b8c8ff" stroke-opacity="${0.4 - i * 0.06}" stroke-width="2"/>`).join('')}
     ${mirrorFrame('lmf', 640, 300, 260, 190, '#d8b25a')}
     ${bokeh('lmb', 14, 6, ['#b8c8ff', '#ffd9a0'], 8, 30, 0.4, 100, 620)}
     ${sFade('lmd', 470)}`);
  add('lov-heart',
    'radial-gradient(ellipse 560px 440px at 640px 300px,rgba(255,170,200,.7),rgba(255,170,200,0)),linear-gradient(to bottom,#5a1a7a 0,#c04a8a 46%,#ff9a8a 100%)',
    `${rays('lvh', 640, 300, 20, '#ffe0e8', 0.5)}
     ${rings('#ffe0e8', '#ffd9a0', 0.7, 0.55)}
     <path transform="translate(640 300) scale(7)" d="M0 18C-26 0 -12 -18 0 -6C12 -18 26 0 0 18Z" fill="none" stroke="#ffe0e8" stroke-width="1.6" opacity=".85"/><path transform="translate(640 300) scale(5.4)" d="M0 18C-26 0 -12 -18 0 -6C12 -18 26 0 0 18Z" fill="#ff6a9a" opacity=".5"/>
     ${risingHearts(40, 7, ['#ffe0e8', '#ff6a9a', '#ffd9a0', '#ffffff'])}
     ${bokeh('lvhb', 22, 3, ['#ffe0e8', '#ffd9a0', '#ff9ac4'], 12, 54, 0.5, 40, 680)}
     ${fall(30, 9, ['#ffffff', '#ffe0e8'], 'petal', 0.9)}
     ${sFade('lvhd', 470, 0.78)}`);

  // ---------- 5차 부품 ----------
  const saguaro = (x, base, s, col) => `<g transform="translate(${x} ${base}) scale(${s})" fill="${col}"><rect x="-9" y="-150" width="18" height="150" rx="9"/><path d="M-9 -70 H-34 a12 12 0 0 1 -12 -12 V-112 a10 10 0 0 1 20 0 V-86 H-9Z"/><path d="M9 -96 H30 a12 12 0 0 0 12 -12 V-128 a10 10 0 0 0 -20 0 V-108 H9Z"/></g>`;
  const poles = (base, col, wireCol) => {
    let h = '';
    const xs = [60, 330, 590, 850, 1110];
    xs.forEach((x, i) => { const hh = 190 - i * 14; h += `<rect x="${x - 4}" y="${base - hh}" width="8" height="${hh}" fill="${col}"/><rect x="${x - 36}" y="${base - hh + 14}" width="72" height="7" fill="${col}"/>`; });
    for (let k = 0; k < 3; k++) { let d = ''; xs.forEach((x, i) => { const hh = 190 - i * 14, y = base - hh + 18 + k * 0; d += (i ? ` Q${n0((xs[i - 1] + x) / 2)} ${n0(y + 22)} ${x + (k - 1) * 28} ${y}` : `M${x + (k - 1) * 28} ${y}`); }); h += `<path d="${d}" fill="none" stroke="${wireCol}" stroke-width="1.6" opacity=".7"/>`; }
    return h;
  };
  const milkyWay = (sid) => `<defs>${lin(sid + 'mw', [[0, '#b8a8ff', 0], [0.5, '#e8d8ff', 0.28], [1, '#b8a8ff', 0]], 0, 0, 1, 1)}</defs><polygon points="-100,520 -100,360 1380,-60 1380,100" fill="url(#${sid}mw)"/>`;
  const roadPersp = (sid, vx, vy, col, dash) => `<polygon points="${vx - 30},${vy} ${vx + 30},${vy} 1150,720 130,720" fill="${col}"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => { const t = (i + 1) / 7, y = vy + t * t * (720 - vy), w = 2 + t * 14, h = 6 + t * 42; return `<rect x="${n0(vx - w / 2)}" y="${n0(y)}" width="${n0(w)}" height="${n0(h)}" fill="${dash}" opacity="${(0.45 + t * 0.45).toFixed(2)}"/>`; }).join('')}`;

  // ================= 19) Nevada : 사막의 밤, 달리는 길 위의 그리움 =================
  add('nev-night',
    'linear-gradient(to bottom,#04051c 0,#101a52 50%,#2a1a50 100%)',
    `${sStars(160, 83, 420, '#e8f0ff', 1.5)}
     ${milkyWay('nvn')}
     ${rings('#b8a8ff', '#ffd9a0', 0.3, 0.26)}
     ${shooting('nvn', 3, 6, '#ffffff')}
     ${mesas('#0a0820', 590, 3, 1)}
     ${saguaro(180, 640, 1.5, '#05030f')}${saguaro(1090, 650, 1.8, '#05030f')}${saguaro(940, 640, 1.0, '#05030f')}
     <rect x="0" y="650" width="1280" height="70" fill="#05030f"/>
     ${bokeh('nvnb', 10, 3, ['#ffd9a0', '#b8a8ff'], 4, 12, 0.7, 380, 640)}
     ${sFade('nvnd', 470)}`);
  add('nev-road',
    'linear-gradient(to bottom,#2a1a6a 0,#b0508a 38%,#ff8a5a 66%,#ffd08a 100%)',
    `${rings('#ffe0a0', '#ffb0c8', 0.45, 0.38)}
     <circle cx="640" cy="360" r="110" fill="#fff0c8" opacity=".92"/><circle cx="640" cy="360" r="240" fill="#ffd08a" opacity=".22"/>
     ${mesas('#5a2a50', 440, 4, 0.95)}${mesas('#2a1238', 520, 8, 1)}
     ${poles(560, '#12081e', '#2a1238')}
     ${roadPersp('nvr', 640, 440, '#15091f', '#ffe0a0')}
     ${saguaro(150, 660, 1.4, '#0a0414')}${saguaro(1140, 670, 1.6, '#0a0414')}
     ${bokeh('nvrb', 10, 5, ['#ffe0a0', '#ffb0c8'], 6, 22, 0.6, 140, 520)}
     ${sFade('nvrd', 480, 0.8)}`);
  add('nev-neon',
    'linear-gradient(to bottom,#12043a 0,#3a0a6a 48%,#14041e 100%)',
    `${sStars(60, 31, 240, '#ffe8ff', 1.2)}
     ${rings('#ff4fd8', '#4fe0ff', 0.55, 0.45)}
     ${spots('nvs', [[200, '#ffffff', 0.45, 7, 0, 70], [520, '#ffd04f', 0.4, 8, -2, 70], [860, '#4fe0ff', 0.45, 6.5, -3, 70], [1130, '#ff4fd8', 0.45, 7.5, -1, 70]], 70)}
     ${sSkyline('#0c0420', 12, 640, 60, 300, 1)}
     ${[[90, 330, 80, 200, '#ff4fd8'], [260, 380, 60, 150, '#4fe0ff'], [980, 340, 70, 190, '#ffd04f'], [1130, 400, 60, 130, '#ff4fd8']].map(([x, y, w, h, c], i) => neon(x, y, w, h, c, 6, i * 0.6)).join('')}
     <g class="tw"><polygon points="640,70 662,124 720,124 674,158 692,214 640,180 588,214 606,158 560,124 618,124" fill="none" stroke="#ffd04f" stroke-width="5"/><polygon points="640,70 662,124 720,124 674,158 692,214 640,180 588,214 606,158 560,124 618,124" fill="none" stroke="#ffd04f" stroke-width="16" opacity=".2"/></g>
     ${fireworks(5, 3, ['#ffd04f', '#ff4fd8', '#4fe0ff'])}
     ${bokeh('nvnb2', 20, 4, ['#ffd04f', '#ff4fd8', '#4fe0ff'], 10, 44, 0.5, 120, 660)}
     ${sFade('nvsd', 480, 0.7)}`);

  // ---------- 6차 부품 ----------
  const photo = (x, y, w, h2, rot, tint, cls = 'drift') => `<g class="${cls}"><g transform="rotate(${rot} ${x + w / 2} ${y + h2 / 2})"><rect x="${x}" y="${y}" width="${w}" height="${h2}" fill="#f4ead8"/><rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h2 - 30}" fill="${tint}" opacity=".85"/><polygon points="${x + 8},${y + h2 - 22} ${x + w * 0.4},${y + h2 * 0.45} ${x + w * 0.62},${y + h2 * 0.7} ${x + w * 0.78},${y + h2 * 0.5} ${x + w - 8},${y + h2 - 22}" fill="#00000030"/><circle cx="${x + w * 0.72}" cy="${y + h2 * 0.28}" r="${n0(w * 0.09)}" fill="#fff6d0" opacity=".9"/></g></g>`;
  const clothesline = (y, sag, seed, tints, skipFrom = 99) => {
    const r = mulberry32(seed);
    let h = `<path d="M-10 ${y} Q640 ${y + sag} 1290 ${y}" fill="none" stroke="#3a2418" stroke-width="2.4"/>`;
    for (let i = 0; i < 7; i++) { if (i >= skipFrom) continue; const t = (i + 0.5) / 7, x = -10 + t * 1300, yy = y + 2 * (1 - t) * t * sag; h += `<rect x="${n0(x - 3)}" y="${n0(yy - 4)}" width="6" height="14" fill="#8a5a3a"/>` + photo(n0(x - 46), n0(yy + 6), 92, 112, n0((r() - 0.5) * 12), tints[i % tints.length], ['drift', 'drift d2', 'drift d3'][i % 3]); }
    return h;
  };
  const filmStrip = (y, rot, col, tints, seed) => {
    const r = mulberry32(seed);
    let h = `<g class="drift ${['', 'd2', 'd3'][seed % 3]}"><g transform="rotate(${rot} 640 ${y + 40})"><rect x="-200" y="${y}" width="1700" height="80" fill="${col}"/>`;
    for (let x = -190; x < 1500; x += 22) h += `<rect x="${x}" y="${y + 6}" width="12" height="8" fill="#0a0a0a"/><rect x="${x}" y="${y + 66}" width="12" height="8" fill="#0a0a0a"/>`;
    for (let x = -180; x < 1500; x += 118) h += `<rect x="${x}" y="${y + 18}" width="104" height="44" fill="${tints[n0(r() * 9) % tints.length]}" opacity=".85"/>`;
    return h + '</g></g>';
  };
  const candle = (x, y, s, col) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cy="-48" r="46" fill="#ffd27a" opacity=".16"/><rect x="-9" y="-40" width="18" height="40" fill="${col}"/><path class="flick" d="M0 -78 C 10 -62 12 -52 0 -42 C -12 -52 -10 -62 0 -78Z" fill="#ffd27a"/><path class="flick" d="M0 -64 C 5 -56 5 -50 0 -44 C -5 -50 -5 -56 0 -64Z" fill="#fff6d0"/></g>`;
  const glass = (cx, cy, s, rot, col) => `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${s})"><path d="M-24 -80 L24 -80 L18 -10 Q0 8 -18 -10Z" fill="${col}" fill-opacity=".35" stroke="${col}" stroke-width="3"/><path d="M-20 -50 L20 -50 L18 -12 Q0 4 -18 -12Z" fill="#ffd27a" opacity=".6"/><rect x="-3" y="-6" width="6" height="56" fill="${col}" fill-opacity=".7"/><ellipse cx="0" cy="52" rx="26" ry="5" fill="${col}" fill-opacity=".7"/></g>`;
  const snow = (n, seed, size = 1) => {
    const r = mulberry32(seed);
    let h = '';
    for (let i = 0; i < n; i++) {
      const x = n0(r() * 1280), y0 = n0(r() * 720), rr = (1.2 + r() * 3.2) * size, dx = n0((r() - 0.5) * 140);
      h += `<g transform="translate(${x} ${y0})"><g class="pf" style="--y0:${y0}px;--dx:${dx}px;animation-duration:${(7 + r() * 11).toFixed(1)}s;animation-delay:${(-r() * 18).toFixed(1)}s"><circle r="${rr.toFixed(1)}" fill="#ffffff" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/></g></g>`;
    }
    return h;
  };
  const pine = (x, base, hgt, col) => { let h = `<rect x="${x - 5}" y="${base - 14}" width="10" height="16" fill="${col}"/>`; for (let k = 0; k < 4; k++) { const w = hgt * (0.46 - k * 0.07), yy = base - 14 - k * hgt * 0.22; h += `<polygon points="${x - w},${n0(yy)} ${x + w},${n0(yy)} ${x},${n0(yy - hgt * 0.34)}" fill="${col}"/><polygon points="${n0(x - w * 0.5)},${n0(yy - hgt * 0.17)} ${n0(x + w * 0.5)},${n0(yy - hgt * 0.17)} ${x},${n0(yy - hgt * 0.34)}" fill="#eaf2ff" opacity=".5"/>`; } return h; };
  const snowman = (x, base, s, col) => `<g transform="translate(${x} ${base}) scale(${s})"><circle cy="-46" r="46" fill="${col}"/><circle cy="-112" r="34" fill="${col}"/><circle cy="-158" r="24" fill="${col}"/><rect x="-22" y="-196" width="44" height="22" fill="#12183a"/><rect x="-32" y="-176" width="64" height="7" fill="#12183a"/><polygon points="0,-160 30,-152 0,-148" fill="#ff8a3a"/><circle cx="-8" cy="-166" r="2.6" fill="#12183a"/><circle cx="8" cy="-166" r="2.6" fill="#12183a"/><path d="M-34 -118 L-92 -150 M34 -118 L92 -146" stroke="#3a2418" stroke-width="5" stroke-linecap="round"/><circle cy="-120" r="3.5" fill="#12183a"/><circle cy="-100" r="3.5" fill="#12183a"/></g>`;
  const house = (x, base, w, h2, wall, roof, lit) => `<rect x="${x}" y="${base - h2}" width="${w}" height="${h2}" fill="${wall}"/><polygon points="${x - 10},${base - h2} ${x + w + 10},${base - h2} ${x + w / 2},${base - h2 - w * 0.5}" fill="${roof}"/><polygon points="${x - 6},${base - h2 - 2} ${x + w + 6},${base - h2 - 2} ${x + w / 2},${base - h2 - w * 0.5 + 2} ${x + w / 2},${base - h2 - w * 0.5 - 6}" fill="#eaf2ff" opacity=".85"/><rect x="${x + w * 0.2}" y="${base - h2 * 0.65}" width="${w * 0.22}" height="${h2 * 0.32}" fill="${lit}"/><rect x="${x + w * 0.58}" y="${base - h2 * 0.65}" width="${w * 0.22}" height="${h2 * 0.32}" fill="${lit}"/><circle cx="${x + w * 0.31}" cy="${base - h2 * 0.49}" r="${w * 0.22}" fill="${lit}" opacity=".18"/><rect x="${x + w * 0.72}" y="${base - h2 - w * 0.4}" width="12" height="${w * 0.32}" fill="${wall}"/><ellipse class="drift" cx="${x + w * 0.72 + 6}" cy="${base - h2 - w * 0.5}" rx="14" ry="9" fill="#cdd8ff" opacity=".35"/>`;
  const flake = (cx, cy, r, col) => `<g class="spin2" style="transform-origin:${cx}px ${cy}px;transform-box:view-box" stroke="${col}" stroke-width="3" stroke-linecap="round" opacity=".8">${[0, 60, 120].map((a) => `<line x1="${n0(cx - Math.cos(a * Math.PI / 180) * r)}" y1="${n0(cy - Math.sin(a * Math.PI / 180) * r)}" x2="${n0(cx + Math.cos(a * Math.PI / 180) * r)}" y2="${n0(cy + Math.sin(a * Math.PI / 180) * r)}"/>`).join('')}${[0, 60, 120, 180, 240, 300].map((a) => { const ca = Math.cos(a * Math.PI / 180), sa = Math.sin(a * Math.PI / 180), bx = cx + ca * r * 0.62, by = cy + sa * r * 0.62; return `<line x1="${n0(bx)}" y1="${n0(by)}" x2="${n0(bx + Math.cos((a + 40) * Math.PI / 180) * r * 0.3)}" y2="${n0(by + Math.sin((a + 40) * Math.PI / 180) * r * 0.3)}"/><line x1="${n0(bx)}" y1="${n0(by)}" x2="${n0(bx + Math.cos((a - 40) * Math.PI / 180) * r * 0.3)}" y2="${n0(by + Math.sin((a - 40) * Math.PI / 180) * r * 0.3)}"/>`; }).join('')}</g>`;
  const swingSet = (cx, base, hgt, col) => `<g stroke="${col}" stroke-width="9" stroke-linecap="round" fill="none"><path d="M${cx - 150} ${base} L${cx - 90} ${base - hgt} M${cx - 30} ${base} L${cx - 90} ${base - hgt} M${cx + 30} ${base} L${cx + 90} ${base - hgt} M${cx + 150} ${base} L${cx + 90} ${base - hgt} M${cx - 100} ${base - hgt} L${cx + 100} ${base - hgt}"/></g><g class="swing" style="transform-origin:${cx - 40}px ${base - hgt}px;transform-box:view-box;animation-duration:6s"><path d="M${cx - 58} ${base - hgt} L${cx - 58} ${base - 70} M${cx + 2} ${base - hgt} L${cx + 2} ${base - 70}" stroke="${col}" stroke-width="3" fill="none"/><rect x="${cx - 64}" y="${base - 72}" width="72" height="8" rx="3" fill="${col}"/></g>`;
  const pendulum = (cx, top, len, r, col, dur) => `<g class="swing" style="transform-origin:${cx}px ${top}px;transform-box:view-box;animation-duration:${dur}s"><line x1="${cx}" y1="${top}" x2="${cx}" y2="${top + len}" stroke="${col}" stroke-width="6"/><circle cx="${cx}" cy="${top + len}" r="${r}" fill="${col}"/><circle cx="${cx}" cy="${top + len}" r="${r * 1.8}" fill="${col}" opacity=".16"/><circle cx="${cx - r * 0.3}" cy="${top + len - r * 0.3}" r="${r * 0.28}" fill="#fff" opacity=".5"/></g>`;
  const tide = (col, y, amp, dur, op) => `<path class="sway" style="animation-duration:${dur}s" d="M-120 ${y} ${Array.from({ length: 9 }, (_, i) => `Q${-20 + i * 170} ${y - amp * (i % 2 ? 1 : -1)} ${50 + i * 170} ${y}`).join(' ')} L1500 720 L-120 720Z" fill="${col}" opacity="${op}"/>`;

  // ================= 20) Memories : 곁에 없는 이들을 위한 건배 =================
  add('mem-album',
    'linear-gradient(to bottom,#3a2418 0,#6a4a30 54%,#2a1a12 100%)',
    `<defs>${lin('mal-s', [[0, '#ffe2a8', 0.45], [1, '#ffe2a8', 0]], 0, 0, 1, 1)}</defs>
     ${sRings('#ffd9a0', '#ffb08a', 0.32, 0.26)}
     <polygon points="880,0 1130,0 760,720 360,720" fill="url(#mal-s)"/>
     ${clothesline(120, 90, 3, ['#7a9ac8', '#c8806a', '#8ac8a0', '#d8b868'], 5)}
     ${clothesline(330, 60, 8, ['#c88aa8', '#a8c878', '#6a8ac8', '#d8a068'])}
     ${bokeh('mal', 22, 4, ['#ffe2a8', '#ffffff'], 3, 10, 0.8, 100, 640)}
     ${sFade('mald', 460, 0.9)}`);
  add('mem-film',
    'linear-gradient(to bottom,#0a1c24 0,#1a3a44 54%,#0a1218 100%)',
    `<defs>${lin('mfl-b', [[0, '#fff0c8', 0.4], [1, '#fff0c8', 0]], 0, 0, 1, 0)}</defs>
     ${sRings('#ffd9a0', '#6ac8d8', 0.36, 0.3)}
     <polygon points="40,360 1300,60 1300,660" fill="url(#mfl-b)"/>
     ${filmStrip(120, -6, '#14110e', ['#c8806a', '#7a9ac8', '#d8b868', '#8ac8a0', '#c88aa8'], 3)}${filmStrip(330, 5, '#14110e', ['#d8b868', '#6ac8d8', '#c8806a', '#a8c878', '#c88aa8'], 7)}${filmStrip(540, -4, '#14110e', ['#8ac8a0', '#c8806a', '#7a9ac8', '#d8b868', '#c88aa8'], 11)}
     <circle cx="70" cy="360" r="34" fill="#fff0c8" opacity=".9"/>
     ${bokeh('mfl', 20, 5, ['#fff0c8', '#ffffff'], 3, 10, 0.8, 80, 660)}
     ${sFade('mfld', 470, 0.8)}`);
  add('mem-toast',
    'radial-gradient(ellipse 560px 440px at 640px 300px,rgba(255,196,100,.65),rgba(255,196,100,0)),linear-gradient(to bottom,#2a1008 0,#6a2a12 52%,#1a0a06 100%)',
    `${rays('mtt', 640, 300, 18, '#ffe0a0', 0.4)}
     ${sRings('#ffd27a', '#ffb08a', 0.6, 0.48)}
     ${glass(560, 300, 2.2, 16, '#fff0d0')}${glass(720, 300, 2.2, -16, '#fff0d0')}
     <g class="tw" stroke="#fff6d8" stroke-width="3" stroke-linecap="round">${Array.from({ length: 12 }, (_, i) => { const a = (i * 30) * Math.PI / 180; return `<line x1="${n0(640 + Math.cos(a) * 20)}" y1="${n0(150 + Math.sin(a) * 20)}" x2="${n0(640 + Math.cos(a) * 52)}" y2="${n0(150 + Math.sin(a) * 52)}"/>`; }).join('')}</g>
     ${embers(70, 4, '#fff0c8', 120)}
     ${candle(100, 680, 1.4, '#f4e6c8')}${candle(220, 690, 1.0, '#f4e6c8')}${candle(1180, 680, 1.4, '#f4e6c8')}${candle(1060, 690, 1.0, '#f4e6c8')}
     ${bokeh('mtt', 22, 3, ['#ffd27a', '#ffb08a', '#ffffff'], 14, 56, 0.5, 40, 680)}
     ${sFade('mttd', 520, 0.55)}`);

  // ================= 21) Snowman : 눈 속의 외로운 사랑 =================
  add('sno-night',
    'linear-gradient(to bottom,#050a28 0,#12285a 58%,#2a4a80 100%)',
    `${sStars(120, 16, 380, '#eaf2ff', 1.3)}
     <circle cx="190" cy="140" r="44" fill="#f4f8ff" opacity=".9"/><circle cx="190" cy="140" r="120" fill="#aac8ff" opacity=".12"/>
     ${sRings('#aac8ff', '#ffffff', 0.34, 0.28)}
     ${hills('#dfe9ff', 620, 70, 3, 0.95)}${hills('#b8c8ee', 660, 50, 8, 1)}
     ${pine(130, 640, 220, '#0a1a3a')}${pine(240, 650, 160, '#0a1a3a')}${pine(1130, 640, 240, '#0a1a3a')}${pine(1030, 650, 170, '#0a1a3a')}
     ${snowman(430, 650, 0.9, '#f4f8ff')}
     ${snow(60, 5, 1)}
     ${sFade('snnd', 480, 0.7)}`);
  add('sno-village',
    'linear-gradient(to bottom,#0a1a3a 0,#2a3a7a 48%,#6a5a9a 100%)',
    `${sStars(70, 17, 260, '#ffffff', 1.2)}
     ${sRings('#ffd9a0', '#aac8ff', 0.4, 0.34)}
     ${hills('#8a9ac8', 600, 50, 3, 0.9)}
     ${house(60, 640, 150, 100, '#2a2250', '#3a3070', '#ffd27a')}${house(250, 650, 120, 84, '#2a2250', '#3a3070', '#ffb86a')}${house(960, 640, 160, 110, '#2a2250', '#3a3070', '#ffd27a')}${house(1140, 650, 120, 86, '#2a2250', '#3a3070', '#ffb86a')}
     ${bulbs('snv', 80, 60, '#ffd9a0', 14)}
     ${pine(420, 650, 200, '#12183a')}${pine(860, 650, 190, '#12183a')}
     ${snow(70, 7, 1.2)}
     ${bokeh('snvb', 12, 3, ['#ffd9a0', '#ffffff'], 8, 26, 0.5, 120, 620)}
     ${sFade('snvd', 480, 0.7)}`);
  add('sno-aurora',
    'linear-gradient(to bottom,#030820 0,#0a2a5a 50%,#0a1a38 100%)',
    `${sStars(150, 18, 420, '#ffffff', 1.4)}
     ${aurora('sna', ['#66ffcc', '#a86bff', '#ff6ac8'], 60, 5)}
     ${sRings('#66ffcc', '#ff6ac8', 0.5, 0.4)}
     ${flake(220, 160, 64, '#cfe8ff')}${flake(880, 120, 56, '#cfe8ff')}${flake(640, 90, 50, '#ffffff')}${flake(1160, 440, 56, '#cfe8ff')}${flake(130, 470, 60, '#cfe8ff')}
     <defs>${lin('snal', [[0, '#8ae8ff', 0.5], [1, '#0a1a38', 0.9]])}</defs><rect x="0" y="520" width="1280" height="200" fill="url(#snal)"/>
     ${snow(110, 9, 1.4)}
     ${sFade('snad', 480, 0.7)}`);

  // ================= 22) Back & Forth : 가까워졌다 멀어지는 마음 =================
  add('bf-swing',
    'linear-gradient(to bottom,#2a1a5a 0,#c0608a 44%,#ff9a6a 76%,#ffd08a 100%)',
    `${sStars(40, 21, 200, '#fff', 1.2)}
     ${sRings('#ffe0a0', '#ffb0c8', 0.4, 0.34)}
     <circle cx="640" cy="330" r="96" fill="#fff0c8" opacity=".92"/><circle cx="640" cy="330" r="210" fill="#ffd08a" opacity=".22"/>
     ${hills('#5a2a60', 620, 60, 3, 0.95)}${hills('#2a1238', 670, 40, 7, 1)}
     ${swingSet(640, 660, 330, '#0e0618')}
     ${bokeh('bfs', 12, 4, ['#ffe0a0', '#ffb0c8'], 6, 22, 0.5, 140, 600)}
     ${sFade('bfsd', 480, 0.8)}`);
  add('bf-pendulum',
    'linear-gradient(to bottom,#06242c 0,#0a4a58 52%,#041218 100%)',
    `${sRings('#ffa04f', '#6ae8d8', 0.55, 0.45)}
     <g stroke="#6ae8d8" stroke-opacity=".3" stroke-width="2">${Array.from({ length: 12 }, (_, i) => { const a = (i * 30) * Math.PI / 180; return `<line x1="${n0(640 + Math.cos(a) * 250)}" y1="${n0(300 + Math.sin(a) * 250)}" x2="${n0(640 + Math.cos(a) * 300)}" y2="${n0(300 + Math.sin(a) * 300)}"/>`; }).join('')}</g>
     ${[0, 1, 2, 3].map((i) => `<circle class="pulse" style="animation-delay:${-i * 0.9}s" cx="640" cy="300" r="60" fill="none" stroke="#6ae8d8" stroke-opacity=".55" stroke-width="2"/>`).join('')}
     ${pendulum(640, -20, 520, 46, '#ffa04f', 4.4)}${pendulum(300, -20, 380, 30, '#6ae8d8', 3.6)}${pendulum(980, -20, 380, 30, '#6ae8d8', 3.6)}
     ${bokeh('bfp', 14, 3, ['#ffa04f', '#6ae8d8'], 8, 30, 0.4, 100, 640)}
     ${sFade('bfpd', 480, 0.8)}`);
  add('bf-tide',
    'linear-gradient(to bottom,#3a1a6a 0,#e0508a 38%,#ff9a5a 64%,#ffd08a 100%)',
    `${sRings('#ffe0a0', '#ffffff', 0.5, 0.42)}
     <circle cx="640" cy="360" r="110" fill="#fff0c8" opacity=".95"/><circle cx="640" cy="360" r="230" fill="#ffd08a" opacity=".25"/>
     ${tide('#c0407a', 430, 36, 7, 0.9)}${tide('#802a8a', 490, 40, 9, 0.95)}${tide('#4a1a6a', 560, 46, 11, 1)}${tide('#24103a', 630, 40, 8, 1)}
     ${bokeh('bft', 16, 5, ['#ffffff', '#ffe0a0'], 4, 16, 0.6, 400, 680)}
     ${sFade('bftd', 500, 0.7)}`);

  return S;
})();
