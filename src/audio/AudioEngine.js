// Chiptune sound effects and music synthesized with the Web Audio API.
// Nothing is loaded from files. The AudioContext is created on the first
// user gesture because mobile browsers block audio before that.

import { TRACKS } from './tracks.js';

const NOTE_INDEX = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

export function noteFreq(note) {
  const m = /^([A-G]#?)(-?\d)$/.exec(note);
  if (!m) return 0;
  const midi = NOTE_INDEX[m[1]] + (Number(m[2]) + 1) * 12;
  return 440 * 2 ** ((midi - 69) / 12);
}

// Minimum gap between two plays of the same effect, so 20 explosions in
// one frame don't clip.
const THROTTLE_MS = {
  shoot: 70,
  laser: 70,
  hit: 35,
  explode: 45,
  enemyShoot: 60,
  block: 50,
  pickup: 60,
};

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.volumes = { sfx: 0.8, bgm: 0.5 };
    this.lastPlayed = {};
    this.currentTrack = null;
    this.wantedTrack = null;
    this.timer = null;
  }

  // Called from a user gesture handler.
  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createDynamicsCompressor();
      this.master.connect(this.ctx.destination);
      this.sfxGain = this.ctx.createGain();
      this.bgmGain = this.ctx.createGain();
      this.sfxGain.connect(this.master);
      this.bgmGain.connect(this.master);
      this.noiseBuffer = this.makeNoise();
      this.applyVolumes();
      if (this.wantedTrack) this.playMusic(this.wantedTrack, true);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  suspend() {
    if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  setVolumes(sfx, bgm) {
    this.volumes = { sfx, bgm };
    this.applyVolumes();
  }

  applyVolumes() {
    if (!this.ctx) return;
    this.sfxGain.gain.value = this.volumes.sfx;
    this.bgmGain.gain.value = this.volumes.bgm * 0.55;
  }

  makeNoise() {
    const len = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  // ---- voices -------------------------------------------------------------

  tone({ type = 'square', freq, freqEnd, dur, gain = 0.2, at, attack = 0.004, dest }) {
    const ctx = this.ctx;
    const t0 = at ?? ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(dest ?? this.sfxGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  noise({ dur, gain = 0.2, at, filter = 'lowpass', freq = 2000, freqEnd, dest }) {
    const ctx = this.ctx;
    const t0 = at ?? ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const f = ctx.createBiquadFilter();
    f.type = filter;
    f.frequency.setValueAtTime(freq, t0);
    if (freqEnd) f.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(dest ?? this.sfxGain);
    src.start(t0, Math.random() * 0.5);
    src.stop(t0 + dur + 0.02);
  }

  arp(notes, { type = 'square', step = 0.06, gain = 0.15 } = {}) {
    const t0 = this.ctx.currentTime;
    notes.forEach((f, i) => this.tone({ type, freq: f, dur: step * 1.6, gain, at: t0 + i * step }));
  }

  // ---- sound effects ------------------------------------------------------

  play(name) {
    if (!this.ctx || this.ctx.state !== 'running' || this.volumes.sfx <= 0) return;
    const now = performance.now();
    const gap = THROTTLE_MS[name];
    if (gap && now - (this.lastPlayed[name] ?? 0) < gap) return;
    this.lastPlayed[name] = now;

    switch (name) {
      case 'shoot':
        this.tone({ freq: 1250, freqEnd: 600, dur: 0.05, gain: 0.035 });
        break;
      case 'laser':
        this.tone({ type: 'sawtooth', freq: 1600, freqEnd: 400, dur: 0.07, gain: 0.04 });
        break;
      case 'hit':
        this.noise({ dur: 0.04, gain: 0.08, filter: 'highpass', freq: 3000 });
        break;
      case 'block':
        this.tone({ type: 'triangle', freq: 2200, freqEnd: 1800, dur: 0.05, gain: 0.08 });
        break;
      case 'explode':
        this.noise({ dur: 0.22, gain: 0.25, freq: 2500, freqEnd: 150 });
        this.tone({ freq: 220, freqEnd: 50, dur: 0.18, gain: 0.08 });
        break;
      case 'bigExplode':
        this.noise({ dur: 1.2, gain: 0.5, freq: 1800, freqEnd: 60 });
        this.tone({ type: 'sine', freq: 140, freqEnd: 30, dur: 1.0, gain: 0.35 });
        break;
      case 'hurt':
        this.tone({ freq: 320, freqEnd: 70, dur: 0.25, gain: 0.18 });
        this.noise({ dur: 0.15, gain: 0.2, freq: 1200 });
        break;
      case 'enemyShoot':
        this.tone({ type: 'triangle', freq: 700, freqEnd: 300, dur: 0.08, gain: 0.05 });
        break;
      case 'pickup':
        this.arp([660, 880, 1320], { step: 0.045, gain: 0.1 });
        break;
      case 'powerup':
        this.arp([523, 659, 784, 1047, 1319], { type: 'square', step: 0.05, gain: 0.1 });
        break;
      case 'heal':
        this.tone({ type: 'triangle', freq: 440, freqEnd: 1320, dur: 0.35, gain: 0.2 });
        break;
      case 'click':
        this.tone({ freq: 900, dur: 0.04, gain: 0.08 });
        break;
      case 'upgrade':
        this.arp([784, 988, 1175, 1568], { type: 'triangle', step: 0.06, gain: 0.22 });
        break;
      case 'waveClear':
        this.arp([523, 659, 784, 1047, 784, 1047], { step: 0.07, gain: 0.1 });
        break;
      case 'warning': {
        const t0 = this.ctx.currentTime;
        for (let i = 0; i < 4; i++) {
          this.tone({ type: 'sawtooth', freq: 440, freqEnd: 880, dur: 0.3, gain: 0.09, at: t0 + i * 0.35 });
        }
        break;
      }
      case 'charge':
        this.tone({ type: 'sine', freq: 180, freqEnd: 900, dur: 0.8, gain: 0.12, attack: 0.3 });
        break;
      case 'beam':
        this.tone({ type: 'sawtooth', freq: 90, freqEnd: 70, dur: 0.9, gain: 0.15 });
        this.noise({ dur: 0.9, gain: 0.12, freq: 900 });
        break;
      case 'gameOver': {
        const t0 = this.ctx.currentTime;
        [440, 370, 311, 262, 196].forEach((f, i) =>
          this.tone({ freq: f, dur: 0.3, gain: 0.14, at: t0 + i * 0.2 }),
        );
        break;
      }
      default:
        break;
    }
  }

  // ---- music --------------------------------------------------------------

  playMusic(name, force = false) {
    this.wantedTrack = name;
    if (!this.ctx) return;
    if (!force && this.currentTrack === name && this.timer) return;
    this.stopMusic(false);
    const track = TRACKS[name];
    if (!track) return;
    this.currentTrack = name;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.08;
    this.timer = window.setInterval(() => this.schedule(track), 25);
  }

  stopMusic(clearWanted = true) {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    this.currentTrack = null;
    if (clearWanted) this.wantedTrack = null;
  }

  schedule(track) {
    const ctx = this.ctx;
    if (ctx.state !== 'running') return;
    const stepDur = 60 / track.bpm / 4;
    // After a long stall (tab in background) skip ahead instead of
    // playing every missed note at once.
    if (this.nextTime < ctx.currentTime - 0.2) this.nextTime = ctx.currentTime + 0.05;
    while (this.nextTime < ctx.currentTime + 0.12) {
      this.playStep(track, this.step, this.nextTime, stepDur);
      this.nextTime += stepDur;
      this.step = (this.step + 1) % track.steps;
    }
  }

  playStep(track, step, at, stepDur) {
    const dest = this.bgmGain;
    for (const ch of track.channels) {
      const ev = ch.notes[step % ch.notes.length];
      if (!ev || ev === '.') continue;
      if (ch.type === 'drum') {
        if (ev === 'k') this.tone({ type: 'sine', freq: 150, freqEnd: 40, dur: 0.12, gain: 0.5, at, dest });
        else if (ev === 's') this.noise({ dur: 0.1, gain: 0.25, filter: 'bandpass', freq: 1800, at, dest });
        else if (ev === 'h') this.noise({ dur: 0.03, gain: 0.1, filter: 'highpass', freq: 7000, at, dest });
        continue;
      }
      const [note, len = 1] = ev.split(':');
      this.tone({
        type: ch.wave,
        freq: noteFreq(note),
        dur: stepDur * Number(len) * 0.95,
        gain: ch.gain,
        at,
        attack: 0.006,
        dest,
      });
    }
  }
}

export const audio = new AudioEngine();
