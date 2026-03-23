import { useState, useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";

// ── Sound Effects ──
const SFX = {
  _started: false,
  async init() {
    if (this._started) return;
    await Tone.start();
    this._started = true;
  },
  bounce() {
    if (!this._started) return;
    const synth = new Tone.Synth({ oscillator: { type: "triangle" }, envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }, volume: -12 }).toDestination();
    synth.triggerAttackRelease("C5", "16n");
    setTimeout(() => synth.dispose(), 300);
  },
  spring() {
    if (!this._started) return;
    const synth = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.2 }, volume: -8 }).toDestination();
    synth.triggerAttackRelease("C5", "16n");
    setTimeout(() => {
      const s2 = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.2 }, volume: -8 }).toDestination();
      s2.triggerAttackRelease("E5", "16n");
      setTimeout(() => {
        const s3 = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 0.3 }, volume: -6 }).toDestination();
        s3.triggerAttackRelease("G5", "16n");
        setTimeout(() => s3.dispose(), 500);
      }, 60);
      setTimeout(() => s2.dispose(), 500);
    }, 60);
    setTimeout(() => synth.dispose(), 500);
  },
  crumble() {
    if (!this._started) return;
    const noise = new Tone.NoiseSynth({ noise: { type: "brown" }, envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.1 }, volume: -14 }).toDestination();
    noise.triggerAttackRelease("8n");
    setTimeout(() => noise.dispose(), 500);
  },
  carrot() {
    if (!this._started) return;
    const synth = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 }, volume: -10 }).toDestination();
    synth.triggerAttackRelease("E6", "32n");
    setTimeout(() => {
      const s2 = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 }, volume: -10 }).toDestination();
      s2.triggerAttackRelease("G6", "32n");
      setTimeout(() => s2.dispose(), 300);
    }, 50);
    setTimeout(() => synth.dispose(), 300);
  },
  star() {
    if (!this._started) return;
    const notes = ["C5", "E5", "G5", "C6"];
    notes.forEach((note, i) => {
      setTimeout(() => {
        const synth = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.3 }, volume: -8 }).toDestination();
        synth.triggerAttackRelease(note, "8n");
        setTimeout(() => synth.dispose(), 600);
      }, i * 80);
    });
  },
  spike() {
    if (!this._started) return;
    const synth = new Tone.Synth({ oscillator: { type: "sawtooth" }, envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.1 }, volume: -10 }).toDestination();
    synth.triggerAttackRelease("D#3", "16n");
    setTimeout(() => {
      const s2 = new Tone.Synth({ oscillator: { type: "sawtooth" }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.15 }, volume: -10 }).toDestination();
      s2.triggerAttackRelease("C3", "8n");
      setTimeout(() => s2.dispose(), 400);
    }, 80);
    setTimeout(() => synth.dispose(), 400);
  },
  gameOver() {
    if (!this._started) return;
    const notes = ["E4", "D4", "C4", "B3"];
    notes.forEach((note, i) => {
      setTimeout(() => {
        const synth = new Tone.Synth({ oscillator: { type: "triangle" }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.05, release: 0.4 }, volume: -8 }).toDestination();
        synth.triggerAttackRelease(note, "4n");
        setTimeout(() => synth.dispose(), 800);
      }, i * 200);
    });
  },
  shield() {
    if (!this._started) return;
    const notes = ["G4", "B4", "D5", "G5", "D5", "G5"];
    notes.forEach((note, i) => {
      setTimeout(() => {
        const synth = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.15, sustain: 0.05, release: 0.2 }, volume: -8 }).toDestination();
        synth.triggerAttackRelease(note, "16n");
        setTimeout(() => synth.dispose(), 400);
      }, i * 55);
    });
  },
};

const W = 380;
const H = 640;
const BUNNY_W = 32;
const BUNNY_H = 32;
const GRAVITY = 0.3;
const BOUNCE_VY = -10;
const POWER_BOUNCE = -14;
const MOVE_SPEED = 5;

const PLATFORM_TYPES = [
  { type: "normal", color: "#66bb6a", w: 64 },
  { type: "wood", color: "#a1887f", w: 58 },
  { type: "ice", color: "#81d4fa", w: 52 },
  { type: "crumble", color: "#bcaaa4", w: 56 },
];

const SPRING_BOUNCE = -16;

// ── Base costumes (first 6) ──
const BASE_COSTUMES = [
  { name: "Baby Bunny", body: "#f8bbd0", ear: "#f48fb1", eye: "#333", belly: "#fce4ec", accessory: null },
  { name: "Swift Rabbit", body: "#a5d6a7", ear: "#66bb6a", eye: "#1b5e20", belly: "#e8f5e9", accessory: "bandana" },
  { name: "Ninja Bunny", body: "#78909c", ear: "#546e7a", eye: "#ff1744", belly: "#455a64", accessory: "mask" },
  { name: "Golden Hare", body: "#ffd54f", ear: "#ffb300", eye: "#e65100", belly: "#fff8e1", accessory: "crown" },
  { name: "Star Bunny", body: "#ce93d8", ear: "#ab47bc", eye: "#fff", belly: "#f3e5f5", accessory: "stars" },
  { name: "Cosmic Rabbit", body: "#4dd0e1", ear: "#00acc1", eye: "#ff4081", belly: "#e0f7fa", accessory: "aura" },
];

// ── Procedural evolution system ──
const EVO_PALETTES = [
  { body: "#ff7043", ear: "#e64a19", eye: "#fff", belly: "#fbe9e7", label: "Ember" },
  { body: "#ab47bc", ear: "#7b1fa2", eye: "#ffd54f", belly: "#f3e5f5", label: "Mystic" },
  { body: "#26c6da", ear: "#00838f", eye: "#ff4081", belly: "#e0f7fa", label: "Frost" },
  { body: "#66bb6a", ear: "#2e7d32", eye: "#ffeb3b", belly: "#e8f5e9", label: "Forest" },
  { body: "#ef5350", ear: "#b71c1c", eye: "#fff", belly: "#ffcdd2", label: "Inferno" },
  { body: "#5c6bc0", ear: "#283593", eye: "#ffab40", belly: "#e8eaf6", label: "Twilight" },
  { body: "#ffa726", ear: "#e65100", eye: "#1a237e", belly: "#fff3e0", label: "Solar" },
  { body: "#ec407a", ear: "#ad1457", eye: "#76ff03", belly: "#fce4ec", label: "Neon" },
  { body: "#78909c", ear: "#37474f", eye: "#00e5ff", belly: "#cfd8dc", label: "Chrome" },
  { body: "#8d6e63", ear: "#4e342e", eye: "#ffd54f", belly: "#efebe9", label: "Earth" },
  { body: "#fff176", ear: "#f9a825", eye: "#e91e63", belly: "#fffde7", label: "Lemon" },
  { body: "#4db6ac", ear: "#00695c", eye: "#ff6e40", belly: "#e0f2f1", label: "Jade" },
];

const EVO_ACCESSORIES = ["bandana", "mask", "crown", "stars", "aura", "horns", "halo", "flames"];
const EVO_TITLES = ["Ancient", "Mythic", "Legendary", "Ethereal", "Celestial", "Divine", "Immortal", "Transcendent", "Omega", "Infinite"];
const EVO_ANIMALS = ["Bunny", "Rabbit", "Hare", "Jackalope", "Moon Rabbit", "Thunder Hare", "Void Bunny", "Phantom Hare", "Spirit Rabbit", "Astral Bunny"];

// Seeded random for consistent costume per level
function seededRand(seed) {
  let s = seed * 2654435761 >>> 0;
  s = ((s ^ (s >> 16)) * 0x45d9f3b) >>> 0;
  s = ((s ^ (s >> 16)) * 0x45d9f3b) >>> 0;
  return (s >>> 0) / 0xFFFFFFFF;
}

