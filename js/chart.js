// 채보 자동 생성: 음원 PCM(모노) -> 박자 격자 보정 -> 온셋 점수 -> 난이도별 노트 선택 -> 레인 배치
// DOM/WebAudio 의존성이 없어서 Node에서도 테스트할 수 있음.
import { mulberry32, hashStr, clamp } from './util.js';

export const DIFFS = [
  { key: 'easy',     name: 'EASY',     per: 3,  gap: 4, ln: 0.10, chord: 0,    ref: 0 },
  { key: 'normal',   name: 'NORMAL',   per: 6,  gap: 2, ln: 0.12, chord: 0,    ref: 1 },
  { key: 'hard',     name: 'HARD',     per: 9,  gap: 1, ln: 0.14, chord: 0.10, ref: 2 },
  { key: 'overload', name: 'OVERLOAD', per: 13, gap: 1, ln: 0.16, chord: 0.24, ref: 3 },
];
const SPM = 16; // 마디당 16분음표 스텝

// ---------- 1) 분석 ----------
export function analyze(pcm, sr, bpmHint) {
  const hop = Math.max(64, Math.round(sr * 0.005));
  const hopSec = hop / sr;
  const n = Math.floor(pcm.length / hop);
  const env = new Float32Array(n);
  let px = 0;
  for (let i = 0; i < n; i++) {
    let s = 0, d = 0;
    const o = i * hop;
    for (let j = 0; j < hop; j++) {
      const x = pcm[o + j];
      const dx = x - px; px = x;
      s += x * x; d += dx * dx;
    }
    env[i] = Math.sqrt(s / hop) + 1.5 * Math.sqrt(d / hop);
  }
  const comp = new Float32Array(n);
  for (let i = 0; i < n; i++) comp[i] = Math.log1p(env[i] * 60);
  const flux = new Float32Array(n);
  for (let i = 1; i < n; i++) flux[i] = Math.max(0, comp[i] - comp[i - 1]);

  const dur = pcm.length / sr;
  const grid = fitGrid(flux, hopSec, dur, bpmHint);
  return { env, flux, hopSec, dur, bpm: grid.bpm, offset: grid.offset };
}

function fitGrid(flux, hopSec, dur, bpm0) {
  const n = flux.length;
  const at = (t) => {
    const i = Math.round(t / hopSec);
    if (i < 1 || i >= n - 1) return 0;
    return Math.max(flux[i - 1], flux[i], flux[i + 1]);
  };
  let best = { score: -1, bpm: bpm0, offset: 0 };
  for (let bpm = bpm0 - 0.6; bpm <= bpm0 + 0.6001; bpm += 0.01) {
    const B = 60 / bpm;
    for (let ph = 0; ph < B; ph += 0.004) {
      let sum = 0;
      for (let t = ph; t < dur - 0.05; t += B) sum += at(t);
      if (sum > best.score) best = { score: sum, bpm, offset: ph };
    }
  }
  return best;
}

// ---------- 2) 스텝별 온셋 점수 ----------
export function stepScores(an) {
  const { env, flux, hopSec, dur, bpm, offset } = an;
  const step = 60 / bpm / 4;
  const N = Math.max(0, Math.floor((dur - offset - 0.3) / step));
  const raw = new Float32Array(N);
  const loud = new Float32Array(N);
  const half = Math.max(1, Math.round((step * 0.32) / hopSec));
  for (let i = 0; i < N; i++) {
    const c = Math.round((offset + i * step) / hopSec);
    let m = 0, e = 0;
    for (let k = c - half; k <= c + half; k++) {
      if (k >= 0 && k < flux.length) { if (flux[k] > m) m = flux[k]; if (env[k] > e) e = env[k]; }
    }
    raw[i] = m; loud[i] = e;
  }
  // 지역 평균으로 정규화 (2마디 창)
  const pre = new Float64Array(N + 1);
  for (let i = 0; i < N; i++) pre[i + 1] = pre[i] + raw[i];
  const W = SPM * 2;
  const score = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = Math.max(0, i - W), b = Math.min(N, i + W);
    const avg = (pre[b] - pre[a]) / Math.max(1, b - a);
    const rel = raw[i] / (avg + 0.004);
    const p = i % SPM;
    const w = p === 0 ? 1.0 : p % 4 === 0 ? 0.85 : p % 2 === 0 ? 0.6 : 0.35;
    score[i] = rel * (0.45 + w);
  }
  // 마디 단위 음량
  const meas = Math.ceil(N / SPM);
  const ml = new Float32Array(meas);
  for (let m = 0; m < meas; m++) {
    let s = 0, c = 0;
    for (let i = m * SPM; i < Math.min(N, (m + 1) * SPM); i++) { s += loud[i]; c++; }
    ml[m] = c ? s / c : 0;
  }
  const sorted = [...ml].sort((a, b) => a - b);
  const ref = sorted[Math.floor(sorted.length * 0.8)] || 1e-6;
  return { score, step, N, ml, ref, offset, bpm, dur };
}

