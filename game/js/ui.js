// ui.js - 共通UI（スコア/カウンター/演出）

import { drawSprite } from './sprites.js';

export function drawCounter(ctx, current, goal, label, cw) {
  const x = cw - 10;
  const y = 10;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  roundRect(ctx, x - 160, y, 160, 50, 12);
  ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(label, x - 10, y + 6);
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`${current} / ${goal}`, x - 10, y + 24);
  ctx.restore();
}

export function drawScore(ctx, score, cw) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  roundRect(ctx, cw - 170, 10, 160, 36, 12);
  ctx.fill();
  // 星スプライト
  drawSprite(ctx, 'star', cw - 152, 28, 18);
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(`${score}`, cw - 20, 16);
  ctx.restore();
}

export function drawProgressBar(ctx, ratio, x, y, w, h, color = '#FFD700') {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = color;
  const barW = Math.max(h, w * Math.min(1, ratio));
  roundRect(ctx, x, y, barW, h, h / 2);
  ctx.fill();
  ctx.restore();
}

export function drawCenterText(ctx, text, cw, ch, size = 48, color = '#FFF') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 6;
  ctx.fillText(text, cw / 2, ch / 2);
  ctx.restore();
}

export function drawButton(ctx, text, x, y, w, h, color = '#FF69B4') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFF';
  ctx.font = `bold ${Math.min(24, h * 0.5)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2);
  ctx.restore();
}

export function isInRect(px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

// パーティクルシステム
export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, count, options = {}) {
    const sprites = options.sprites || ['sparkle'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * (options.spread || 200),
        vy: (Math.random() - 0.5) * (options.spread || 200) - (options.upward || 0),
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        size: options.size || (10 + Math.random() * 20),
        sprite: sprites[Math.floor(Math.random() * sprites.length)],
        gravity: options.gravity || 0,
      });
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.vy += p.gravity * dt;
      p.y += p.vy * dt;
      p.life -= p.decay;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      drawSprite(ctx, p.sprite, p.x, p.y, p.size);
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.particles = [];
  }
}

// 画面遷移エフェクト
export class Transition {
  constructor() {
    this.active = false;
    this.progress = 0;
    this.fadeIn = false;
    this.callback = null;
  }

  start(callback) {
    this.active = true;
    this.progress = 0;
    this.fadeIn = false;
    this.callback = callback;
  }

  update(dt) {
    if (!this.active) return;
    if (!this.fadeIn) {
      this.progress += dt * 2;
      if (this.progress >= 1) {
        this.fadeIn = true;
        this.progress = 1;
        if (this.callback) this.callback();
      }
    } else {
      this.progress -= dt * 2;
      if (this.progress <= 0) {
        this.active = false;
        this.progress = 0;
      }
    }
  }

  draw(ctx, cw, ch) {
    if (!this.active) return;
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${Math.max(0, Math.min(1, this.progress))})`;
    ctx.fillRect(0, 0, cw, ch);
    ctx.restore();
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