const _costumeCache = {};
function getCostume(idx) {
  if (idx < BASE_COSTUMES.length) return BASE_COSTUMES[idx];
  if (_costumeCache[idx]) return _costumeCache[idx];

  const gen = idx - BASE_COSTUMES.length; // generation number past base
  const era = Math.floor(gen / EVO_PALETTES.length); // which cycle
  const palIdx = gen % EVO_PALETTES.length;
  const pal = EVO_PALETTES[palIdx];
  const accIdx = gen % EVO_ACCESSORIES.length;
  const titleIdx = Math.min(era, EVO_TITLES.length - 1);
  const animalIdx = gen % EVO_ANIMALS.length;

  // Shift colors slightly each era for uniqueness
  const hueShift = era * 15;
  const r = seededRand(idx);

  const costume = {
    name: `${EVO_TITLES[titleIdx]} ${EVO_ANIMALS[animalIdx]}`,
    body: pal.body,
    ear: pal.ear,
    eye: pal.eye,
    belly: pal.belly,
    accessory: EVO_ACCESSORIES[accIdx],
    era: era + 1, // used for special effects
    glow: era >= 1, // era 1+ gets a glow
    rainbow: era >= 3, // era 3+ gets rainbow shimmer
    trail: era >= 2, // era 2+ gets particle trail
  };
  _costumeCache[idx] = costume;
  return costume;
}

// Alias for compatibility
const COSTUMES = { length: Infinity };
COSTUMES[Symbol.iterator] = undefined;

