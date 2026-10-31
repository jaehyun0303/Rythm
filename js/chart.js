// 채보 자동 생성: 음원 PCM(모노) -> 박자 격자 보정 -> 온셋 점수 -> 난이도별 노트 선택 -> 레인 배치
// DOM/WebAudio 의존성이 없어서 Node에서도 테스트할 수 있음.
import { mulberry32, hashStr, clamp } from './util.js';

export const DIFFS = [
  { key: 'easy',     name: 'EASY',     per: 3,  gap: 4, ln: 0.10, chord: 0,    ref: 0 },
  { key: 'normal',   name: 'NORMAL',   per: 6,  gap: 2, ln: 0.12, chord: 0,    ref: 1 },
  { key: 'hard',     name: 'HARD',     per: 9,  gap: 1, ln: 0.14, chord: 0.10, ref: 2 },
  { key: 'nightmare', name: 'NIGHTMARE', per: 13, gap: 1, ln: 0.16, chord: 0.24, ref: 3 },
  { key: 'overload', name: 'OVERLOAD', per: 15, gap: 1, ln: 0.18, chord: 0.38, ref: 4 },
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
// 단계(stage 0~3): 같은 곡/난이도를 더 촘촘하고 복잡하게. 시드는 단계와 무관해서 기본 골격은 유지됨
const STAGE = { per: [1, 1.25, 1.5, 1.8], gapCut: [0, 0, 1, 1], chord: [0, 0.05, 0.12, 0.2], ln: [0, 0.02, 0.04, 0.06] };
export function buildChart(ss, diff0, seedKey, stage = 0) {
  const diff = {
    ...diff0,
    per: Math.min(15, Math.round(diff0.per * STAGE.per[stage])),
    gap: diff0.gap >= 2 ? Math.max(1, diff0.gap - STAGE.gapCut[stage]) : diff0.gap,
    chord: diff0.chord + STAGE.chord[stage],
    ln: diff0.ln + STAGE.ln[stage],
  };
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
  return { diff: diff.key, stage, notes, total: notes.length, density: dens, bpm: ss.bpm, offset, duration: ss.dur };
}

// ---------- 3-b) 극악 채보: 박자 격자를 거의 전부 채우는 스트림 + 패턴 + 동시치기 + 롱노트 ----------
// 노트 위치는 전부 박자 격자(16분음표) 위에 놓인다. 조용한 마디만 성기게 하고 나머지는 쉬지 않고 이어짐.
const PATS = [[0, 1, 2, 3], [3, 2, 1, 0], [0, 2, 1, 3], [3, 1, 2, 0], [0, 2, 0, 2], [1, 3, 1, 3], [0, 1, 0, 1], [2, 3, 2, 3], [0, 3, 1, 2], [3, 0, 2, 1], [1, 2, 1, 2], [0, 3, 0, 3], [1, 0, 3, 2], [2, 1, 0, 3]];
export function buildBrutal(ss, diff, seedKey, stage = 0) {
  const rng = mulberry32(hashStr(seedKey + ':' + diff.key + ':brutal'));
  const { score, step, N, ml, ref, offset } = ss;
  const over = diff.key === 'overload';
  const fill = over ? 1 : 0.88;                       // 격자를 채우는 비율
  const chordP = (over ? 0.55 : 0.3) + stage * 0.1;   // 동시치기 확률
  const triP = (over ? 0.14 : 0.04) + stage * 0.05;   // 3키 동시치기
  const lnP = over ? 0.55 : 0.3;                      // 롱노트 꽂을 확률
  const sorted = [...score].sort((a, b) => a - b);
  const med = sorted[N >> 1] || 0;
  const notes = [];
  const busy = [-9, -9, -9, -9];
  let last = -1;
  const freeLanes = (s) => [0, 1, 2, 3].filter((l) => busy[l] < s);
  const pick = (s, want) => {
    const f = freeLanes(s);
    if (!f.length) return -1;
    if (f.includes(want)) return want;
    f.sort((a, b) => Math.abs(a - want) - Math.abs(b - want));
    return f[0];
  };
  for (let m = 0; m * SPM < N; m++) {
    const lm = ml[m] / ref;
    if (lm < 0.04) continue;
    const quiet = lm < 0.3;
    for (let g = 0; g < 4; g++) {
      let pat = PATS[Math.floor(rng() * PATS.length)];
      for (let tries = 0; tries < 6 && pat[0] === last && rng() > 0.12; tries++) pat = PATS[Math.floor(rng() * PATS.length)];
      for (let k = 0; k < 4; k++) {
        const s = m * SPM + g * 4 + k;
        if (s >= N) break;
        const keep = quiet ? 0.5 : Math.min(1, fill + (score[s] > med ? 0.1 : 0));
        if (rng() > keep) continue;
        const lane = pick(s, pat[k]);
        if (lane < 0) continue;
        let len = 0;
        if (k === 0 && !quiet && (g & 1) === 0 && rng() < lnP * 0.3) {
          len = [6, 8, 10][Math.floor(rng() * 3)];
          if (s + len >= N) len = 0;
        }
        const t = offset + s * step;
        notes.push({ t, lane, len: len ? len * step : 0, end: len ? t + len * step : 0 });
        busy[lane] = s + len;
        last = lane;
        if (!len && (k === 0 || score[s] > med) && rng() < chordP * (k === 0 ? 1.3 : 1)) {
          const cand = freeLanes(s).filter((l) => l !== lane);
          if (cand.length) {
            const far = cand.filter((l) => Math.abs(l - lane) >= 2);
            const pool = far.length ? far : cand;
            const l2 = pool[Math.floor(rng() * pool.length)];
            notes.push({ t, lane: l2, len: 0, end: 0 });
            busy[l2] = s;
            if (k === 0 && rng() < triP) {
              const c3 = freeLanes(s).filter((l) => l !== lane && l !== l2);
              if (c3.length) { const l3 = c3[Math.floor(rng() * c3.length)]; notes.push({ t, lane: l3, len: 0, end: 0 }); busy[l3] = s; }
            }
          }
        }
      }
    }
  }
  notes.sort((a, b) => a.t - b.t || a.lane - b.lane);
  const dens = new Array(19).fill(0);
  for (const n of notes) dens[Math.min(18, Math.floor((n.t / ss.dur) * 19))]++;
  return { diff: diff.key, stage, notes, total: notes.length, density: dens, bpm: ss.bpm, offset, duration: ss.dur, brutal: true };
}

// 곡 플래그(extreme)에 따라 일반/극악 생성기를 고른다
export function makeChart(ss, diff, seedKey, stage = 0, extreme = false) {
  if (!extreme) return buildChart(ss, diff, seedKey, stage);
  if (diff.ref >= 3) return buildBrutal(ss, diff, seedKey, stage);
  const boost = { easy: 1.35, normal: 1.4, hard: 1.5 }[diff.key] || 1.4;
  return buildChart(ss, { ...diff, per: Math.min(15, Math.round(diff.per * boost)), chord: diff.chord + (diff.key === 'easy' ? 0.1 : 0.25) }, seedKey, stage);
}

// ---------- 4) 곡 구간(섹션) 자동 검출: 마디별 에너지 -> 3단계 -> 짧은 구간 병합 ----------
// 반환: [{ t0, t1, level(0 조용/1 중간/2 강함), name }]
export function detectSections(an) {
  const { env, hopSec, dur, bpm, offset } = an;
  const M = (60 / bpm) * 4;
  const shift = offset % M;
  const n = Math.max(1, Math.ceil((dur - shift) / M));
  const e = new Float64Array(n);
  for (let m = 0; m < n; m++) {
    const a = Math.max(0, Math.floor((shift + m * M) / hopSec)), b = Math.min(env.length, Math.floor((shift + (m + 1) * M) / hopSec));
    let sum = 0;
    for (let i = a; i < b; i++) sum += env[i];
    e[m] = b > a ? sum / (b - a) : 0;
  }
  // 3-탭 평활 후 분위수 기준으로 3단계
  const sm = e.map((v, i) => 0.25 * (e[Math.max(0, i - 1)]) + 0.5 * v + 0.25 * (e[Math.min(n - 1, i + 1)]));
  const sorted = [...sm].sort((x, y) => x - y);
  const q1 = sorted[Math.floor(n * 0.34)], q2 = sorted[Math.floor(n * 0.67)];
  let lv = Array.from(sm, (v) => (v < q1 ? 0 : v < q2 ? 1 : 2));
  // 런 구성 후, 최소 길이 미만은 가장 가까운 이웃에 병합
  const minLen = clamp(dur * 0.07, 10, 22);
  let runs = [];
  lv.forEach((l, i) => { if (runs.length && runs[runs.length - 1].l === l) runs[runs.length - 1].n++; else runs.push({ l, s: i, n: 1 }); });
  const avg = (r) => { let t = 0; for (let i = r.s; i < r.s + r.n; i++) t += sm[i]; return t / r.n; };
  for (let guard = 0; guard < 200; guard++) {
    let k = runs.findIndex((r) => r.n * M < minLen);
    if (k < 0 || runs.length <= 1) break;
    const r = runs[k];
    const L = runs[k - 1], R = runs[k + 1];
    let tgt = !L ? R : !R ? L : Math.abs(avg(L) - avg(r)) <= Math.abs(avg(R) - avg(r)) ? L : R;
    tgt.n += r.n; tgt.s = Math.min(tgt.s, r.s);
    runs.splice(k, 1);
    // 인접 런 같은 레벨이면 합치기
    for (let i = runs.length - 1; i > 0; i--) if (runs[i].l === runs[i - 1].l) { runs[i - 1].n += runs[i].n; runs.splice(i, 1); }
  }
  // 이름 붙이기
  const count = {};
  return runs.map((r, i) => {
    const t0 = i === 0 ? 0 : shift + r.s * M;
    const t1 = i === runs.length - 1 ? dur : shift + (r.s + r.n) * M;
    let base = r.l === 2 ? 'CHORUS' : r.l === 1 ? 'BUILD' : 'VERSE';
    if (i === 0 && r.l === 0) base = 'INTRO';
    else if (i === runs.length - 1 && r.l === 0) base = 'OUTRO';
    count[base] = (count[base] || 0) + 1;
    const ord = ['', '', ' II', ' III', ' IV', ' V', ' VI'][count[base]] ?? ' ' + count[base];
    return { t0, t1, level: r.l, name: base + ord };
  });
}

export function generateAll(pcm, sr, song) {
  const an = analyze(pcm, sr, song.bpm);
  const ss = stepScores(an);
  const charts = {};
  for (const d of DIFFS) charts[d.key] = makeChart(ss, d, song.id, 0, !!song.extreme);
  // 단계 2~3 등 상위 단계 채보는 필요할 때 만든다 (ss 보관)
  return { charts, ss, bpm: an.bpm, offset: an.offset, duration: an.dur, sections: detectSections(an) };
}
