// hikari.js - ひかりちゃんのキャラクター管理

import { drawSprite } from './sprites.js';

export class Hikari {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.size = 40;
    this.sparkleTimer = 0;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  // 互換性のため残す（何もしない）
  setExpression() {}
  setCostume() {}

  draw(ctx, x, y, size) {
    const drawX = x ?? this.x;
    const drawY = y ?? this.y;
    const drawSize = size ?? this.size;

    drawSprite(ctx, 'hikari', drawX, drawY, drawSize);

    // キラキラエフェクト
    this.sparkleTimer += 0.1;
    const sparkles = ['sparkle', 'star', 'swirl-star'];
    const sparkle = sparkles[Math.floor(this.sparkleTimer) % sparkles.length];
    const sSize = drawSize * 0.4;
    const offX = Math.sin(this.sparkleTimer * 2) * drawSize * 0.5;
    const offY = Math.cos(this.sparkleTimer * 3) * drawSize * 0.3;
    drawSprite(ctx, sparkle, drawX + offX, drawY - drawSize * 0.5 + offY, sSize);
  }

  drawWithBubble(ctx, x, y, size, text) {
    this.draw(ctx, x, y, size);
    if (!text) return;

    // 吹き出し
    const bubbleX = x;
    const bubbleY = y - size * 1.2;
    ctx.font = `${Math.max(14, size * 0.35)}px sans-serif`;
    const metrics = ctx.measureText(text);
    const padX = 12;
    const padY = 8;
    const bw = metrics.width + padX * 2;
    const bh = size * 0.45 + padY * 2;

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.strokeStyle = '#FF69B4';
    ctx.lineWidth = 2;
    roundRect(ctx, bubbleX - bw / 2, bubbleY - bh / 2, bw, bh, 10);
    ctx.fill();
    ctx.stroke();

    // しっぽ
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.moveTo(bubbleX - 5, bubbleY + bh / 2);
    ctx.lineTo(bubbleX + 5, bubbleY + bh / 2);
    ctx.lineTo(bubbleX, bubbleY + bh / 2 + 10);
    ctx.fill();

    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bubbleX, bubbleY);
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

export const hikari = new Hikari();
