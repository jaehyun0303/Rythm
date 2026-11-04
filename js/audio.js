// 오디오 엔진: 디코드/분석 캐시, 정밀 게임 클럭, 미리듣기, 스펙트럼, 히트사운드, 데모 비트 합성
import { generateAllAsync, makeChart, DIFFS } from './chart.js';
import { mulberry32 } from './util.js';

const DEMO_SR = 22050;

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.cache = new Map();   // songId -> { buffer, source, charts, ... }
    this.lru = [];
    this.volume = 0.8;
    this.t0 = 0;
    this.running = false;
    this._lc = 0; this._lp = 0;
    this.src = null;
    this.prev = null;
    this.pending = new Map();
    this.freq = null;
  }

  ensureCtx() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC({ latencyHint: 'interactive' });
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.7;
      this.freq = new Uint8Array(this.analyser.frequencyBinCount);
      this.master.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
      this.sfx = this.ctx.createGain();
      this.sfx.gain.value = 0.5;
      this.sfx.connect(this.ctx.destination);
    }
    return this.ctx;
  }
  async unlock() {
    this.ensureCtx();
    if (this.ctx.state === 'suspended') { try { await this.ctx.resume(); } catch (e) { /* ignore */ } }
  }
  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.value = v;
  }

  // ---- 로드: 음원 디코드 -> 채보 생성 (곡당 1회, 결과 캐시) ----
  load(song) {
    if (this.cache.has(song.id)) return Promise.resolve(this._touch(song.id));
    if (this.pending.has(song.id)) return this.pending.get(song.id);
    const p = this._load(song).finally(() => this.pending.delete(song.id));
    this.pending.set(song.id, p);
    return p;
  }
  _touch(id) {
    this.lru = this.lru.filter((x) => x !== id);
    this.lru.push(id);
    return this.cache.get(id);
  }
  async _load(song) {
    this.ensureCtx();
    let buffer = null, source = 'demo', pcm = null, sr = DEMO_SR;
    try {
      const res = await fetch(song.audio);
      if (res.ok) {
        const ab = await res.arrayBuffer();
        buffer = await this.ctx.decodeAudioData(ab);
        source = 'file';
        sr = buffer.sampleRate;
        pcm = mixMono(buffer);
      }
    } catch (e) { /* 파일 없음 -> 데모 */ }
    if (!buffer) {
      pcm = makeDemo(song.bpm, song.duration || 200, song.id);
      buffer = this.ctx.createBuffer(1, pcm.length, DEMO_SR);
      buffer.copyToChannel(pcm, 0);
    }
    // 메인 스레드를 잠깐 양보해서 UI가 멈추지 않게
    await new Promise((r) => setTimeout(r, 0));
    const gen = await generateAllAsync(pcm, sr, song);
    const entry = { buffer, source, duration: buffer.duration, ...gen, stageCharts: {} };
    entry.chartFor = (diffKey, stage = 0) => {
      if (stage === 0) return entry.charts[diffKey];
      const k = diffKey + ':' + stage;
      if (!entry.stageCharts[k]) entry.stageCharts[k] = makeChart(entry.ss, DIFFS.find((d) => d.key === diffKey), song.id, stage, !!song.extreme);
      return entry.stageCharts[k];
    };
    this.cache.set(song.id, entry);
    this.lru.push(song.id);
    // 디코드된 버퍼는 최근 3곡만 유지 (차트는 가벼우니 유지)
    while (this.lru.length > 3) {
      const old = this.lru.shift();
      const e = this.cache.get(old);
      if (e) { e.buffer = null; e.stale = true; }
      this.cache.delete(old);
      this.chartKeep = this.chartKeep || new Map();
      if (e) this.chartKeep.set(old, e);
    }
    return entry;
  }

  // ---- 게임 재생 / 클럭 ----
  play(buffer, leadIn) {
    this.stopPreview(0);
    this.stopSong();
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.master);
    this.t0 = this.ctx.currentTime + leadIn;
    src.start(this.t0);
    this.src = src;
    this.running = true;
    this._lc = this.ctx.currentTime;
    this._lp = performance.now();
    this.ended = false;
    src.onended = () => { this.ended = true; };
  }
  stopSong() {
    if (this.src) {
      try { this.src.onended = null; this.src.stop(); } catch (e) { /* ignore */ }
      try { this.src.disconnect(); } catch (e) { /* ignore */ }
      this.src = null;
    }
    this.running = false;
  }
  // 노래 시간(초). perf 를 넘기면 해당 시점(입력 이벤트 타임스탬프)으로 환산
  time(perf) {
    const c = this.ctx.currentTime;
    if (c !== this._lc) { this._lc = c; this._lp = performance.now(); }
    const p = perf === undefined ? performance.now() : perf;
    let dt = this.running ? (p - this._lp) / 1000 : 0;
    dt = Math.min(dt, 0.1);
    const lat = this.ctx.outputLatency || this.ctx.baseLatency || 0;
    return this._lc + dt - lat - this.t0;
  }
  async pause() { this.running = false; await this.ctx.suspend(); }
  async resume() {
    await this.ctx.resume();
    this._lc = this.ctx.currentTime; this._lp = performance.now();
    this.running = true;
  }

  // ---- 미리듣기 ----
  playPreview(entry, start) {
    this.stopPreview(0.15);
    if (!entry || !entry.buffer) return;
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 0.6);
    g.connect(this.master);
    const s = ctx.createBufferSource();
    s.buffer = entry.buffer;
    const st = Math.min(start, Math.max(0, entry.buffer.duration - 20));
    s.loop = true; s.loopStart = st; s.loopEnd = Math.min(entry.buffer.duration, st + 20);
    s.connect(g);
    s.start(0, st);
    this.prev = { s, g };
  }
  stopPreview(fade = 0.2) {
    const p = this.prev;
    if (!p) return;
    this.prev = null;
    const t = this.ctx.currentTime;
    try {
      p.g.gain.cancelScheduledValues(t);
      p.g.gain.setValueAtTime(p.g.gain.value, t);
      p.g.gain.linearRampToValueAtTime(0, t + fade);
      p.s.stop(t + fade + 0.02);
    } catch (e) { /* ignore */ }
  }

  // ---- 히트사운드 ----
  tick(vol = 0.5) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(1900, t);
    o.frequency.exponentialRampToValueAtTime(900, t + 0.04);
    g.gain.setValueAtTime(vol * 0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    o.connect(g); g.connect(this.sfx);
    o.start(t); o.stop(t + 0.06);
  }
  // 스펙트럼 바 n개 (0..1)
  spectrum(n, out, demoPhase) {
    if (!this.ctx || !this.running) {
      for (let i = 0; i < n; i++) out[i] *= 0.9;
      return out;
    }
    this.analyser.getByteFrequencyData(this.freq);
    const bins = this.freq.length * 0.62; // 상위 고주파 제외
    for (let i = 0; i < n; i++) {
      const a = Math.floor(Math.pow(i / n, 1.7) * bins) + 1;
      const b = Math.max(a + 1, Math.floor(Math.pow((i + 1) / n, 1.7) * bins) + 1);
      let m = 0;
      for (let k = a; k < b; k++) m = Math.max(m, this.freq[k]);
      const v = m / 255;
      out[i] = Math.max(v, out[i] * 0.86);
    }
    return out;
  }
}

