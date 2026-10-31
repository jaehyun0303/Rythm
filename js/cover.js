// 목업의 추상 커버를 곡별로 변주해서 SVG 문자열로 생성 (실제 앨범아트 대신)
import { hashStr } from './util.js';

let uid = 0;
export function coverSVG(song, { size = 64, border = 2, cls = '' } = {}) {
  const c = song.cover || {};
  const h = hashStr(song.id);
  const v = c.variant ?? h % 3;
  const a = c.a || '#ff2a6d', b = c.b || '#00f0ff';
  const id = 'cv' + uid++;
  let art = '';
  if (v === 0) { // 선셋 + 스트라이프 + 대각선
    art = `<circle cx="50" cy="44" r="28" fill="${a}"/>
      <rect x="20" y="52" width="60" height="3" fill="#12062e"/><rect x="20" y="60" width="60" height="4" fill="#12062e"/><rect x="20" y="69" width="60" height="5" fill="#12062e"/>
      <polygon points="0,80 100,52 100,64 0,92" fill="${b}"/>`;
  } else if (v === 1) { // 링 + 사선 분할
    art = `<polygon points="0,0 100,0 0,100" fill="${a}" fill-opacity=".85"/>
      <circle cx="58" cy="52" r="30" fill="none" stroke="${b}" stroke-width="7"/>
      <circle cx="58" cy="52" r="14" fill="${a}"/>
      <rect x="0" y="86" width="100" height="4" fill="${b}"/>`;
  } else { // 삼각 산 + 달
    art = `<circle cx="70" cy="28" r="14" fill="${b}"/>
      <polygon points="0,100 30,38 62,100" fill="${a}"/>
      <polygon points="38,100 70,52 100,100" fill="#1a0b3a" stroke="${b}" stroke-width="2"/>
      <rect x="0" y="78" width="100" height="3" fill="#12062e"/><rect x="0" y="88" width="100" height="5" fill="#12062e"/>`;
  }
  return `<svg class="${cls}" aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 100 100"><defs><clipPath id="${id}"><rect width="100" height="100"/></clipPath></defs><g clip-path="url(#${id})"><rect width="100" height="100" fill="#12062e"/>${art}</g><rect x="${border / 2}" y="${border / 2}" width="${100 - border}" height="${100 - border}" fill="none" stroke="#00f0ff" stroke-width="${border}"/></svg>`;
}
export function coverMini(song, px = 44) {
  // 목록용 작은 정사각 (테두리 없음)
  return coverSVG(song, { size: px, border: 0 });
}
