// stage1-poop.js - ステージ1: うんこ集め

import { drawCounter, ParticleSystem } from './ui.js';
import { hikari } from './hikari.js';
import { HIKARI_REACTIONS } from './data.js';
import { sfxCollect, sfxGolden, sfxBomb, startBGM, stopBGM } from './audio.js';

export class Stage1Poop {
  constructor(game) {
    this.game = game;
    this.count = 0;
    this.goal = 100;
    this.poops = [];
    this.spawnTimer = 0;
    this.spawnInterval = 0.5;
    this.particles = new ParticleSystem();
    this.message = '';
    this.messageTimer = 0;
    this.cleared = false;
    startBGM(1);
  }

  update(dt) {
    if (this.cleared) return;
    this.spawnTimer += dt;
    this.particles.update(dt);

    if (this.messageTimer > 0) this.messageTimer -= dt;

    // スポーン
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnPoop();
      // 時間経過でスピードアップ
      this.spawnInterval = Math.max(0.15, this.spawnInterval - 0.002);
    }

    // 落下
    const { ch } = this.game;
    for (let i = this.poops.length - 1; i >= 0; i--) {
      const p = this.poops[i];
      p.y += p.speed * dt;
      p.wobble += dt * 3;
      if (p.y > ch + 40) {
        this.poops.splice(i, 1);
      }
    }
  }

  spawnPoop() {
    const { cw } = this.game;
    const r = Math.random();
    let type = 'normal';
    let emoji = '💩';
    let value = 1;
    let size = 35 + Math.random() * 15;

    if (r < 0.05) {
      type = 'golden';
      emoji = '✨💩';
      value = 5;
      size = 45;
    } else if (r < 0.12) {
      type = 'bomb';
      emoji = '💣';
      value = -10;
      size = 35;
    }

    this.poops.push({
      x: 30 + Math.random() * (cw - 60),
      y: -40,
      speed: 80 + Math.random() * 120,
      size,
      emoji,
      type,
      value,
      wobble: Math.random() * Math.PI * 2,
    });
  }

  draw(ctx) {
    const { cw, ch } = this.game;
    // 背景
    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0, '#8B6914');
    grad.addColorStop(1, '#5A4510');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    // うんこ描画
    ctx.fillStyle = '#FFF';
    for (const p of this.poops) {
      ctx.font = `${p.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const ox = Math.sin(p.wobble) * 5;
      ctx.fillText(p.emoji, p.x + ox, p.y);
    }

    this.particles.draw(ctx);

    // カウンター
    drawCounter(ctx, this.count, this.goal, '💩 あつめた', cw);

    // ひかりちゃん
    hikari.drawWithBubble(ctx, 50, ch - 60, 40, this.messageTimer > 0 ? this.message : null);

    // クリア演出
    if (this.cleared) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💩 ステージクリア！ 💩', cw / 2, ch / 2);
    }
  }

  onClick(x, y) {
    if (this.cleared) {
      this.game.completeStage(1);
      return;
    }

    for (let i = this.poops.length - 1; i >= 0; i--) {
      const p = this.poops[i];
      const dx = x - p.x;
      const dy = y - p.y;
      if (dx * dx + dy * dy < (p.size * 0.8) ** 2) {
        this.poops.splice(i, 1);
        this.count = Math.max(0, this.count + p.value);

        if (p.type === 'bomb') {
          sfxBomb();
          this.particles.emit(p.x, p.y, 8, {
            emojis: ['💥', '🔥'], spread: 150, size: 25,
          });
          this.showMessage('💣 ドカーン！ -10');
        } else if (p.type === 'golden') {
          sfxGolden();
          this.particles.emit(p.x, p.y, 12, {
            emojis: ['✨', '⭐', '💫'], spread: 200, size: 20,
          });
          this.showMessage('✨ ゴールデンうんこ！ +5');
        } else {
          sfxCollect();
          this.particles.emit(p.x, p.y, 3, {
            emojis: ['💩'], spread: 80, size: 15,
          });
        }

        this.checkReactions();
        if (this.count >= this.goal) {
          this.cleared = true;
          stopBGM();
        }
        return;
      }
    }
  }

  checkReactions() {
    const r = HIKARI_REACTIONS.stage1;
    for (const [threshold, msg] of Object.entries(r)) {
      if (this.count === Number(threshold)) {
        this.showMessage(msg);
      }
    }
  }

  showMessage(msg) {
    this.message = msg;
    this.messageTimer = 2;
  }

  cleanup() { stopBGM(); }
}
