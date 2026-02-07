// stage4-race.js - ステージ4: バイクレース

import { drawScore, ParticleSystem } from './ui.js';
import { hikari } from './hikari.js';
import { HIKARI_REACTIONS } from './data.js';
import { sfxJump, sfxStar, sfxPoopStep, startBGM, stopBGM } from './audio.js';

const GRAVITY = 800;
const JUMP_POWER = -350;
const HIGH_JUMP = -500;
const GROUND_Y_RATIO = 0.75;
const SCROLL_SPEED = 200;
const COURSE_LENGTH = 6000;

export class Stage4Race {
  constructor(game) {
    this.game = game;
    this.score = 0;
    this.distance = 0;
    this.speed = SCROLL_SPEED;
    this.groundY = game.ch * GROUND_Y_RATIO;
    this.particles = new ParticleSystem();
    this.cleared = false;
    this.message = '';
    this.messageTimer = 0;

    // プレイヤー
    this.playerX = game.cw * 0.2;
    this.playerY = this.groundY;
    this.vy = 0;
    this.isOnGround = true;
    this.isHolding = false;
    this.holdTime = 0;

    // 障害物・アイテム
    this.objects = [];
    this.generateCourse();

    // 背景
    this.bgPhase = 0; // 0:草原 1:山 2:空 3:虹
    this.bgColors = [
      ['#87CEEB', '#228B22'], // 草原
      ['#4682B4', '#8B7355'], // 山
      ['#1E90FF', '#87CEFA'], // 空
      ['#FF69B4', '#DDA0DD'], // 虹
    ];

    startBGM(4);
    this.showMessage(HIKARI_REACTIONS.stage4.start);
  }

  generateCourse() {
    let x = 400;
    while (x < COURSE_LENGTH) {
      const r = Math.random();
      if (r < 0.25) {
        this.objects.push({ type: 'star', x, y: this.groundY - 80 - Math.random() * 100, emoji: '⭐', size: 30 });
      } else if (r < 0.4) {
        this.objects.push({ type: 'poop', x, y: this.groundY - 20, emoji: '💩', size: 30 });
      } else if (r < 0.55) {
        this.objects.push({ type: 'mountain', x, y: this.groundY - 60, emoji: '⛰️', size: 50 });
      } else if (r < 0.65) {
        this.objects.push({ type: 'cloud', x, y: this.groundY - 180 - Math.random() * 60, emoji: '☁️', size: 40 });
      } else if (r < 0.72) {
        this.objects.push({ type: 'rainbow', x, y: this.groundY - 120, emoji: '🌈', size: 50 });
        // 虹ゾーンに星を配置
        for (let i = 1; i <= 5; i++) {
          this.objects.push({ type: 'star', x: x + i * 40, y: this.groundY - 140 - Math.random() * 40, emoji: '⭐', size: 25 });
        }
      }
      x += 100 + Math.random() * 150;
    }
    // ゴール
    this.objects.push({ type: 'goal', x: COURSE_LENGTH, y: this.groundY - 40, emoji: '🏁', size: 60 });
  }

