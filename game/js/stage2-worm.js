// stage2-worm.js - ステージ2: ミミズ切り

import { drawCounter, ParticleSystem } from './ui.js';
import { hikari } from './hikari.js';
import { HIKARI_REACTIONS } from './data.js';
import { sfxSlash, startBGM, stopBGM } from './audio.js';
import { drawSprite } from './sprites.js';

export class Stage2Worm {
  constructor(game) {
    this.game = game;
    this.count = 0;
    this.goal = 100;
    this.worms = [];
    this.particles = new ParticleSystem();
    this.message = '';
    this.messageTimer = 0;
    this.cleared = false;
    this.slashTrail = [];
    this.isDragging = false;
    this.timer = 0;
    startBGM(2);
    this.spawnInitialWorms();
  }

  spawnInitialWorms() {
    const { cw, ch } = this.game;
    for (let i = 0; i < 8; i++) {
      this.spawnWorm(
        50 + Math.random() * (cw - 100),
        100 + Math.random() * (ch - 200),
        30 + Math.random() * 20
      );
    }
  }

  spawnWorm(x, y, size) {
    if (size < 10) return;
    this.worms.push({
      x, y, size,
      vx: (Math.random() - 0.5) * 60,
      vy: (Math.random() - 0.5) * 60,
      phase: Math.random() * Math.PI * 2,
      segments: Math.max(3, Math.floor(size / 5)),
    });
  }

  update(dt) {
    if (this.cleared) return;
    this.timer += dt;
    this.particles.update(dt);
    if (this.messageTimer > 0) this.messageTimer -= dt;

    const { cw, ch } = this.game;
    for (const w of this.worms) {
      w.phase += dt * 3;
      w.x += w.vx * dt;
      w.y += w.vy * dt;
      if (w.x < 20 || w.x > cw - 20) w.vx *= -1;
      if (w.y < 60 || w.y > ch - 60) w.vy *= -1;
      w.x = Math.max(20, Math.min(cw - 20, w.x));
      w.y = Math.max(60, Math.min(ch - 60, w.y));
    }

    for (let i = this.slashTrail.length - 1; i >= 0; i--) {
      this.slashTrail[i].life -= dt * 3;
      if (this.slashTrail[i].life <= 0) this.slashTrail.splice(i, 1);
    }

    if (this.worms.length > 50) {
      this.worms.sort((a, b) => a.size - b.size);
      this.worms.splice(0, this.worms.length - 40);
    }

    if (this.count >= 50 && !this._said50) {
      this._said50 = true;
      this.showMessage(HIKARI_REACTIONS.stage2[50]);
    }
    if (this.worms.length > 30 && !this._saidMany) {
      this._saidMany = true;
      this.showMessage('うわーー！ミミズだらけ！');
    }
  }

  draw(ctx) {
    const { cw, ch } = this.game;
    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0, '#2E5A1E');
    grad.addColorStop(1, '#1A3510');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    // スラッシュトレイル
    for (const s of this.slashTrail) {
      ctx.strokeStyle = `rgba(255,255,100,${s.life})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    }

    // ミミズ描画
    for (const w of this.worms) {
      this.drawWorm(ctx, w);
    }

    this.particles.draw(ctx);
    drawCounter(ctx, this.count, this.goal, 'きった', cw);
    hikari.drawWithBubble(ctx, 50, ch - 60, 40, this.messageTimer > 0 ? this.message : null);

    if (this.cleared) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#90EE90';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ステージクリア！', cw / 2, ch / 2);
    }
  }

  drawWorm(ctx, w) {
    const segSize = w.size / w.segments;
    for (let i = 0; i < w.segments; i++) {
      const t = i / w.segments;
      const ox = Math.sin(w.phase + i * 0.8) * w.size * 0.3;
      const sx = w.x + ox;
      const sy = w.y + i * segSize;
      const radius = segSize * 0.5 * (1 - t * 0.3);

      ctx.fillStyle = i === 0 ? '#D2691E' : '#8B4513';
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    // 頭スプライト
    drawSprite(ctx, 'worm-head', w.x, w.y, Math.max(8, w.size * 0.3));
  }

  onClick(x, y) {
    if (this.cleared) {
      this.game.completeStage(2);
      return;
    }
    this.trySlash(x, y);
  }

  onDragStart(x, y) {
    this.isDragging = true;
    this._lastDrag = { x, y };
  }

  onDragMove(x, y) {
    if (!this.isDragging || this.cleared) return;
    if (this._lastDrag) {
      this.slashTrail.push({
        x1: this._lastDrag.x, y1: this._lastDrag.y,
        x2: x, y2: y, life: 1,
      });
    }
    this.trySlash(x, y);
    this._lastDrag = { x, y };
  }

  onDragEnd() {
    this.isDragging = false;
    this._lastDrag = null;
  }

  trySlash(x, y) {
    for (let i = this.worms.length - 1; i >= 0; i--) {
      const w = this.worms[i];
      const dx = x - w.x;
      const dy = y - w.y;
      if (dx * dx + dy * dy < (w.size * 1.2) ** 2) {
        sfxSlash();
        this.particles.emit(w.x, w.y, 5, {
          sprites: ['lightning', 'explosion'], spread: 100, size: 20,
        });
        const newSize = w.size * 0.7;
        this.worms.splice(i, 1);
        this.spawnWorm(w.x - 15, w.y, newSize);
        this.spawnWorm(w.x + 15, w.y, newSize);
        this.count++;

        if (this.count >= this.goal) {
          this.cleared = true;
          this.showMessage(HIKARI_REACTIONS.stage2[100]);
          stopBGM();
        }
        return;
      }
    }
  }

  showMessage(msg) {
    this.message = msg;
    this.messageTimer = 2.5;
  }

  cleanup() { stopBGM(); }
}
