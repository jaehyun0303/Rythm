// 곡 구간에 따라 바뀌는 배경 테마. 각 테마는 1280x720 레이어 하나(그라디언트 + SVG 풍경)이고,
// 새 테마가 위에서 서서히 페이드인 되며 교체된다.
import { mulberry32 } from './util.js';
import { SCENES } from './scenes.js';
import { SCENES2 } from './scenes2.js';

const FADE = `<defs><linearGradient id="fd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07060d" stop-opacity="0"/><stop offset="1" stop-color="#07060d" stop-opacity=".94"/></linearGradient></defs>`;
const fade = (y = 380) => `<rect x="0" y="${y}" width="1280" height="${720 - y}" fill="url(#fd)"/>`;
const rings = (a, b, ao = 0.35, bo = 0.3) => `<circle cx="640" cy="250" r="270" fill="none" stroke="${a}" stroke-opacity="${ao}" stroke-width="2"/><circle cx="640" cy="250" r="236" fill="none" stroke="${b}" stroke-opacity="${bo}" stroke-width="1" stroke-dasharray="3 9"/>`;

function cloud(x, y, s, o, cls) {
  const e = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`;
  return `<g class="${cls}" fill="#fff" opacity="${o}"><g transform="translate(${x} ${y}) scale(${s})">${e(0, 0, 90, 26)}${e(-50, -14, 44, 28)}${e(10, -26, 52, 32)}${e(56, -8, 40, 24)}</g></g>`;
}

function stars(n, seed, ymax, color = '#fff') {
  const r = mulberry32(seed);
  let h = '';
  for (let i = 0; i < n; i++) {
    const x = r() * 1280, y = r() * ymax, s = 0.6 + r() * 1.6;
    h += `<circle class="${r() < 0.35 ? 'tw' : ''}" style="animation-delay:${(r() * 4).toFixed(1)}s" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${s.toFixed(1)}" fill="${color}" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`;
  }
  return h;
}

function skyline(color, seed, base, minH, maxH, opacity) {
  const r = mulberry32(seed);
  let h = '', x = -20;
  while (x < 1300) {
    const w = 50 + r() * 70, ht = minH + r() * (maxH - minH);
    h += `<rect x="${x.toFixed(0)}" y="${(base - ht).toFixed(0)}" width="${w.toFixed(0)}" height="${(ht + 400).toFixed(0)}" fill="${color}" opacity="${opacity}"/>`;
    x += w + 4 + r() * 10;
  }
  return h;
}