function mixMono(buffer) {
  const n = buffer.length, ch = buffer.numberOfChannels;
  const out = new Float32Array(n);
  for (let c = 0; c < ch; c++) {
    const d = buffer.getChannelData(c);
    for (let i = 0; i < n; i++) out[i] += d[i] / ch;
  }
  return out;
}

// ---- 데모 비트: 음원 파일이 없을 때 대신 재생되는 합성 트랙 ----
export function makeDemo(bpm, dur, seedStr) {
  const sr = DEMO_SR;
  const out = new Float32Array(Math.floor(sr * dur));
  const B = 60 / bpm;
  const rnd = mulberry32(seedStr.length * 977 + Math.floor(bpm));
  const roots = [55, 43.65, 49, 65.41]; // A1 F1 G1 C2
  const add = (t, len, fn) => {
    const s = Math.floor(t * sr), n = Math.floor(len * sr);
    for (let i = 0; i < n && s + i < out.length; i++) out[s + i] += fn(i / sr, i / n);
  };
  const beats = Math.floor((dur - 1) / B);
  for (let b = 0; b < beats; b++) {
    const bar = Math.floor(b / 4), bt = b % 4, t = b * B;
    const intro = bar < 4, breakdown = bar >= 28 && bar < 32;
    const root = roots[bar % 4];
    if (!intro && !breakdown || bt === 0 && bar % 8 === 0) {
      add(t, 0.22, (x, u) => Math.sin(2 * Math.PI * (45 + 95 * Math.exp(-x * 30)) * x) * Math.exp(-u * 5) * 0.85);
    }
    if (bar >= 2 && (bt === 1 || bt === 3) && !breakdown) {
      add(t, 0.16, (x, u) => (rnd() * 2 - 1) * Math.exp(-u * 7) * 0.42 + Math.sin(2 * Math.PI * 190 * x) * Math.exp(-u * 12) * 0.25);
    }
    if (bar >= 1 && !breakdown) {
      for (let h = 0; h < 2; h++) {
        const th = t + h * B / 2 + (h ? 0 : 0);
        add(th + (h ? 0 : B / 4 * 0), 0.045, (x, u) => (rnd() * 2 - 1) * Math.exp(-u * 9) * (h ? 0.22 : 0.1));
      }
    }
    if (!intro) {
      const bn = root * (bt === 3 ? 1.5 : 1);
      add(t + B / 2, B * 0.42, (x, u) => {
        const ph = (x * bn * 2) % 2;
        return (Math.sin(2 * Math.PI * bn * x) * 0.5 + (ph < 1 ? 0.14 : -0.14)) * Math.exp(-u * 2.2) * 0.5;
      });
    }
    if (bar >= 2) { // 아르페지오
      const sc = [1, 1.2, 1.5, 1.8];
      for (let q = 0; q < 2; q++) {
        const f = root * 4 * sc[(bt * 2 + q + bar) % 4];
        add(t + q * B / 2, B * 0.5, (x, u) => Math.sin(2 * Math.PI * f * x) * Math.exp(-u * 4) * 0.16);
      }
    }
  }
  let mx = 0;
  for (let i = 0; i < out.length; i++) mx = Math.max(mx, Math.abs(out[i]));
  const g = mx > 0 ? 0.8 / mx : 1;
  for (let i = 0; i < out.length; i++) out[i] *= g;
  return out;
}
