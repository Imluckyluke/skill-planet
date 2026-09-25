import * as THREE from "three";

function makeCanvas(size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  return { c, ctx };
}

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toTexture(c: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 1x1 placeholder for server prerender (no `document` on the server). */
function fallbackTexture() {
  const tex = new THREE.DataTexture(
    new Uint8Array([255, 255, 255, 255]),
    1,
    1,
  );
  tex.needsUpdate = true;
  return tex;
}

/** Deep-blue oceans, green/tan continent clusters, white ice caps. */
export function makePlanetTexture(): THREE.CanvasTexture | THREE.DataTexture {
  if (typeof document === "undefined") return fallbackTexture();
  const { c, ctx } = makeCanvas(512);
  const ocean = ctx.createLinearGradient(0, 0, 0, 512);
  ocean.addColorStop(0, "#0a2470");
  ocean.addColorStop(0.5, "#14409b");
  ocean.addColorStop(1, "#0a2470");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, 512, 512);

  const rand = mulberry(7);
  for (let i = 0; i < 9; i++) {
    const cx = rand() * 512;
    const cy = 100 + rand() * 312;
    for (let j = 0; j < 26; j++) {
      const r = 8 + rand() * 26;
      const x = cx + (rand() - 0.5) * 130;
      const y = cy + (rand() - 0.5) * 90;
      const blob = ctx.createRadialGradient(x, y, 0, x, y, r);
      if (rand() > 0.4) {
        blob.addColorStop(0, "rgba(46, 170, 115, 0.95)");
        blob.addColorStop(1, "rgba(46, 170, 115, 0)");
      } else {
        blob.addColorStop(0, "rgba(150, 160, 105, 0.9)");
        blob.addColorStop(1, "rgba(150, 160, 105, 0)");
      }
      ctx.fillStyle = blob;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Ice caps
  const north = ctx.createLinearGradient(0, 0, 0, 46);
  north.addColorStop(0, "rgba(240, 248, 255, 0.95)");
  north.addColorStop(1, "rgba(240, 248, 255, 0)");
  ctx.fillStyle = north;
  ctx.fillRect(0, 0, 512, 46);
  const south = ctx.createLinearGradient(0, 466, 0, 512);
  south.addColorStop(0, "rgba(240, 248, 255, 0)");
  south.addColorStop(1, "rgba(240, 248, 255, 0.95)");
  ctx.fillStyle = south;
  ctx.fillRect(0, 466, 512, 46);

  return toTexture(c);
}

/** Soft white cloud swirls on transparency. */
export function makeCloudTexture(): THREE.CanvasTexture | THREE.DataTexture {
  if (typeof document === "undefined") return fallbackTexture();
  const { c, ctx } = makeCanvas(512);
  ctx.clearRect(0, 0, 512, 512);
  const rand = mulberry(21);
  for (let i = 0; i < 60; i++) {
    const x = rand() * 512;
    const y = rand() * 512;
    const r = 12 + rand() * 34;
    const puff = ctx.createRadialGradient(x, y, 0, x, y, r);
    puff.addColorStop(0, "rgba(255, 255, 255, 0.55)");
    puff.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = puff;
    ctx.beginPath();
    // Stretched horizontally for a windswept look
    ctx.ellipse(x, y, r * 1.8, r * 0.7, rand() * 0.6 - 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  return toTexture(c);
}

let glowCache: THREE.CanvasTexture | null = null;

let sunCache: THREE.CanvasTexture | null = null;

/** Hot white core melting into warm amber — no flat gradient disc. */
export function getSunTexture(): THREE.CanvasTexture | THREE.DataTexture {
  if (sunCache) return sunCache;
  if (typeof document === "undefined") return fallbackTexture();
  const { c, ctx } = makeCanvas(256);
  const rand = mulberry(99);
  // Warm falloff
  const fall = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  fall.addColorStop(0, "rgba(255, 252, 245, 1)");
  fall.addColorStop(0.18, "rgba(255, 244, 220, 1)");
  fall.addColorStop(0.38, "rgba(255, 214, 150, 0.85)");
  fall.addColorStop(0.62, "rgba(255, 160, 90, 0.28)");
  fall.addColorStop(1, "rgba(255, 140, 70, 0)");
  ctx.fillStyle = fall;
  ctx.fillRect(0, 0, 256, 256);
  // Granulation speckles so it doesn't read as vector art
  for (let i = 0; i < 900; i++) {
    const a = rand() * Math.PI * 2;
    const r = 12 + rand() * 78;
    const x = 128 + Math.cos(a) * r;
    const y = 128 + Math.sin(a) * r;
    const s = 0.6 + rand() * 1.8;
    ctx.fillStyle =
      rand() > 0.5 ? "rgba(255,255,255,0.10)" : "rgba(200,120,40,0.10)";
    ctx.fillRect(x, y, s, s);
  }
  sunCache = toTexture(c);
  return sunCache;
}

let streakCache: THREE.CanvasTexture | null = null;

/** Wide thin anamorphic streak: hot center fading sideways and vertically. */
export function getStreakTexture(): THREE.CanvasTexture | THREE.DataTexture {
  if (streakCache) return streakCache;
  if (typeof document === "undefined") return fallbackTexture();
  const w = 512;
  const h = 64;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  const rand = mulberry(5);
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const ny = (y / h - 0.5) * 2; // -1..1
    // Ultra-thin hot core plus a soft wide halo
    const vCore = Math.exp(-ny * ny * 60);
    const vHalo = Math.exp(-ny * ny * 9) * 0.32;
    for (let x = 0; x < w; x++) {
      const nx = (x / w - 0.5) * 2;
      const hFall = Math.exp(-nx * nx * 5);
      // Slight irregularity so it doesn't read as a vector bar
      const jitter = 0.92 + rand() * 0.08;
      const a = Math.max(0, Math.min(1, hFall * (vCore + vHalo) * jitter));
      // Warm center drifting cool toward the extremes (chromatic fringe)
      const edge = Math.abs(nx);
      const idx = (y * w + x) * 4;
      img.data[idx] = 255;
      img.data[idx + 1] = Math.round(244 - edge * 44);
      img.data[idx + 2] = Math.round(226 - edge * -20);
      img.data[idx + 3] = Math.round(a * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  // Faint horizontal scratches for an anamorphic imperfection
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 34; i++) {
    const y = rand() * h;
    const x = rand() * w * 0.5;
    const len = 40 + rand() * 200;
    ctx.fillRect(x, y, len, 1);
  }
  ctx.globalAlpha = 1;
  streakCache = toTexture(c);
  return streakCache;
}
/** Shared soft radial glow used by nebulae, sun and island halos. */
export function getGlowTexture(): THREE.CanvasTexture | THREE.DataTexture {
  if (glowCache) return glowCache;
  if (typeof document === "undefined") return fallbackTexture();
  const { c, ctx } = makeCanvas(256);
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255, 255, 255, 1)");
  g.addColorStop(0.35, "rgba(255, 255, 255, 0.45)");
  g.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  glowCache = toTexture(c);
  return glowCache;
}