export const THEMES = {
  // 기본: 네온 도시
  cyber: {
    bg: 'radial-gradient(ellipse 540px 320px at 640px 250px,rgba(255,42,109,.34),rgba(255,42,109,0)),linear-gradient(to bottom,#0b0622 0,#14072f 42%,#07060d 80%)',
    svg: `<defs>
      <pattern id="gwc" width="12" height="16" patternUnits="userSpaceOnUse"><rect width="12" height="16" fill="#0b0a1f"/><rect x="3" y="4" width="5" height="7" fill="#00f0ff" opacity=".3"/></pattern>
      <pattern id="gwm" width="12" height="16" patternUnits="userSpaceOnUse"><rect width="12" height="16" fill="#0b0a1f"/><rect x="3" y="4" width="5" height="7" fill="#ff2a6d" opacity=".3"/></pattern>
      <linearGradient id="gfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07060d" stop-opacity="0"/><stop offset="1" stop-color="#07060d" stop-opacity=".96"/></linearGradient></defs>
      ${rings('#ff2a6d', '#00f0ff')}
      <g stroke="#00f0ff" stroke-opacity=".28" opacity=".85">
        <rect x="0" y="240" width="92" height="480" fill="url(#gwc)"/><rect x="84" y="150" width="64" height="570" fill="url(#gwm)"/>
        <rect x="140" y="300" width="100" height="420" fill="url(#gwc)"/><rect x="232" y="200" width="70" height="520" fill="url(#gwm)"/>
        <rect x="294" y="330" width="84" height="390" fill="url(#gwc)"/><rect x="370" y="290" width="70" height="430" fill="url(#gwm)"/>
        <rect x="840" y="300" width="70" height="420" fill="url(#gwm)"/><rect x="902" y="220" width="86" height="500" fill="url(#gwc)"/>
        <rect x="982" y="320" width="60" height="400" fill="url(#gwm)"/><rect x="1034" y="130" width="70" height="590" fill="url(#gwc)"/>
        <rect x="1096" y="260" width="80" height="460" fill="url(#gwm)"/><rect x="1166" y="190" width="114" height="530" fill="url(#gwc)"/>
      </g>
      <rect x="150" y="170" width="5" height="60" fill="#ff2a6d"/><rect x="1050" y="190" width="5" height="70" fill="#00f0ff"/>
      <rect x="1100" y="236" width="60" height="10" fill="#ff2a6d" opacity=".8"/><rect x="244" y="150" width="40" height="8" fill="#00f0ff" opacity=".8"/>
      <rect x="0" y="360" width="1280" height="360" fill="url(#gfade)"/>`,
  },

  // 푸른 하늘
  sky: {
    bg: 'linear-gradient(to bottom,#0a46a8 0,#2a86ee 36%,#7cc6ff 68%,#cdeaff 100%)',
    svg: `${FADE}
      <defs><radialGradient id="sg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff9d6" stop-opacity="1"/><stop offset=".35" stop-color="#fff2a8" stop-opacity=".55"/><stop offset="1" stop-color="#fff2a8" stop-opacity="0"/></radialGradient></defs>
      <circle cx="640" cy="250" r="300" fill="url(#sg)"/>
      <circle cx="640" cy="250" r="64" fill="#fffbe0"/>
      ${rings('#ffffff', '#ffffff', 0.5, 0.45)}
      ${cloud(150, 300, 1.2, 0.6, 'drift')}${cloud(1130, 310, 1.3, 0.6, 'drift d2')}${cloud(640, 450, 1.9, 0.38, 'drift d3')}
      ${cloud(900, 150, 0.7, 0.22, 'drift d2')}
      ${skyline('#2f6fb8', 7, 540, 40, 170, 0.7)}${skyline('#1f4f94', 11, 620, 30, 130, 0.85)}
      ${fade(330)}`,
  },

  // 석양
  sunset: {
    bg: 'linear-gradient(to bottom,#16043a 0,#5b1678 26%,#d63a73 54%,#ff8f4d 76%,#ffd27a 100%)',
    svg: `${FADE}
      <defs><linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset=".55" stop-color="#ff8f4d"/><stop offset="1" stop-color="#ff2a6d"/></linearGradient></defs>
      ${stars(40, 21, 220)}
      ${rings('#ffd27a', '#ff2a6d', 0.45, 0.4)}
      <circle cx="640" cy="250" r="150" fill="url(#sun)"/>
      <g fill="#c8306b" opacity=".92"><rect x="480" y="262" width="320" height="5"/><rect x="480" y="284" width="320" height="8"/><rect x="480" y="308" width="320" height="11"/><rect x="480" y="338" width="320" height="15"/></g>
      <polygon points="0,520 140,380 260,470 400,350 560,500 700,420 860,520 1010,370 1140,470 1280,400 1280,720 0,720" fill="#2a0b4d" opacity=".92"/>
      <polygon points="0,600 180,500 330,580 520,490 720,590 900,510 1100,590 1280,520 1280,720 0,720" fill="#14052e"/>
      ${fade(420)}`,
  },

  // 우주
  space: {
    bg: 'radial-gradient(ellipse 700px 400px at 18% 22%,rgba(120,60,255,.38),rgba(120,60,255,0)),radial-gradient(ellipse 600px 380px at 86% 58%,rgba(0,240,255,.24),rgba(0,240,255,0)),linear-gradient(to bottom,#02030f 0,#0a0a2e 60%,#07060d 100%)',
    svg: `${FADE}
      <defs><radialGradient id="pl" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#ffb9d6"/><stop offset=".5" stop-color="#b44ad8"/><stop offset="1" stop-color="#2a0b5e"/></radialGradient></defs>
      ${stars(110, 5, 500)}
      ${rings('#00f0ff', '#a89dff', 0.35, 0.3)}
      <g class="drift d3"><circle cx="1010" cy="190" r="88" fill="url(#pl)"/><ellipse cx="1010" cy="190" rx="150" ry="26" fill="none" stroke="#e9f7ff" stroke-opacity=".55" stroke-width="3" transform="rotate(-18 1010 190)"/></g>
      <circle cx="250" cy="150" r="26" fill="#cfd6ff" opacity=".85"/><circle cx="262" cy="142" r="22" fill="#0a0a2e" opacity=".55"/>
      <polygon points="0,640 120,600 260,630 420,590 600,640 780,600 960,636 1130,596 1280,630 1280,720 0,720" fill="#0b0a1f" opacity=".9"/>
      ${fade(430)}`,
  },

  // 붉은 어둠
  ember: {
    bg: 'radial-gradient(ellipse 600px 340px at 640px 270px,rgba(255,84,24,.42),rgba(255,84,24,0)),linear-gradient(to bottom,#14010a 0,#3a0612 48%,#07060d 92%)',
    svg: `${FADE}
      ${rings('#ff5418', '#ffb347', 0.45, 0.35)}
      <polygon points="0,720 90,330 190,720" fill="#1a0309" opacity=".95"/><polygon points="120,720 300,260 440,720" fill="#240510" opacity=".95"/>
      <polygon points="830,720 980,300 1130,720" fill="#240510" opacity=".95"/><polygon points="1000,720 1170,360 1280,720" fill="#1a0309" opacity=".95"/>
      <g fill="#ff7a2a">${Array.from({ length: 26 }, (_, i) => { const r = mulberry32(90 + i); const x = r() * 1280; return `<circle class="em" style="animation-delay:${(r() * 6).toFixed(1)}s;animation-duration:${(5 + r() * 5).toFixed(1)}s" cx="${x.toFixed(0)}" cy="${(380 + r() * 340).toFixed(0)}" r="${(1 + r() * 2.2).toFixed(1)}"/>`; }).join('')}</g>
      ${fade(430)}`,
  },
};