  update(dt) {
    if (this.cleared) return;
    this.particles.update(dt);
    if (this.messageTimer > 0) this.messageTimer -= dt;

    // 長押し
    if (this.isHolding && this.isOnGround) {
      this.holdTime += dt;
    }

    // 移動
    this.distance += this.speed * dt;

    // 背景フェーズ
    this.bgPhase = Math.min(3, Math.floor(this.distance / (COURSE_LENGTH / 4)));

    // 重力
    if (!this.isOnGround) {
      this.vy += GRAVITY * dt;
      this.playerY += this.vy * dt;
      if (this.playerY >= this.groundY) {
        this.playerY = this.groundY;
        this.vy = 0;
        this.isOnGround = true;
      }
    }

    // 当たり判定
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const obj = this.objects[i];
      const screenX = obj.x - this.distance + this.playerX;
      if (screenX < -60 || screenX > this.game.cw + 60) continue;

      const dx = this.playerX - screenX;
      const dy = this.playerY - obj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < obj.size + 20) {
        if (obj.type === 'star') {
          sfxStar();
          this.score += 10;
          this.particles.emit(screenX, obj.y, 5, {
            emojis: ['⭐', '✨'], spread: 80, size: 15,
          });
          this.objects.splice(i, 1);
        } else if (obj.type === 'poop' && this.isOnGround) {
          sfxPoopStep();
          this.speed = Math.max(100, this.speed - 30);
          this.showMessage(HIKARI_REACTIONS.stage4.poop);
          hikari.setExpression('😱');
          setTimeout(() => { this.speed = SCROLL_SPEED; hikari.setExpression('😊'); }, 1500);
          this.objects.splice(i, 1);
        } else if (obj.type === 'goal') {
          this.cleared = true;
          this.showMessage(HIKARI_REACTIONS.stage4.goal);
          stopBGM();
        } else if (obj.type === 'mountain' && this.isOnGround) {
          // 山にぶつかったら少し戻る
          this.distance -= 20;
        }
      }
    }
  }

  draw(ctx) {
    const { cw, ch } = this.game;
    // 背景
    const [skyC, groundC] = this.bgColors[this.bgPhase];
    ctx.fillStyle = skyC;
    ctx.fillRect(0, 0, cw, this.groundY);
    ctx.fillStyle = groundC;
    ctx.fillRect(0, this.groundY, cw, ch - this.groundY);

    // オブジェクト
    for (const obj of this.objects) {
      const screenX = obj.x - this.distance + this.playerX;
      if (screenX < -60 || screenX > cw + 60) continue;
      ctx.font = `${obj.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obj.emoji, screenX, obj.y);
    }

    // プレイヤー（バイクひかりちゃん）
    ctx.font = '40px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const bikeEmoji = this.isOnGround ? '🏍️' : '🕊️';
    ctx.fillText(bikeEmoji, this.playerX, this.playerY);
    ctx.font = '25px serif';
    ctx.fillText('👧', this.playerX, this.playerY - 30);
    // 飛行中のキラキラ
    if (!this.isOnGround) {
      this.particles.emit(this.playerX - 20, this.playerY + 10, 1, {
        emojis: ['✨'], spread: 20, size: 12,
      });
    }

    this.particles.draw(ctx);

    // UI
    drawScore(ctx, this.score, cw);

    // 距離バー
    const ratio = Math.min(1, this.distance / COURSE_LENGTH);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    roundRect(ctx, 10, 10, cw * 0.5, 20, 10);
    ctx.fill();
    ctx.fillStyle = '#4CAF50';
    roundRect(ctx, 10, 10, Math.max(20, cw * 0.5 * ratio), 20, 10);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🏁 ${Math.floor(ratio * 100)}%`, 18, 20);

    hikari.drawWithBubble(ctx, 50, ch - 50, 30, this.messageTimer > 0 ? this.message : null);

    if (this.cleared) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#87CEEB';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏍️ ゴール！ 🏁', cw / 2, ch / 2 - 20);
      ctx.font = '20px sans-serif';
      ctx.fillText(`⭐ スコア: ${this.score}`, cw / 2, ch / 2 + 20);
    }
  }

  onClick(x, y) {
    if (this.cleared) {
      this.game.completeStage(4);
      return;
    }
    if (this.isOnGround) {
      this.jump(false);
    }
  }

  onDragStart() {
    this.isHolding = true;
    this.holdTime = 0;
  }

  onDragEnd() {
    if (this.isHolding && this.isOnGround) {
      this.jump(this.holdTime > 0.2);
    }
    this.isHolding = false;
  }

  jump(high) {
    sfxJump();
    this.vy = high ? HIGH_JUMP : JUMP_POWER;
    this.isOnGround = false;
  }

  showMessage(msg) {
    this.message = msg;
    this.messageTimer = 2;
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
