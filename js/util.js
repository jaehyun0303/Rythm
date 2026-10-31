// 공용 유틸: 저장소, 포맷터, 난수
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const fmtNum = (n) => Math.round(n).toLocaleString('en-US');
export const pad2 = (n) => String(n).padStart(2, '0');
export const fmtTime = (s) => {
  s = Math.max(0, Math.floor(s));
  return pad2(Math.floor(s / 60)) + ':' + pad2(s % 60);
};

export function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- 저장소 (localStorage 실패 시 메모리로 폴백) ----
const KEY = 'rythm.v1';
const DEFAULTS = () => ({
  profile: { name: 'PLAYER_01', xp: 0 },
  settings: { speed: 5.5, offset: 0, volume: 0.8, hitsound: true, auto: false },
  bests: {},
  tuning: {},
  v: 0,
  favorites: [],
});
let mem = null;
export const store = {
  data: null,
  load() {
    if (this.data) return this.data;
    let d = null;
    try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) { d = mem; }
    const def = DEFAULTS();
    this.data = Object.assign(def, d || {});
    this.data.settings = Object.assign(def.settings, (d && d.settings) || {});
    this.data.profile = Object.assign(def.profile, (d && d.profile) || {});
    // 구버전 저장 데이터 이전 (1회): 옛 overload -> nightmare, 단계 없는 키 -> 단계 0
    if (!this.data.v) {
      const nb = {};
      for (const [k, v] of Object.entries(this.data.bests || {})) {
        let key = k.replace(':overload', ':nightmare');
        if (key.split(':').length === 2) key += ':0';
        nb[key] = v;
      }
      this.data.bests = nb;
      this.data.v = 2;
      this.save();
    }
    this.data.tuning = this.data.tuning || {};
    return this.data;
  },
  save() {
    mem = this.data;
    try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* ignore */ }
  },
};

// ---- 레벨 / 레이팅 ----
export const xpForLevel = (lv) => 1000 + 150 * lv;
export function levelInfo(xp) {
  let lv = 1;
  while (xp >= xpForLevel(lv)) { xp -= xpForLevel(lv); lv++; }
  return { lv, into: xp, need: xpForLevel(lv) };
}
export function chartRating(level, acc) {
  const f = clamp((acc - 60) / 40, 0, 1);
  return level * Math.pow(f, 1.6);
}
// ---- 곡별 난이도 단계(튜닝): 올리기만 가능, 현재 단계에서 기준 정확도를 넘겨야 다음 단계 해금 ----
export const MAX_STAGE = 3;
export const RAISE_REQ = [95, 97, 98.5];         // 단계 0->1, 1->2, 2->3 에 필요한 정확도(%)
export const STAGE_LV = 2;                        // 단계당 레벨 상승량
export const stageOf = (id, dk) => (store.data.tuning && store.data.tuning[id + ':' + dk]) || 0;
export const bestOf = (id, dk, st = stageOf(id, dk)) => store.data.bests[id + ':' + dk + ':' + st];
export const levelOf = (song, diffIdx, st) => song.levels[diffIdx] + STAGE_LV * st;
export function canRaise(id, dk) {
  const st = stageOf(id, dk);
  if (st >= MAX_STAGE) return false;
  const b = bestOf(id, dk, st);
  return !!b && b.acc >= RAISE_REQ[st];
}
export function raiseStage(id, dk) {
  if (!canRaise(id, dk)) return false;
  store.data.tuning[id + ':' + dk] = stageOf(id, dk) + 1;
  store.save();
  return true;
}

export function playerRating(bests) {
  // 같은 곡/난이도는 단계 중 가장 높은 레이팅만 반영
  const byChart = {};
  for (const [k, b] of Object.entries(bests)) {
    const c = k.split(':').slice(0, 2).join(':');
    byChart[c] = Math.max(byChart[c] || 0, b.rating || 0);
  }
  const arr = Object.values(byChart).sort((a, b) => b - a).slice(0, 10);
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / Math.min(10, Math.max(arr.length, 5));
}