export const THEME_IDS = Object.keys(THEMES);
export const getTheme = (id) => THEMES[id] || SCENES[id] || SCENES2[id];

// ids: 이 곡에서 쓰는 장면만 만든다 (생략하면 공용 테마 전체)
export function buildThemes(container, ids = THEME_IDS) {
  container.innerHTML = ids.filter((id) => getTheme(id)).map((id) => {
    const t = getTheme(id);
    return `<div class="th" id="th-${id}"><div class="th-bg" style="background:${t.bg}"></div><svg viewBox="0 0 1280 720" preserveAspectRatio="none" aria-hidden="true">${t.svg}</svg></div>`;
  }).join('');
  // SVG id 충돌 방지: 같은 id(fd 등)를 여러 레이어가 쓰지만 내용이 동일해 문제없음
}

let cur = null, z = 1, timer = 0;
export function currentTheme() { return cur; }
export function setTheme(id, instant) {
  if (cur === id || !getTheme(id)) return;
  const el = document.getElementById('th-' + id);
  if (!el) return;
  const all = [...document.querySelectorAll('.th')];
  cur = id;
  clearTimeout(timer);
  if (instant) {
    all.forEach((e) => { e.classList.add('inst'); e.classList.toggle('on', e === el); });
    void el.offsetWidth;
    all.forEach((e) => e.classList.remove('inst'));
    return;
  }
  el.style.zIndex = ++z;
  el.classList.add('on');
  timer = setTimeout(() => all.forEach((e) => { if (e !== el) e.classList.remove('on'); }), 1950);
}
export function resetTheme() { cur = null; }
