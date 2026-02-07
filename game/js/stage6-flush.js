// stage6-flush.js - ステージ6: 最後に全部流す（フィナーレ）

import { drawButton, isInRect, ParticleSystem } from './ui.js';
import { hikari } from './hikari.js';
import { HIKARI_REACTIONS } from './data.js';
import { sfxFlush, sfxTap, startBGM, stopBGM } from './audio.js';

export class Stage6Flush {
  constructor(game) {
    this.game = game;
    this.particles = new ParticleSystem();
    this.message = '';
    this.messageTimer = 0;
    this.cleared = false;

    this.flushCount = 0;
    this.flushGoal = 50;
    this.phase = 'flush'; // flush | collapse | clear

    // 浮遊アイテム
    this.floatingItems = [];
    this.spawnFloatingItems();

    // トイレ
    this.toiletY = 0;
    this.waterLevel = 0;
    this.shakeTimer = 0;

    startBGM(6);
    this.showMessage(HIKARI_REACTIONS.stage6.start);
  }

  spawnFloatingItems() {
    const { cw, ch } = this.game;
    const emojis = ['💩', '🪱', '💄', '⭐', '💰', '🔪', '🏍️', '👻', '💣', '🌈', '☁️', '🎰'];
    for (let i = 0; i < 30; i++) {
      this.floatingItems.push({
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: Math.random() * cw,
        y: Math.random() * (ch * 0.6) + 50,
        size: 20 + Math.random() * 25,
        vx: (Math.random() - 0.5) * 30,
        vy: 0,
        phase: Math.random() * Math.PI * 2,
        flushed: false,
      });
    }
  }

  update(dt) {
    if (this.cleared) return;
    this.particles.update(dt);
    if (this.messageTimer > 0) this.messageTimer -= dt;
    if (this.shakeTimer > 0) this.shakeTimer -= dt;

    const { cw, ch } = this.game;

    if (this.phase === 'flush') {
      // 浮遊アイテムの動き
      for (const item of this.floatingItems) {
        if (item.flushed) {
          // 流される動き（中央下に向かって渦巻き）
          const centerX = cw / 2;
          const centerY = ch * 0.85;
          const dx = centerX - item.x;
          const dy = centerY - item.y;
          item.x += dx * dt * 2;
          item.y += dy * dt * 2;
          item.phase += dt * 10; // 渦巻き回転
          item.x += Math.sin(item.phase) * 30 * dt;
          item.size *= (1 - dt * 0.5);
        } else {
          item.phase += dt;
          item.x += item.vx * dt + Math.sin(item.phase) * 10 * dt;
          item.y += Math.sin(item.phase * 0.7) * 5 * dt;
        }
      }
      // 小さくなったアイテムを削除
      this.floatingItems = this.floatingItems.filter(i => i.size > 3);

      if (this.floatingItems.every(i => i.flushed || i.size <= 3) && this.flushCount >= this.flushGoal) {
        this.phase = 'collapse';
        this.collapseTimer = 3;
      }
    } else if (this.phase === 'collapse') {
      this.collapseTimer -= dt;
      if (this.collapseTimer <= 0) {
        this.phase = 'clear';
        this.cleared = true;
        this.showMessage(HIKARI_REACTIONS.stage6.done);
        stopBGM();
      }
    }
  }

  draw(ctx) {
    const { cw, ch } = this.game;

    // 画面シェイク
    if (this.shakeTimer > 0) {
      ctx.save();
      ctx.translate(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      );
    }

    // 背景
    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0, '#87CEEB');
    grad.addColorStop(1, '#B0E0E6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    if (this.phase === 'collapse') {
      // 崩壊演出
      const progress = 1 - this.collapseTimer / 3;
      ctx.fillStyle = `rgba(255,255,255,${progress})`;
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ゲームの世界が崩壊していく…！', cw / 2, ch * 0.4);
      hikari.drawWithBubble(ctx, cw / 2, ch * 0.6, 50, '帰れる！元の世界に帰れるよ！');
    } else if (this.phase === 'clear') {
      ctx.fillStyle = '#FFF';
      ctx.fillRect(0, 0, cw, ch);
      this.particles.draw(ctx);
      ctx.fillStyle = '#FF69B4';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚽 全部流した！ 🌊', cw / 2, ch / 2);
    } else {
      // 浮遊アイテム
      for (const item of this.floatingItems) {
        if (item.size < 3) continue;
        ctx.font = `${item.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = item.flushed ? Math.max(0.2, item.size / 20) : 1;
        ctx.fillText(item.emoji, item.x, item.y);
      }
      ctx.globalAlpha = 1;

      // トイレ
      ctx.font = '80px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚽', cw / 2, ch * 0.85);

      // 水エフェクト
      if (this.shakeTimer > 0) {
        ctx.fillStyle = 'rgba(100,180,255,0.3)';
        ctx.beginPath();
        ctx.arc(cw / 2, ch * 0.85, 60 + this.shakeTimer * 40, 0, Math.PI * 2);
        ctx.fill();
      }

      // 流すボタン
      const btnW = 200, btnH = 55;
      const pulse = 1 + Math.sin(Date.now() / 200) * 0.05;
      ctx.save();
      ctx.translate(cw / 2, ch * 0.7);
      ctx.scale(pulse, pulse);
      drawButton(ctx, '🌊 流す！！', -btnW / 2, -btnH / 2, btnW, btnH, '#4169E1');
      ctx.restore();
      this._flushBtnRect = [cw / 2 - btnW / 2, ch * 0.7 - btnH / 2, btnW, btnH];

      // プログレス
      const ratio = Math.min(1, this.flushCount / this.flushGoal);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      roundRect(ctx, cw * 0.15, 55, cw * 0.7, 16, 8);
      ctx.fill();
      ctx.fillStyle = '#4169E1';
      roundRect(ctx, cw * 0.15, 55, Math.max(16, cw * 0.7 * ratio), 16, 8);
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.flushCount} / ${this.flushGoal} 連打！`, cw / 2, 63);
    }

    this.particles.draw(ctx);
    if (this.phase === 'flush') {
      hikari.drawWithBubble(ctx, 50, ch - 50, 30, this.messageTimer > 0 ? this.message : null);
    }

    if (this.shakeTimer > 0) ctx.restore();
  }

  onClick(x, y) {
    if (this.cleared) {
      this.game.completeStage(6);
      return;
    }
    if (this.phase !== 'flush') return;

    if (this._flushBtnRect && isInRect(x, y, ...this._flushBtnRect)) {
      this.flushCount++;
      this.shakeTimer = 0.15;
      sfxFlush();

      // ランダムにアイテムを流す
      const unflushed = this.floatingItems.filter(i => !i.flushed);
      if (unflushed.length > 0) {
        const n = Math.min(3, unflushed.length);
        for (let i = 0; i < n; i++) {
          const idx = Math.floor(Math.random() * unflushed.length);
          unflushed[idx].flushed = true;
          unflushed.splice(idx, 1);
        }
      }

      this.particles.emit(this.game.cw / 2, this.game.ch * 0.85, 5, {
        emojis: ['💧', '🌊', '💦'], spread: 120, size: 20, upward: 100,
      });

      if (this.flushCount % 10 === 0) {
        this.showMessage(HIKARI_REACTIONS.stage6.flushing);
      }
    }
  }

  showMessage(msg) {
    this.message = msg;
    this.messageTimer = 1.5;
  }

  cleanup() { stopBGM(); }
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