function drawBunny(ctx, x, y, facing, costumeIdx, powered, frameCount) {
  const c = getCostume(costumeIdx);
  ctx.save();
  ctx.translate(x, y);
  if (facing === -1) {
    ctx.scale(-1, 1);
    ctx.translate(-BUNNY_W, 0);
  }

  const cx = BUNNY_W / 2;
  const cy = BUNNY_H / 2 + 2;

  // ── Shadow on ground ──
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.beginPath();
  ctx.ellipse(cx, BUNNY_H + 2, 10, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Ears ──
  const earBob = Math.sin((frameCount || 0) * 0.1) * 1.5;
  // Left ear
  ctx.fillStyle = c.ear;
  ctx.beginPath();
  ctx.ellipse(cx - 7, cy - 20 + earBob, 5, 14, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Inner ear
  ctx.fillStyle = c.belly;
  ctx.beginPath();
  ctx.ellipse(cx - 7, cy - 18 + earBob, 2.5, 9, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Right ear
  ctx.fillStyle = c.ear;
  ctx.beginPath();
  ctx.ellipse(cx + 7, cy - 21 - earBob * 0.5, 5, 13, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Inner ear
  ctx.fillStyle = c.belly;
  ctx.beginPath();
  ctx.ellipse(cx + 7, cy - 19 - earBob * 0.5, 2.5, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // ── Body ──
  ctx.fillStyle = c.body;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, 13, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Belly ──
  ctx.fillStyle = c.belly;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 5, 8, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Head ──
  ctx.fillStyle = c.body;
  ctx.beginPath();
  ctx.arc(cx, cy - 6, 11, 0, Math.PI * 2);
  ctx.fill();

  // ── Eyes ──
  // White
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(cx + 4, cy - 8, 4.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx - 3, cy - 8, 3.5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pupil
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.arc(cx + 5, cy - 8, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - 2, cy - 8, 2, 0, Math.PI * 2);
  ctx.fill();
  // Eye shine
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(cx + 5.8, cy - 9.2, 1, 0, Math.PI * 2);
  ctx.fill();

  // ── Nose ──
  ctx.fillStyle = c.ear;
  ctx.beginPath();
  ctx.ellipse(cx + 2, cy - 3, 2, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Mouth ──
  ctx.strokeStyle = c.ear;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(cx + 2, cy - 2, 2, 0, Math.PI);
  ctx.stroke();

  // ── Little feet ──
  ctx.fillStyle = c.ear;
  ctx.beginPath();
  ctx.ellipse(cx - 7, cy + 15, 5, 3, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 7, cy + 15, 5, 3, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // ── Tail ──
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(cx - 12, cy + 6, 4, 0, Math.PI * 2);
  ctx.fill();

  // ── Accessories ──
  if (c.accessory === "bandana") {
    ctx.fillStyle = "#e53935";
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 5);
    ctx.lineTo(cx + 12, cy - 5);
    ctx.lineTo(cx + 11, cy - 2);
    ctx.lineTo(cx - 9, cy - 2);
    ctx.fill();
    // Knot
    ctx.beginPath();
    ctx.moveTo(cx + 12, cy - 4);
    ctx.lineTo(cx + 18, cy - 7);
    ctx.lineTo(cx + 16, cy);
    ctx.fill();
  }

  if (c.accessory === "mask") {
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 11);
    ctx.lineTo(cx + 13, cy - 11);
    ctx.lineTo(cx + 13, cy - 5);
    ctx.lineTo(cx - 10, cy - 5);
    ctx.fill();
    // Eye slits
    ctx.fillStyle = c.eye;
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy - 8, 3, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx - 3, cy - 8, 2.5, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (c.accessory === "crown") {
    ctx.fillStyle = "#ffd54f";
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 16);
    ctx.lineTo(cx - 10, cy - 24);
    ctx.lineTo(cx - 4, cy - 20);
    ctx.lineTo(cx, cy - 26);
    ctx.lineTo(cx + 4, cy - 20);
    ctx.lineTo(cx + 10, cy - 24);
    ctx.lineTo(cx + 8, cy - 16);
    ctx.fill();
    // Gems
    ctx.fillStyle = "#e53935";
    ctx.beginPath();
    ctx.arc(cx, cy - 19, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2196f3";
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 18, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 18, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  if (c.accessory === "stars") {
    const t = (frameCount || 0) * 0.05;
    ctx.fillStyle = "#ffd54f";
    for (let i = 0; i < 4; i++) {
      const angle = t + i * (Math.PI / 2);
      const sx = cx + Math.cos(angle) * 18;
      const sy = cy - 4 + Math.sin(angle) * 18;
      ctx.font = "8px serif";
      ctx.fillText("⭐", sx - 4, sy + 4);
    }
  }

  if (c.accessory === "aura") {
    const t = (frameCount || 0) * 0.03;
    ctx.strokeStyle = "rgba(77,208,225,0.3)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const r = 18 + i * 6 + Math.sin(t + i) * 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#4dd0e1";
    for (let i = 0; i < 5; i++) {
      const angle = t * 2 + i * (Math.PI * 2 / 5);
      const pr = 22 + Math.sin(t + i * 2) * 4;
      const px = cx + Math.cos(angle) * pr;
      const py = cy + Math.sin(angle) * pr;
      ctx.globalAlpha = 0.5 + Math.sin(t + i) * 0.3;
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (c.accessory === "horns") {
    ctx.fillStyle = "#b71c1c";
    // Left horn
    ctx.beginPath();
    ctx.moveTo(cx - 9, cy - 15);
    ctx.lineTo(cx - 14, cy - 30);
    ctx.lineTo(cx - 4, cy - 18);
    ctx.fill();
    // Right horn
    ctx.beginPath();
    ctx.moveTo(cx + 9, cy - 15);
    ctx.lineTo(cx + 14, cy - 30);
    ctx.lineTo(cx + 4, cy - 18);
    ctx.fill();
    // Horn shine
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();
    ctx.moveTo(cx - 11, cy - 22);
    ctx.lineTo(cx - 13, cy - 28);
    ctx.lineTo(cx - 8, cy - 20);
    ctx.fill();
  }

  if (c.accessory === "halo") {
    const t = (frameCount || 0) * 0.04;
    const haloY = cy - 24 + Math.sin(t) * 2;
    ctx.strokeStyle = "#ffd54f";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7 + Math.sin(t * 2) * 0.2;
    ctx.beginPath();
    ctx.ellipse(cx, haloY, 12, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Glow
    ctx.strokeStyle = "rgba(255,213,79,0.3)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(cx, haloY, 12, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  if (c.accessory === "flames") {
    const t = (frameCount || 0) * 0.1;
    for (let i = 0; i < 6; i++) {
      const fx = cx + (i - 3) * 5 + Math.sin(t + i * 1.5) * 3;
      const fy = cy + 16 - Math.abs(Math.sin(t + i * 0.8)) * 12;
      const fs = 3 + Math.sin(t + i) * 1.5;
      ctx.globalAlpha = 0.6 + Math.sin(t + i) * 0.3;
      ctx.fillStyle = i % 2 === 0 ? "#ff6d00" : "#ffd54f";
      ctx.beginPath();
      ctx.arc(fx, fy, fs, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ── Era-based effects ──
  if (c.glow) {
    ctx.shadowColor = c.body;
    ctx.shadowBlur = 8 + (c.era || 0) * 2;
    ctx.fillStyle = c.body + "15";
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  if (c.rainbow) {
    const t = (frameCount || 0) * 0.02;
    const colors = ["#f44336","#ff9800","#ffeb3b","#4caf50","#2196f3","#9c27b0"];
    for (let i = 0; i < 6; i++) {
      const angle = t + i * (Math.PI / 3);
      const rx = cx + Math.cos(angle) * 24;
      const ry = cy + Math.sin(angle) * 24;
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.arc(rx, ry, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function randFloat(a, b) { return Math.random() * (b - a) + a; }
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }

function makePlatform(y, difficulty) {
  // Crumble platforms start appearing at difficulty 2+, but not too often
  let pt;
  if (difficulty >= 2 && Math.random() < Math.min(0.12 + difficulty * 0.02, 0.25)) {
    pt = PLATFORM_TYPES.find(p => p.type === "crumble");
  } else {
    pt = pick(PLATFORM_TYPES.filter(p => p.type !== "crumble"));
  }
  const isMoving = pt.type !== "crumble" && difficulty > 5 && Math.random() < Math.min(0.05 + difficulty * 0.01, 0.2);
  const hasSpike = !isMoving && pt.type !== "crumble" && difficulty > 3 && Math.random() < Math.min(0.08 + difficulty * 0.015, 0.3);
  // Springs appear on non-crumble, non-spike platforms
  const hasSpring = !hasSpike && pt.type !== "crumble" && Math.random() < 0.12;
  return {
    x: randInt(20, W - 20 - pt.w),
    y,
    ...pt,
    hasSpike,
    hasSpring,
    isMoving,
    moveDir: Math.random() < 0.5 ? 1 : -1,
    moveSpeed: randFloat(0.5, 1.5),
    id: Math.random(),
    crumbleTimer: 0, // counts up when stepped on
    crumbling: false,
    fallen: false,
    fallVy: 0,
    springAnim: 0, // 0 = idle, >0 = animating (counts down)
    springPhase: "idle", // idle, compress, extend
  };
}

function makeCarrot(plat) {
  const roll = Math.random();
  let type, emoji;
  if (roll < 0.07) {
    type = "golden";
    emoji = "🥕";  // golden carrot — drawn with gold glow
  } else if (roll < 0.20) {
    type = "gold";
    emoji = "⭐";
  } else {
    type = "normal";
    emoji = "🥕";
  }
  return {
    x: plat.x + plat.w / 2 - 10,
    y: plat.y - 28,
    type,
    emoji,
    id: Math.random(),
    collected: false,
  };
}

export default function BunnyClimb() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const rafRef = useRef(null);
  const [screen, setScreen] = useState("menu");
  const [finalScore, setFinalScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [costume, setCostume] = useState(0);
  const [screenshot, setScreenshot] = useState(null);
  const [paused, setPaused] = useState(false);
  const inputRef = useRef(0); // -1 left, 0 none, 1 right

  const initGame = useCallback(() => {
    const platforms = [];
    // Ground — full-width platform at the bottom
    platforms.push({ x: 0, y: H - 40, type: "ground", color: "#5d4037", w: W, hasSpike: false, hasSpring: false, isMoving: false, moveDir: 1, moveSpeed: 0, id: 0.01, crumbleTimer: 0, crumbling: false, fallen: false, fallVy: 0 });
    // Starting platform just above ground
    platforms.push({ x: W / 2 - 32, y: H - 110, type: "normal", color: "#66bb6a", w: 64, hasSpike: false, hasSpring: false, isMoving: false, moveDir: 1, moveSpeed: 0, id: 0.1, crumbleTimer: 0, crumbling: false, fallen: false, fallVy: 0 });
    for (let i = 1; i < 18; i++) {
      platforms.push(makePlatform(H - 110 - i * 70, 0));
    }
    const carrots = [];
    platforms.forEach((p, i) => {
      // Always spawn carrots on the first 5 platforms so players see them early
      if (i > 0 && i <= 5) carrots.push(makeCarrot(p));
      else if (i > 5 && Math.random() < 0.4) carrots.push(makeCarrot(p));
    });

    gameRef.current = {
      bunny: { x: W / 2 - BUNNY_W / 2, y: H - 40 - BUNNY_H, vy: 0, facing: 1 },
      camera: 0, // how far up we've scrolled
      platforms,
      carrots,
      particles: [],
      score: 0,
      maxHeight: 0,
      powered: false,
      powerTimer: 0,
      shielded: false,
      shieldTimer: 0,
      alive: true,
      difficulty: 0,
      highestPlatY: platforms[platforms.length - 1].y,
      invincible: 0,
      combo: 0,
      frameCount: 0,
      abilityCooldown: 0, // prevents accidental double-tap
      lastSpikeY: -9999, // track last spike platform Y for spacing
      lastSpringY: -9999, // track last spring platform Y for spacing
    };
  }, []);

  const startGame = useCallback(() => {
    SFX.init();
    initGame();
    setScreen("play");
    setFinalScore(0);
    setCostume(0);
    setScreenshot(null);
    setPaused(false);
  }, [initGame]);

  // Capture game over screenshot with overlay
  const captureScreenshot = useCallback((score, costumeIdx) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    // Create a copy canvas to draw the overlay on
    const copy = document.createElement("canvas");
    copy.width = W;
    copy.height = H;
    const ctx = copy.getContext("2d");
    // Copy current game frame
    ctx.drawImage(canvas, 0, 0);
    // Dark overlay
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, W, H);
    // Score card background
    const cardY = H / 2 - 100;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.roundRect(W / 2 - 120, cardY, 240, 200, 24);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(W / 2 - 120, cardY, 240, 200, 24);
    ctx.stroke();
    // Game title
    ctx.font = "bold 20px 'Nunito', sans-serif";
    ctx.fillStyle = "#66bb6a";
    ctx.textAlign = "center";
    ctx.fillText("🐰 Bunny Climb", W / 2, cardY + 36);
    // Score
    ctx.font = "bold 48px 'Nunito', sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText(`${score}m`, W / 2, cardY + 95);
    // Level
    ctx.font = "bold 14px 'Nunito', sans-serif";
    ctx.fillStyle = "#ce93d8";
    ctx.fillText(`Level ${costumeIdx + 1}`, W / 2, cardY + 120);
    // Challenge text
    ctx.font = "bold 16px 'Nunito', sans-serif";
    ctx.fillStyle = "#ffd54f";
    ctx.fillText("Can you beat my score? 🥕", W / 2, cardY + 160);
    // Watermark
    ctx.font = "11px 'Nunito', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillText("Play Bunny Climb!", W / 2, cardY + 185);
    ctx.textAlign = "left";
    return copy.toDataURL("image/png");
  }, []);

  // Input handling
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") inputRef.current = -1;
      if (e.code === "ArrowRight" || e.code === "KeyD") inputRef.current = 1;
      if (e.code === "Space" && screen === "menu") startGame();
      if (e.code === "Space" && screen === "over") startGame();
    };
    const onKeyUp = (e) => {
      if ((e.code === "ArrowLeft" || e.code === "KeyA") && inputRef.current === -1) inputRef.current = 0;
      if ((e.code === "ArrowRight" || e.code === "KeyD") && inputRef.current === 1) inputRef.current = 0;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); };
  }, [screen, startGame]);

  // Touch/click controls
  const handlePointerDown = useCallback((e) => {
    if (screen !== "play") return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const rawX = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const rawY = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    const cx = rawX * scaleX;
    const cy = rawY * scaleY;

    const g = gameRef.current;
    if (!g || !g.alive) return;

    // Check ability button taps
    if (g._btn1 && g._btn2 && g.abilityCooldown <= 0) {
      const b1 = g._btn1;
      const b2 = g._btn2;

      // Shield button
      if (cx >= b1.x && cx <= b1.x + b1.w && cy >= b1.y && cy <= b1.y + b1.h) {
        if (g.score >= 200 && !g.shielded) {
          g.score -= 200;
          g.shielded = true;
          g.shieldTimer = 400;
          g.abilityCooldown = 20;
          SFX.shield();
          for (let i = 0; i < 8; i++) {
            g.particles.push({
              x: g.bunny.x + BUNNY_W / 2 + randFloat(-15, 15),
              y: g.bunny.y + BUNNY_H / 2 + randFloat(-15, 15),
              vx: randFloat(-2, 2), vy: randFloat(-2, 2),
              life: 25, color: "#ffa726", size: randFloat(3, 6),
            });
          }
        }
        return;
      }

      // Platform button
      if (cx >= b2.x && cx <= b2.x + b2.w && cy >= b2.y && cy <= b2.y + b2.h) {
        if (g.score >= 200) {
          g.score -= 200;
          g.abilityCooldown = 20;
          // Spawn a platform right below the bunny
          const platY = g.bunny.y + BUNNY_H + 40 + g.camera;
          const platX = Math.max(20, Math.min(g.bunny.x - 12, W - 84));
          g.platforms.push({
            x: platX, y: platY, type: "normal", color: "#ffd54f", w: 64,
            hasSpike: false, hasSpring: false, isMoving: false,
            moveDir: 1, moveSpeed: 0, id: Math.random(),
            crumbleTimer: 0, crumbling: false, fallen: false, fallVy: 0,
          });
          SFX.spring();
          for (let i = 0; i < 6; i++) {
            g.particles.push({
              x: platX + 32 + randFloat(-20, 20),
              y: platY - g.camera + randFloat(-5, 5),
              vx: randFloat(-1.5, 1.5), vy: randFloat(-2, 0),
              life: 20, color: "#ffd54f", size: randFloat(2, 5),
            });
          }
        }
        return;
      }
    }

    // Normal left/right movement
    inputRef.current = rawX < rect.width / 2 ? -1 : 1;
  }, [screen]);

  const handlePointerUp = useCallback(() => {
    inputRef.current = 0;
  }, []);

  // Game loop
  useEffect(() => {
    if (screen !== "play") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const loop = () => {
      const g = gameRef.current;
      if (!g || !g.alive) return;
      
      // When paused, just keep the RAF going but skip updates
      if (g.paused) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const b = g.bunny;

      // ── Input ──
      g.frameCount++;
      b.x += inputRef.current * MOVE_SPEED;
      if (inputRef.current !== 0) b.facing = inputRef.current;

      // Wrap around screen edges
      if (b.x < -BUNNY_W) b.x = W;
      if (b.x > W) b.x = -BUNNY_W;

      // ── Physics ──
      b.vy += GRAVITY;
      b.y += b.vy;

      // Moving platforms
      for (const p of g.platforms) {
        if (p.isMoving) {
          p.x += p.moveDir * p.moveSpeed;
          if (p.x <= 10 || p.x + p.w >= W - 10) p.moveDir *= -1;
        }
      }

      // ── Update crumbling platforms ──
      for (const p of g.platforms) {
        if (p.crumbling && !p.fallen) {
          p.crumbleTimer++;
          if (p.crumbleTimer > 15) {
            p.fallen = true;
            p.fallVy = 1;
          }
        }
        if (p.fallen) {
          p.fallVy += 0.4;
          p.y += p.fallVy;
        }
        // Spring animation tick
        if (p.springAnim > 0) {
          p.springAnim--;
          if (p.springAnim <= 0) p.springPhase = "idle";
        }
      }

      // ── Platform collision (only when falling) ──
      if (b.vy > 0) {
        for (const p of g.platforms) {
          if (p.fallen) continue; // can't land on fallen platforms
          const screenY = p.y - g.camera;
          if (
            b.x + BUNNY_W > p.x + 6 &&
            b.x < p.x + p.w - 6 &&
            b.y + BUNNY_H >= screenY &&
            b.y + BUNNY_H <= screenY + 14 + b.vy
          ) {
            b.y = screenY - BUNNY_H;

            // Crumble platform — start crumbling on contact
            if (p.type === "crumble" && !p.crumbling) {
              p.crumbling = true;
              p.crumbleTimer = 0;
              SFX.crumble();
              // Dust particles
              for (let i = 0; i < 6; i++) {
                g.particles.push({
                  x: p.x + randFloat(0, p.w),
                  y: screenY + 6,
                  vx: randFloat(-1.5, 1.5), vy: randFloat(0.5, 2),
                  life: 18, color: "#bcaaa4", size: randFloat(2, 5),
                });
              }
            }

            // Spring — super bounce!
            if (p.hasSpring) {
              p.springPhase = "compress";
              p.springAnim = 12;
              // Delay the actual bounce slightly for the compress animation
              setTimeout(() => {
                const g2 = gameRef.current;
                if (g2 && g2.alive) {
                  g2.bunny.vy = SPRING_BOUNCE;
                  p.springPhase = "extend";
                  p.springAnim = 15;
                }
              }, 80);
              SFX.spring();
              // Spring particles
              for (let i = 0; i < 6; i++) {
                g.particles.push({
                  x: b.x + BUNNY_W / 2 + randFloat(-8, 8),
                  y: b.y + BUNNY_H,
                  vx: randFloat(-2, 2), vy: randFloat(1, 4),
                  life: 20, color: "#76ff03", size: randFloat(3, 6),
                });
              }
            } else {
              b.vy = g.powered ? POWER_BOUNCE : BOUNCE_VY;
              SFX.bounce();
            }

            g.combo = 0;
            // Bounce particles
            for (let i = 0; i < 3; i++) {
              g.particles.push({
                x: b.x + BUNNY_W / 2 + randFloat(-10, 10),
                y: b.y + BUNNY_H,
                vx: randFloat(-1, 1), vy: randFloat(1, 3),
                life: 15, color: g.powered ? "#ffd54f" : p.color, size: randFloat(2, 4),
              });
            }
            break;
          }
        }
      }

      // ── Spike collision (separate from platform landing) ──
      // Spikes sit on top of the platform center — bunny must touch the spike itself
      for (const p of g.platforms) {
        if (!p.hasSpike || p.fallen) continue;
        const screenY = p.y - g.camera;
        const spikeX = p.x + p.w / 2 - 8;
        const spikeY = screenY - 18;
        const spikeW = 16;
        const spikeH = 18;
        if (
          b.x + BUNNY_W > spikeX + 2 &&
          b.x < spikeX + spikeW - 2 &&
          b.y + BUNNY_H > spikeY + 4 &&
          b.y < spikeY + spikeH
        ) {
          if (g.shielded) {
            // Shield absorbs the spike!
            p.hasSpike = false;
            g.shielded = false;
            g.shieldTimer = 0;
            g.invincible = 30; // brief invincibility after shield break
            SFX.crumble();
            for (let i = 0; i < 8; i++) {
              g.particles.push({
                x: spikeX + spikeW / 2, y: spikeY + spikeH / 2,
                vx: randFloat(-3, 3), vy: randFloat(-3, 2),
                life: 20, color: "#ffa726", size: randFloat(3, 6),
              });
            }
          } else if (g.invincible <= 0 && !g.powered) {
            SFX.spike();
            setTimeout(() => SFX.gameOver(), 300);
            g.alive = false;
            const sc = Math.floor(g.maxHeight / 10);
            setFinalScore(sc);
            setHighScore((h) => Math.max(h, sc));
            const img = captureScreenshot(sc, Math.floor(g.maxHeight / 2000));
            setScreenshot(img);
            setScreen("over");
            return;
          }
        }
      }

      // ── Carrot collection ──
      for (const c of g.carrots) {
        if (c.collected) continue;
        const cy = c.y - g.camera;
        if (
          b.x + BUNNY_W > c.x && b.x < c.x + 20 &&
          b.y + BUNNY_H > cy && b.y < cy + 20
        ) {
          c.collected = true;
          if (c.type === "golden") {
            // Golden carrot — spike immunity shield
            g.shielded = true;
            g.shieldTimer = 400;
            g.score += 30;
            SFX.shield();
            for (let i = 0; i < 10; i++) {
              g.particles.push({
                x: c.x + 10, y: cy + 10,
                vx: randFloat(-3, 3), vy: randFloat(-3, 3),
                life: 30, color: "#ffa726", size: randFloat(3, 7),
              });
            }
          } else if (c.type === "gold") {
            g.powered = true;
            g.powerTimer = 200;
            g.score += 50;
            SFX.star();
            for (let i = 0; i < 8; i++) {
              g.particles.push({
                x: c.x + 10, y: cy + 10,
                vx: randFloat(-3, 3), vy: randFloat(-3, 3),
                life: 25, color: "#ffd54f", size: randFloat(3, 6),
              });
            }
          } else {
            g.score += 10;
            SFX.carrot();
            for (let i = 0; i < 4; i++) {
              g.particles.push({
                x: c.x + 10, y: cy + 10,
                vx: randFloat(-2, 2), vy: randFloat(-2, 1),
                life: 15, color: "#ff7043", size: randFloat(2, 4),
              });
            }
          }
        }
      }

      // ── Power timer ──
      if (g.powered) {
        g.powerTimer--;
        if (g.powerTimer <= 0) g.powered = false;
      }
      if (g.shielded) {
        g.shieldTimer--;
        if (g.shieldTimer <= 0) g.shielded = false;
      }
      if (g.invincible > 0) g.invincible--;
      if (g.abilityCooldown > 0) g.abilityCooldown--;

      // ── Camera: follow bunny upward ──
      const bunnyScreenY = b.y;
      if (bunnyScreenY < H * 0.35) {
        const diff = H * 0.35 - bunnyScreenY;
        g.camera -= diff;
        b.y += diff;
        // move everything with camera
      }

      // Track max height
      const absHeight = -g.camera + (H - b.y);
      if (absHeight > g.maxHeight) g.maxHeight = absHeight;

      // Difficulty
      g.difficulty = Math.floor(g.maxHeight / 800);

      // Costume upgrades
      const newCostume = Math.floor(g.maxHeight / 2000);
      if (newCostume !== costume) setCostume(newCostume);

      // ── Generate new platforms above ──
      while (g.highestPlatY - g.camera > -100) {
        const gap = randInt(55, 85 + Math.min(g.difficulty * 3, 30));
        const newY = g.highestPlatY - gap;
        const plat = makePlatform(newY, g.difficulty);
        
        // Enforce spike spacing — at least 250px apart
        if (plat.hasSpike && Math.abs(newY - g.lastSpikeY) < 250) {
          plat.hasSpike = false;
        }
        if (plat.hasSpike) g.lastSpikeY = newY;
        
        // Enforce spring spacing — at least 350px apart
        if (plat.hasSpring && Math.abs(newY - g.lastSpringY) < 350) {
          plat.hasSpring = false;
        }
        if (plat.hasSpring) g.lastSpringY = newY;
        
        g.platforms.push(plat);
        if (Math.random() < 0.35) g.carrots.push(makeCarrot(plat));
        g.highestPlatY = newY;
      }

      // ── Clean offscreen stuff ──
      g.platforms = g.platforms.filter((p) => (p.y - g.camera < H + 50) && !(p.fallen && p.y - g.camera > H));
      g.carrots = g.carrots.filter((c) => !c.collected && c.y - g.camera < H + 50);

      // ── Fall off bottom = death ──
      if (b.y > H + 50) {
        g.alive = false;
        SFX.gameOver();
        const sc = Math.floor(g.maxHeight / 10);
        setFinalScore(sc);
        setHighScore((h) => Math.max(h, sc));
        const img = captureScreenshot(sc, Math.floor(g.maxHeight / 2000));
        setScreenshot(img);
        setScreen("over");
        return;
      }

      // ── Particles ──
      g.particles = g.particles.filter((p) => {
        p.x += p.vx; p.y += p.vy; p.life--;
        return p.life > 0;
      });

      // ══════════ DRAW ══════════
      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      const heightNorm = Math.min(g.maxHeight / 10000, 1);
      if (heightNorm < 0.3) {
        skyGrad.addColorStop(0, "#87ceeb");
        skyGrad.addColorStop(1, "#e1f5fe");
      } else if (heightNorm < 0.6) {
        skyGrad.addColorStop(0, "#5c6bc0");
        skyGrad.addColorStop(1, "#b39ddb");
      } else {
        skyGrad.addColorStop(0, "#1a237e");
        skyGrad.addColorStop(1, "#4a148c");
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Stars at high altitude
      if (heightNorm > 0.4) {
        ctx.fillStyle = "#fff";
        for (let i = 0; i < 20; i++) {
          const sx = (i * 97 + g.camera * 0.02) % W;
          const sy = (i * 53 + i * i * 7) % H;
          ctx.globalAlpha = 0.3 + (heightNorm - 0.4) * 0.8;
          ctx.beginPath();
          ctx.arc(sx, sy, 1 + (i % 2), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // Clouds
      ctx.font = "24px serif";
      for (let i = 0; i < 5; i++) {
        const cx = (i * 120 + g.camera * 0.05) % (W + 80) - 40;
        const cy = (i * 170 + 30) % H;
        ctx.globalAlpha = 0.3;
        ctx.fillText("☁️", cx, cy);
      }
      ctx.globalAlpha = 1;

      // ── Ground ──
      const groundScreenY = (H - 40) - g.camera;
      if (groundScreenY < H + 20) {
        // Dirt
        ctx.fillStyle = "#5d4037";
        ctx.fillRect(0, groundScreenY, W, H - groundScreenY + 50);
        // Grass top
        ctx.fillStyle = "#66bb6a";
        ctx.fillRect(0, groundScreenY - 4, W, 8);
        // Grass detail
        ctx.fillStyle = "#81c784";
        for (let i = 0; i < 20; i++) {
          ctx.fillRect(i * 20 + 3, groundScreenY - 6, 4, 6);
        }
        // Dark line
        ctx.fillStyle = "#4e342e";
        ctx.fillRect(0, groundScreenY + 4, W, 2);
      }

      // ── Platforms ──
      for (const p of g.platforms) {
        const py = p.y - g.camera;
        if (py < -60 || py > H + 30) continue;

        ctx.save();

        // Crumble shake effect
        if (p.crumbling && !p.fallen) {
          const shake = (Math.random() - 0.5) * 4;
          ctx.translate(shake, 0);
          ctx.globalAlpha = 1 - (p.crumbleTimer / 20);
        }
        if (p.fallen) {
          ctx.globalAlpha = Math.max(0, 1 - p.fallVy * 0.05);
        }

        // Platform body
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.roundRect(p.x, py, p.w, 12, 6);
        ctx.fill();

        // Crumble crack lines
        if (p.type === "crumble") {
          ctx.strokeStyle = "rgba(0,0,0,0.2)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x + 10, py + 2);
          ctx.lineTo(p.x + 18, py + 10);
          ctx.moveTo(p.x + p.w - 15, py + 1);
          ctx.lineTo(p.x + p.w - 20, py + 8);
          ctx.moveTo(p.x + p.w / 2 - 3, py + 3);
          ctx.lineTo(p.x + p.w / 2 + 2, py + 11);
          ctx.stroke();
          // Dashed edge
          ctx.strokeStyle = "rgba(0,0,0,0.08)";
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.roundRect(p.x + 1, py + 1, p.w - 2, 10, 5);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          // Highlight (non-crumble only)
          ctx.fillStyle = "rgba(255,255,255,0.25)";
          ctx.beginPath();
          ctx.roundRect(p.x + 3, py + 1, p.w - 6, 4, 3);
          ctx.fill();
        }

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.1)";
        ctx.beginPath();
        ctx.roundRect(p.x + 2, py + 10, p.w - 4, 4, 2);
        ctx.fill();

        // Spike indicator
        if (p.hasSpike) {
          const sx = p.x + p.w / 2;
          // Draw a visible red spike triangle
          ctx.fillStyle = "#e53935";
          ctx.beginPath();
          ctx.moveTo(sx, py - 16);
          ctx.lineTo(sx - 8, py);
          ctx.lineTo(sx + 8, py);
          ctx.fill();
          // Highlight
          ctx.fillStyle = "#ff8a80";
          ctx.beginPath();
          ctx.moveTo(sx, py - 13);
          ctx.lineTo(sx - 4, py - 2);
          ctx.lineTo(sx + 1, py - 2);
          ctx.fill();
          // Warning glow
          ctx.shadowColor = "#ff1744";
          ctx.shadowBlur = 8;
          ctx.fillStyle = "#e53935";
          ctx.beginPath();
          ctx.moveTo(sx, py - 16);
          ctx.lineTo(sx - 8, py);
          ctx.lineTo(sx + 8, py);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Spring!
        if (p.hasSpring) {
          const sx = p.x + p.w / 2;
          
          // Calculate spring height based on animation phase
          let springH = 16;
          let coilSpread = 6;
          let topPadY = py - springH - 5;
          
          if (p.springPhase === "compress") {
            // Squish down — spring compresses
            const t = p.springAnim / 12;
            springH = 6 + t * 10;
            coilSpread = 3 + t * 3;
            topPadY = py - springH - 2;
          } else if (p.springPhase === "extend") {
            // Launch up — spring extends past rest position
            const t = p.springAnim / 15;
            springH = 26 - t * 10;
            coilSpread = 8 - t * 2;
            topPadY = py - springH - 5;
          }
          
          // Black base block
          ctx.fillStyle = "#212121";
          ctx.beginPath();
          ctx.roundRect(sx - 8, py - 3, 16, 6, 2);
          ctx.fill();
          
          // Coil — animated zigzag
          ctx.strokeStyle = "#bdbdbd";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(sx, py - 3);
          for (let i = 1; i <= 5; i++) {
            const ct = i / 5;
            const yy = py - 3 - springH * ct;
            const xOff = (i % 2 === 0 ? -coilSpread : coilSpread);
            ctx.lineTo(sx + xOff, yy);
          }
          ctx.lineTo(sx, topPadY + 7);
          ctx.stroke();
          
          // Darker coil outline
          ctx.strokeStyle = "#616161";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(sx, py - 3);
          for (let i = 1; i <= 5; i++) {
            const ct = i / 5;
            const yy = py - 3 - springH * ct;
            const xOff = (i % 2 === 0 ? -coilSpread : coilSpread);
            ctx.lineTo(sx + xOff, yy);
          }
          ctx.lineTo(sx, topPadY + 7);
          ctx.stroke();
          
          // Brown top pad
          ctx.fillStyle = "#795548";
          ctx.beginPath();
          ctx.roundRect(sx - 10, topPadY, 20, 7, 3);
          ctx.fill();
          // Top pad highlight
          ctx.fillStyle = "#a1887f";
          ctx.beginPath();
          ctx.roundRect(sx - 7, topPadY + 1, 14, 3, 2);
          ctx.fill();
          
          // Flash effect on extend
          if (p.springPhase === "extend" && p.springAnim > 10) {
            ctx.fillStyle = "rgba(255,255,255,0.3)";
            ctx.beginPath();
            ctx.arc(sx, topPadY, 12, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Moving indicator
        if (p.isMoving) {
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.font = "8px sans-serif";
          ctx.fillText("◀▶", p.x + p.w / 2 - 8, py + 10);
        }

        ctx.restore();
      }

      // ── Carrots ──
      for (const c of g.carrots) {
        if (c.collected) continue;
        const cy = c.y - g.camera;
        if (cy < -30 || cy > H + 30) continue;
        // Reset state for each carrot
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#000";
        if (c.type === "golden") {
          // Golden carrot — orange/gold pulsing glow
          const pulse = 0.6 + Math.sin(g.frameCount * 0.08) * 0.4;
          ctx.shadowColor = "#ff8f00";
          ctx.shadowBlur = 14 * pulse;
          // Draw a golden circle behind it
          ctx.fillStyle = `rgba(255,143,0,${0.2 * pulse})`;
          ctx.beginPath();
          ctx.arc(c.x + 9, cy + 8, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#000";
          ctx.font = "20px serif";
          ctx.fillText("🥕", c.x - 1, cy + 17);
          // Big shield icon above the carrot
          ctx.shadowBlur = 0;
          ctx.shadowColor = "transparent";
          ctx.font = "22px serif";
          ctx.fillText("🛡️", c.x - 2, cy - 6);
        } else if (c.type === "gold") {
          ctx.shadowColor = "#ffd54f";
          ctx.shadowBlur = 10;
          ctx.font = "18px serif";
          ctx.fillText(c.emoji, c.x, cy + 16);
        } else {
          // Subtle backdrop so carrot is visible against light sky
          ctx.fillStyle = "rgba(0,0,0,0.12)";
          ctx.beginPath();
          ctx.arc(c.x + 9, cy + 8, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#000";
          ctx.font = "18px serif";
          ctx.fillText(c.emoji, c.x, cy + 16);
        }
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
      }

      // ── Bunny ──
      const cData = getCostume(costume);
      if (g.powered) {
        ctx.shadowColor = "#ffd54f";
        ctx.shadowBlur = 18;
        // Glow circle
        ctx.fillStyle = "rgba(255,213,79,0.15)";
        ctx.beginPath();
        ctx.arc(b.x + BUNNY_W / 2, b.y + BUNNY_H / 2, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // Shield bubble
      if (g.shielded) {
        const shieldPulse = 0.5 + Math.sin(g.frameCount * 0.06) * 0.3;
        ctx.strokeStyle = `rgba(255,143,0,${0.5 + shieldPulse * 0.3})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(b.x + BUNNY_W / 2, b.y + BUNNY_H / 2, 22 + shieldPulse * 3, 0, Math.PI * 2);
        ctx.stroke();
        // Inner glow
        ctx.fillStyle = `rgba(255,167,38,${0.06 + shieldPulse * 0.04})`;
        ctx.beginPath();
        ctx.arc(b.x + BUNNY_W / 2, b.y + BUNNY_H / 2, 20 + shieldPulse * 3, 0, Math.PI * 2);
        ctx.fill();
        // Shield icon floating above
        ctx.font = "12px serif";
        ctx.fillText("🛡️", b.x + BUNNY_W / 2 - 6, b.y - 10);
      }
      // Flash when invincible
      const bFlash = g.invincible > 0 && Math.floor(g.invincible / 4) % 2 === 0;
      if (!bFlash) {
        drawBunny(ctx, b.x, b.y, b.facing, costume, g.powered, g.frameCount);
      }

      // Direction arrow indicator above bunny
      if (inputRef.current !== 0) {
        ctx.globalAlpha = 0.5;
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        ctx.fillText(inputRef.current === -1 ? "◀" : "▶", b.x + BUNNY_W / 2, b.y - 8);
        ctx.textAlign = "left";
        ctx.globalAlpha = 1;
      }

      // Trail when powered
      if (g.powered && b.vy < 0) {
        ctx.globalAlpha = 0.3;
        ctx.font = "18px serif";
        ctx.fillText("✨", b.x + randFloat(-5, 5), b.y + BUNNY_H + 10);
        ctx.fillText("✨", b.x + BUNNY_W / 2 + randFloat(-5, 5), b.y + BUNNY_H + 20);
        ctx.globalAlpha = 1;
      }

      // ── Particles ──
      for (const p of g.particles) {
        ctx.globalAlpha = p.life / 25;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.life / 25), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ── HUD ──
      const score = Math.floor(g.maxHeight / 10);

      // Height score — top center
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.roundRect(W / 2 - 50, 10, 100, 36, 16);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 24px 'Nunito', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${score}m`, W / 2, 36);
      ctx.textAlign = "left";

      // Carrot score — top left
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.roundRect(10, 10, 90, 36, 16);
      ctx.fill();
      ctx.font = "bold 16px 'Nunito', sans-serif";
      ctx.fillStyle = "#ffd54f";
      ctx.fillText(`🥕 ${g.score}`, 22, 34);

      // Level — top right
      const levelNum = costume + 1;
      const levelText = `Level ${levelNum}`;
      ctx.font = "bold 16px 'Nunito', sans-serif";
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      const lvW = ctx.measureText(levelText).width + 24;
      ctx.roundRect(W - 10 - lvW, 10, lvW, 36, 16);
      ctx.fill();
      ctx.fillStyle = "#ce93d8";
      ctx.textAlign = "right";
      ctx.fillText(levelText, W - 20, 34);
      ctx.textAlign = "left";

      // Power bar centered under score
      if (g.powered) {
        const bw = (g.powerTimer / 200) * 80;
        ctx.fillStyle = "rgba(255,213,79,0.25)";
        ctx.beginPath();
        ctx.roundRect(W / 2 - 40, 52, 80, 6, 3);
        ctx.fill();
        ctx.fillStyle = "#ffd54f";
        ctx.beginPath();
        ctx.roundRect(W / 2 - 40, 52, bw, 6, 3);
        ctx.fill();
      }

      // Shield bar
      if (g.shielded) {
        const sy = g.powered ? 62 : 52;
        const sw = (g.shieldTimer / 400) * 80;
        ctx.fillStyle = "rgba(255,143,0,0.25)";
        ctx.beginPath();
        ctx.roundRect(W / 2 - 40, sy, 80, 6, 3);
        ctx.fill();
        ctx.fillStyle = "#ffa726";
        ctx.beginPath();
        ctx.roundRect(W / 2 - 40, sy, sw, 6, 3);
        ctx.fill();
        // Small shield icon
        ctx.font = "8px serif";
        ctx.fillText("🛡️", W / 2 - 52, sy + 6);
      }

      // ── Ability buttons at bottom ──
      const canAfford = g.score >= 200;
      const btnY = H - 58;
      const btnH = 46;
      const btnW = 105;
      const btnGap = 14;
      const totalBtnsW = btnW * 2 + btnGap;
      const btn1X = W / 2 - totalBtnsW / 2;
      const btn2X = btn1X + btnW + btnGap;

      // Shield button
      ctx.fillStyle = canAfford ? "#ff8f00" : "rgba(80,80,80,0.5)";
      ctx.beginPath();
      ctx.roundRect(btn1X, btnY, btnW, btnH, 14);
      ctx.fill();
      ctx.textAlign = "center";
      ctx.globalAlpha = canAfford ? 1 : 0.4;
      ctx.font = "22px serif";
      ctx.fillStyle = "#fff";
      ctx.fillText("🛡️", btn1X + btnW / 2, btnY + 22);
      ctx.font = "bold 11px 'Nunito', sans-serif";
      ctx.fillStyle = canAfford ? "#fff" : "rgba(255,255,255,0.5)";
      ctx.fillText("SHIELD", btn1X + btnW / 2, btnY + 38);
      ctx.globalAlpha = 1;

      // Platform button
      ctx.fillStyle = canAfford ? "#43a047" : "rgba(80,80,80,0.5)";
      ctx.beginPath();
      ctx.roundRect(btn2X, btnY, btnW, btnH, 14);
      ctx.fill();
      ctx.globalAlpha = canAfford ? 1 : 0.4;
      ctx.font = "22px serif";
      ctx.fillStyle = "#fff";
      ctx.fillText("🪨", btn2X + btnW / 2, btnY + 22);
      ctx.font = "bold 11px 'Nunito', sans-serif";
      ctx.fillStyle = canAfford ? "#fff" : "rgba(255,255,255,0.5)";
      ctx.fillText("PLATFORM", btn2X + btnW / 2, btnY + 38);
      ctx.globalAlpha = 1;
      ctx.textAlign = "left";

      // Store button coords for click detection
      g._btn1 = { x: btn1X, y: btnY, w: btnW, h: btnH };
      g._btn2 = { x: btn2X, y: btnY, w: btnW, h: btnH };

      // Left/Right touch indicators
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = "#fff";
      ctx.font = "36px sans-serif";
      ctx.fillText("◀", 14, H - 80);
      ctx.textAlign = "right";
      ctx.fillText("▶", W - 14, H - 80);
      ctx.textAlign = "left";
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [screen, costume]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1117",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Nunito', sans-serif",
      padding: 10,
      userSelect: "none",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@600;700;800&display=swap" rel="stylesheet" />

      {screen === "play" && (
        <div style={{ position: "relative", maxWidth: "100%" }}>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onMouseDown={handlePointerDown}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchEnd={handlePointerUp}
            style={{
              borderRadius: 18,
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
              cursor: "pointer",
              maxWidth: "100%",
              touchAction: "none",
              display: "block",
            }}
          />

          {/* X button — bottom right corner */}
          {!paused && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const g = gameRef.current;
                if (g) g.paused = true;
                setPaused(true);
              }}
              style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "none",
                background: "rgba(0,0,0,0.3)",
                color: "rgba(255,255,255,0.6)",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              ✕
            </button>
          )}

          {/* Pause/Exit overlay */}
          {paused && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                borderRadius: 18,
                background: "rgba(0,0,0,0.7)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                zIndex: 20,
              }}
            >
              <div style={{
                color: "#fff",
                fontSize: 28,
                fontFamily: "'Lilita One', sans-serif",
                letterSpacing: 1,
              }}>
                PAUSED
              </div>
              <button
                onClick={() => {
                  const g = gameRef.current;
                  if (g) g.paused = false;
                  setPaused(false);
                }}
                style={{
                  padding: "14px 48px",
                  fontSize: 18,
                  fontFamily: "'Lilita One', sans-serif",
                  border: "none",
                  borderRadius: 50,
                  cursor: "pointer",
                  background: "linear-gradient(135deg, #66bb6a, #43a047)",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(102,187,106,0.4)",
                  letterSpacing: 1,
                }}
              >
                CONTINUE
              </button>
              <button
                onClick={() => {
                  const g = gameRef.current;
                  if (g) {
                    g.alive = false;
                    g.paused = false;
                  }
                  setPaused(false);
                  setScreen("menu");
                }}
                style={{
                  padding: "12px 40px",
                  fontSize: 15,
                  fontFamily: "'Lilita One', sans-serif",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 50,
                  cursor: "pointer",
                  background: "transparent",
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: 1,
                }}
              >
                EXIT
              </button>
            </div>
          )}
        </div>
      )}

      {screen === "menu" && (
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ animation: "hop 1s ease-in-out infinite", width: 100, height: 100 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 512 512">
              <defs>
                <linearGradient id="msky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#87CEEB"/>
                  <stop offset="100%" stopColor="#E1F5FE"/>
                </linearGradient>
                <linearGradient id="mground" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#66BB6A"/>
                  <stop offset="100%" stopColor="#43A047"/>
                </linearGradient>
              </defs>
              <rect width="512" height="512" rx="100" fill="url(#msky)"/>
              <ellipse cx="90" cy="100" rx="50" ry="25" fill="white" opacity="0.4"/>
              <ellipse cx="400" cy="130" rx="55" ry="22" fill="white" opacity="0.3"/>
              <rect x="100" y="360" width="312" height="24" rx="12" fill="url(#mground)"/>
              <rect x="108" y="362" width="296" height="8" rx="4" fill="#81C784" opacity="0.5"/>
              <ellipse cx="256" cy="358" rx="45" ry="10" fill="rgba(0,0,0,0.1)"/>
              <ellipse cx="256" cy="290" rx="55" ry="62" fill="#F8BBD0"/>
              <ellipse cx="256" cy="305" rx="35" ry="42" fill="#FCE4EC"/>
              <circle cx="256" cy="220" r="48" fill="#F8BBD0"/>
              <ellipse cx="228" cy="135" rx="18" ry="55" transform="rotate(-8 228 135)" fill="#F48FB1"/>
              <ellipse cx="228" cy="138" rx="10" ry="38" transform="rotate(-8 228 138)" fill="#FCE4EC"/>
              <ellipse cx="284" cy="130" rx="18" ry="55" transform="rotate(8 284 130)" fill="#F48FB1"/>
              <ellipse cx="284" cy="133" rx="10" ry="38" transform="rotate(8 284 133)" fill="#FCE4EC"/>
              <ellipse cx="272" cy="210" rx="18" ry="20" fill="white"/>
              <ellipse cx="240" cy="212" rx="14" ry="16" fill="white"/>
              <circle cx="276" cy="212" r="10" fill="#333"/>
              <circle cx="243" cy="214" r="8" fill="#333"/>
              <circle cx="280" cy="207" r="4" fill="white"/>
              <circle cx="246" cy="209" r="3" fill="white"/>
              <ellipse cx="260" cy="232" rx="6" ry="4.5" fill="#F48FB1"/>
              <ellipse cx="230" cy="350" rx="22" ry="12" transform="rotate(-10 230 350)" fill="#F48FB1"/>
              <ellipse cx="282" cy="350" rx="22" ry="12" transform="rotate(10 282 350)" fill="#F48FB1"/>
              <circle cx="205" cy="295" r="16" fill="white"/>
              <g transform="translate(380, 220) rotate(15)">
                <polygon points="0,0 -12,45 12,45" fill="#FF7043"/>
                <line x1="-2" y1="-5" x2="-8" y2="-20" stroke="#66BB6A" strokeWidth="3" strokeLinecap="round"/>
                <line x1="2" y1="-5" x2="8" y2="-22" stroke="#66BB6A" strokeWidth="3" strokeLinecap="round"/>
                <line x1="0" y1="-5" x2="0" y2="-24" stroke="#81C784" strokeWidth="3" strokeLinecap="round"/>
              </g>
            </svg>
          </div>
          <h1 style={{
            fontSize: 40, margin: 0, fontFamily: "'Lilita One', sans-serif",
            background: "linear-gradient(135deg, #66bb6a, #81d4fa, #ffd54f)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Bunny Climb
          </h1>
          <p style={{ color: "#8b949e", fontSize: 14, maxWidth: 300, margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
            Hop from platform to platform and climb as high as you can! Tap left or right to steer. Don't fall!
          </p>
          <div style={{
            display: "flex", gap: 12, color: "#8b949e", fontSize: 12, fontWeight: 700, flexWrap: "wrap", justifyContent: "center",
          }}>
            <span>🥕 +10pts</span>
            <span>⭐ Power jump</span>
            <span style={{ color: "#ffa726" }}>🥕🛡️ Shield</span>
            <span style={{ color: "#76ff03" }}>🟢 Spring</span>
            <span style={{ color: "#bcaaa4" }}>⚠️ Crumble</span>
            <span>🔺 Danger!</span>
          </div>
          <div style={{
            background: "rgba(255,213,79,0.08)", border: "1px solid rgba(255,213,79,0.15)",
            borderRadius: 12, padding: "8px 14px", maxWidth: 300,
            color: "#ffd54f", fontSize: 11, fontWeight: 700,
            fontFamily: "'Nunito', sans-serif", lineHeight: 1.5,
          }}>
            💡 Collect 200 🥕 to use abilities! Tap 🛡️ Shield for spike immunity or 🪨 Platform to save yourself from falling. Each use costs 200 carrots.
          </div>
          {highScore > 0 && (
            <div style={{ color: "#ffd54f", fontSize: 16, fontWeight: 800 }}>
              🏆 Best: {highScore}m
            </div>
          )}
          <button onClick={startGame} style={{
            padding: "16px 56px", fontSize: 22, fontFamily: "'Lilita One', sans-serif",
            border: "none", borderRadius: 50, cursor: "pointer",
            background: "linear-gradient(135deg, #66bb6a, #43a047)",
            color: "#fff", boxShadow: "0 4px 24px rgba(102,187,106,0.4)",
            letterSpacing: 1, marginTop: 4,
          }}>
            HOP!
          </button>
          <div style={{ color: "#484f58", fontSize: 11, marginTop: 2 }}>
            ← → or tap left/right to move
          </div>
        </div>
      )}

      {screen === "over" && (
        <div style={{
          textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
          width: "100%", maxWidth: 380,
        }}>
          {/* Large screenshot as background card */}
          {screenshot && (
            <div style={{
              position: "relative",
              width: "100%",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <img
                src={screenshot}
                alt="Game Over"
                style={{
                  width: "100%",
                  display: "block",
                  borderRadius: 20,
                }}
              />

              {/* Overlay content on the image */}
              <div style={{
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                padding: "24px 16px 18px",
                background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
                borderRadius: "0 0 20px 20px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
              }}>
                {finalScore >= highScore && finalScore > 0 && (
                  <div style={{
                    color: "#ffd54f", fontSize: 14, fontWeight: 800,
                    fontFamily: "'Nunito', sans-serif",
                    animation: "hop 0.5s ease",
                  }}>
                    🏆 NEW RECORD!
                  </div>
                )}

                {/* Big ONE MORE HOP button */}
                <button onClick={startGame} style={{
                  padding: "16px 52px", fontSize: 22, fontFamily: "'Lilita One', sans-serif",
                  border: "none", borderRadius: 50, cursor: "pointer",
                  background: "linear-gradient(135deg, #ef5350, #c62828)",
                  color: "#fff", boxShadow: "0 6px 24px rgba(239,83,80,0.5)",
                  letterSpacing: 1, width: "85%",
                }}>
                  ONE MORE HOP
                </button>

                {/* Share buttons row */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                  <button
                    onClick={() => {
                      const text = `🐰 I climbed ${finalScore}m in Bunny Climb! Can you beat my score? 🥕`;
                      const url = window.location.href;
                      window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                        "_blank"
                      );
                    }}
                    style={{
                      padding: "7px 14px", fontSize: 12, fontFamily: "'Nunito', sans-serif", fontWeight: 700,
                      border: "none", borderRadius: 10, cursor: "pointer",
                      background: "#000", color: "#fff",
                    }}
                  >
                    𝕏
                  </button>
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      const quote = `🐰 I climbed ${finalScore}m in Bunny Climb! Can you beat my score? 🥕`;
                      window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(quote)}`,
                        "_blank",
                        "width=600,height=400"
                      );
                    }}
                    style={{
                      padding: "7px 14px", fontSize: 12, fontFamily: "'Nunito', sans-serif", fontWeight: 700,
                      border: "none", borderRadius: 10, cursor: "pointer",
                      background: "#1877f2", color: "#fff",
                    }}
                  >
                    f Facebook
                  </button>
                  <button
                    onClick={() => {
                      const text = `🐰 I climbed ${finalScore}m in Bunny Climb! Can you beat my score? 🥕\n${window.location.href}`;
                      const showToast = (msg) => {
                        const el = document.getElementById("copy-toast");
                        if (el) { el.textContent = msg; el.style.opacity = 1; setTimeout(() => { el.style.opacity = 0; }, 2500); }
                      };
                      try {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          navigator.clipboard.writeText(text).then(() => {
                            showToast("Copied! Paste on Instagram, Stories, or anywhere!");
                          }).catch(() => prompt("Copy to share on Instagram:", text));
                        } else { prompt("Copy to share on Instagram:", text); }
                      } catch (e) { prompt("Copy to share on Instagram:", text); }
                    }}
                    style={{
                      padding: "7px 14px", fontSize: 12, fontFamily: "'Nunito', sans-serif", fontWeight: 700,
                      border: "none", borderRadius: 10, cursor: "pointer",
                      background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                      color: "#fff",
                    }}
                  >
                    📷 Instagram
                  </button>
                </div>
                <div id="copy-toast" style={{
                  color: "#66bb6a", fontSize: 11, fontWeight: 700,
                  fontFamily: "'Nunito', sans-serif",
                  opacity: 0, transition: "opacity 0.3s ease",
                }}>
                  Copied!
                </div>
              </div>
            </div>
          )}

          {/* Save to Photos button below the card */}
          {screenshot && (
            <button
              onClick={async () => {
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (isMobile) {
                  // On mobile — try share with image (save to photos option appears)
                  try {
                    const res = await fetch(screenshot);
                    const blob = await res.blob();
                    const file = new File([blob], `bunny-climb-${finalScore}m.png`, { type: "image/png" });
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                      await navigator.share({ files: [file], title: "Bunny Climb" });
                      return;
                    }
                  } catch (e) {}
                  // Fallback — open image in new tab so they can long-press to save
                  window.open(screenshot, "_blank");
                } else {
                  // Desktop — normal download
                  try {
                    const link = document.createElement("a");
                    link.href = screenshot;
                    link.download = `bunny-climb-${finalScore}m.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } catch (e) {
                    window.open(screenshot, "_blank");
                  }
                }
              }}
              style={{
                padding: "10px 28px", fontSize: 14, fontFamily: "'Nunito', sans-serif", fontWeight: 700,
                border: "none", borderRadius: 50, cursor: "pointer",
                background: "rgba(255,255,255,0.08)", color: "#8b949e",
                marginTop: 12, letterSpacing: 0.5,
              }}
            >
              📸 Save to Photos
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes hop {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
      `}</style>
    </div>
  );
}