// ---------- 3) 난이도별 채보 ----------
export function buildChart(ss, diff, seedKey) {
  const rng = mulberry32(hashStr(seedKey + ':' + diff.key));
  const { score, step, N, ml, ref, offset } = ss;
  const chosen = [];
  const meas = Math.ceil(N / SPM);
  for (let m = 0; m < meas; m++) {
    const lm = ml[m] / ref;
    if (lm < 0.04) continue; // 무음 구간
    const K = Math.round(diff.per * clamp(0.3 + 0.7 * lm, 0.3, 1));
    if (K <= 0) continue;
    const idx = [];
    for (let i = m * SPM; i < Math.min(N, (m + 1) * SPM); i++) if (score[i] > 0.06) idx.push(i);
    idx.sort((a, b) => score[b] - score[a]);
    const pick = [];
    for (const i of idx) {
      if (pick.length >= K) break;
      let ok = true;
      for (const j of pick) if (Math.abs(i - j) < diff.gap) { ok = false; break; }
      if (!ok) continue;
      // 마디 경계 건너 인접 노트도 간격 보장
      const prev = chosen.length ? chosen[chosen.length - 1] : -99;
      if (i - prev < diff.gap && i > prev) continue;
      pick.push(i);
    }
    pick.sort((a, b) => a - b);
    for (const i of pick) if (!chosen.length || i - chosen[chosen.length - 1] >= diff.gap) chosen.push(i);
  }

  // 레인 배치
  const notes = [];
  const busy = [-9, -9, -9, -9]; // 해당 스텝까지 레인 점유(롱노트)
  let last = -1, lastStep = -99, dir = 1;
  const free = (l, s) => busy[l] < s;
  for (let k = 0; k < chosen.length; k++) {
    const s = chosen[k];
    let cands = [0, 1, 2, 3].filter((l) => free(l, s));
    if (!cands.length) continue;
    if (last >= 0 && s - lastStep < 3 && cands.length > 1) cands = cands.filter((l) => l !== last);
    // 진행 방향 유지 가중치
    const wts = cands.map((l) => {
      if (last < 0) return 1;
      const d = l - last;
      let w = 1;
      if (Math.sign(d) === dir) w += 0.8;
      if (Math.abs(d) === 1) w += 0.5;
      return w;
    });
    let r = rng() * wts.reduce((a, b) => a + b, 0), lane = cands[0];
    for (let q = 0; q < cands.length; q++) { r -= wts[q]; if (r <= 0) { lane = cands[q]; break; } }
    if (last >= 0 && lane !== last) dir = Math.sign(lane - last) || dir;

    // 롱노트
    let len = 0;
    const nextStep = k + 1 < chosen.length ? chosen[k + 1] : N;
    if (diff.ln > 0 && rng() < diff.ln && nextStep - s >= 4) {
      const opts = [4, 6, 8].filter((x) => x <= nextStep - s + 4);
      len = opts[Math.floor(rng() * opts.length)] || 4;
    }
    const t = offset + s * step;
    notes.push({ t, lane, len: len ? len * step : 0, end: len ? t + len * step : 0 });
    busy[lane] = s + len + 1;

    // 동시치기
    if (!len && diff.chord > 0 && s % 4 === 0 && score[s] > 1.1 && rng() < diff.chord) {
      const others = [0, 1, 2, 3].filter((l) => l !== lane && free(l, s));
      if (others.length) {
        const pref = others.filter((l) => Math.abs(l - lane) >= 2);
        const pool = pref.length ? pref : others;
        const l2 = pool[Math.floor(rng() * pool.length)];
        notes.push({ t, lane: l2, len: 0, end: 0 });
        busy[l2] = s + 1;
      }
    }
    last = lane; lastStep = s;
  }
  notes.sort((a, b) => a.t - b.t || a.lane - b.lane);

  // 노트 밀도 (19점)
  const dens = new Array(19).fill(0);
  const total = ss.dur;
  for (const n of notes) dens[Math.min(18, Math.floor((n.t / total) * 19))]++;
  return { diff: diff.key, notes, total: notes.length, density: dens, bpm: ss.bpm, offset, duration: ss.dur };
}

export function generateAll(pcm, sr, song) {
  const an = analyze(pcm, sr, song.bpm);
  const ss = stepScores(an);
  const charts = {};
  for (const d of DIFFS) charts[d.key] = buildChart(ss, d, song.id);
  return { charts, bpm: an.bpm, offset: an.offset, duration: an.dur };
}
