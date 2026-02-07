// stage9-fart.js - ステージ9: おなら宇宙飛行

import { ParticleSystem } from './ui.js';
import { hikari } from './hikari.js';
import { HIKARI_REACTIONS } from './data.js';
import { sfxFart, sfxCollect, sfxBomb, sfxStar, startBGM, stopBGM } from './audio.js';
import { drawSprite } from './sprites.js';

const GRAVITY = 280;       // 重力（px/s²）
const FART_POWER = -320;   // おなら噴射力（上向き）
const MAX_SPEED_DOWN = 350;
const MAX_SPEED_UP = -400;
const GOAL_ALTITUDE = 2000; // ゴール高度（m）
const ALTITUDE_SCALE = 0.5; // 1px = 0.5m

export class Stage9Fart {
  constructor(game) {
    this.game = game;
    this.particles = new ParticleSystem();
    this.message = '';
    this.messageTimer = 0;
    this.cleared = false;
    this.gameOver = false;
    this.timer = 0;

    // プレイヤー
    this.playerX = game.cw / 2;
    this.playerY = game.ch * 0.7;
    this.velocityY = 0;
    this.altitude = 0; // 累積高度（メートル）
    this.hp = 3;
    this.score = 0;
    this.invincible = 0; // 無敵時間

    // おなら演出
    this.fartClouds = [];
    this.fartCooldown = 0;

    // 障害物・アイテム
    this.objects = [];
    this.spawnTimer = 0;
    this.spawnInterval = 1.2;

    // 背景の星
    this.bgStars = [];
    for (let i = 0; i < 60; i++) {
      this.bgStars.push({
        x: Math.random() * game.cw,
        y: Math.random() * game.ch,
        size: 1 + Math.random() * 2,
        speed: 20 + Math.random() * 40,
        alpha: 0.3 + Math.random() * 0.7,
      });
    }

    // UFOボーナス
    this.ufoTimer = 0;
    this.ufo = null;

    startBGM(9);
    this.showMessage(HIKARI_REACTIONS.stage9.start);
  }

  update(dt) {
    if (this.cleared || this.gameOver) return;
    this.timer += dt;
    this.particles.update(dt);
    if (this.messageTimer > 0) this.messageTimer -= dt;
    if (this.invincible > 0) this.invincible -= dt;
    if (this.fartCooldown > 0) this.fartCooldown -= dt;

    // 重力
    this.velocityY += GRAVITY * dt;
    this.velocityY = Math.max(MAX_SPEED_UP, Math.min(MAX_SPEED_DOWN, this.velocityY));

    // 上昇中 = 高度が増加
    if (this.velocityY < 0) {
      this.altitude += Math.abs(this.velocityY) * dt * ALTITUDE_SCALE;
    }

    // プレイヤー位置（画面中央付近に固定、背景がスクロール）
    this.playerY += this.velocityY * dt;
    const { ch } = this.game;

    // 画面下限（地面）
    if (this.playerY > ch * 0.85) {
      this.playerY = ch * 0.85;
      this.velocityY = 0;
    }
    // 画面上限
    if (this.playerY < ch * 0.15) {
      this.playerY = ch * 0.15;
      this.velocityY = 0;
      this.altitude += 200 * dt * ALTITUDE_SCALE; // 天井にいる間も高度上昇
    }

    // おなら雲の更新
    for (const cloud of this.fartClouds) {
      cloud.y += cloud.vy * dt;
      cloud.life -= dt;
      cloud.size *= 1.01;
    }
    this.fartClouds = this.fartClouds.filter(c => c.life > 0);

    // 背景星スクロール
    const scrollSpeed = this.velocityY < 0 ? Math.abs(this.velocityY) * 0.3 : -this.velocityY * 0.1;
    for (const star of this.bgStars) {
      star.y += scrollSpeed * dt * (star.speed / 40);
      if (star.y > ch) {
        star.y = -5;
        star.x = Math.random() * this.game.cw;
      }
      if (star.y < -5) {
        star.y = ch + 5;
        star.x = Math.random() * this.game.cw;
      }
    }

    // オブジェクトスポーン
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnInterval = Math.max(0.4, 1.2 - this.altitude / 5000);
      this.spawnObject();
    }

    // オブジェクト更新
    const { cw } = this.game;
    for (const obj of this.objects) {
      obj.y += obj.vy * dt;
      obj.x += obj.vx * dt;
      // 横ループ
      if (obj.x < -30) obj.x = cw + 30;
      if (obj.x > cw + 30) obj.x = -30;
    }
    this.objects = this.objects.filter(o => o.y > -50 && o.y < ch + 50);

    // UFO
    this.ufoTimer += dt;
    if (!this.ufo && this.ufoTimer > 15 && Math.random() < 0.005) {
      this.ufo = {
        x: -40,
        y: ch * 0.2 + Math.random() * ch * 0.3,
        vx: 60 + Math.random() * 40,
      };
      this.ufoTimer = 0;
    }
    if (this.ufo) {
      this.ufo.x += this.ufo.vx * dt;
      if (this.ufo.x > cw + 50) this.ufo = null;
    }

    // 当たり判定
    this.checkCollisions();

    // ゴール判定
    if (this.altitude >= GOAL_ALTITUDE) {
      this.cleared = true;
      this.showMessage(HIKARI_REACTIONS.stage9.clear);
      stopBGM();
    }

    // セリフ
    if (!this.cleared) {
      const pct = this.altitude / GOAL_ALTITUDE;
      if (pct > 0.25 && pct < 0.27) this.showMessage(HIKARI_REACTIONS.stage9.quarter);
      if (pct > 0.5 && pct < 0.52) this.showMessage(HIKARI_REACTIONS.stage9.half);
      if (pct > 0.8 && pct < 0.82) this.showMessage(HIKARI_REACTIONS.stage9.almost);
    }
  }

  spawnObject() {
    const { cw, ch } = this.game;
    const x = 30 + Math.random() * (cw - 60);
    const roll = Math.random();

    if (roll < 0.35) {
      // 星（スコア）
      this.objects.push({
        type: 'star', sprite: 'star',
        x, y: -20,
        vx: (Math.random() - 0.5) * 30,
        vy: 80 + Math.random() * 60 + this.altitude * 0.02,
        size: 24, hitR: 15,
      });
    } else if (roll < 0.6) {
      // 隕石
      this.objects.push({
        type: 'meteorite', sprite: 'meteorite',
        x, y: -30,
        vx: (Math.random() - 0.5) * 50,
        vy: 100 + Math.random() * 80 + this.altitude * 0.03,
        size: 30, hitR: 18,
      });
    } else if (roll < 0.8) {
      // うんこ隕石
      this.objects.push({
        type: 'poop', sprite: 'poop',
        x, y: -20,
        vx: (Math.random() - 0.5) * 40,
        vy: 70 + Math.random() * 50,
        size: 26, hitR: 14,
      });
    } else {
      // ハート（回復）
      this.objects.push({
        type: 'heart', sprite: 'heart',
        x, y: -20,
        vx: (Math.random() - 0.5) * 20,
        vy: 50 + Math.random() * 30,
        size: 22, hitR: 14,
      });
    }
  }

  checkCollisions() {
    const px = this.playerX;
    const py = this.playerY;
    const pr = 20; // プレイヤー当たり判定半径

    for (let i = this.objects.length - 1; i >= 0; i--) {
      const obj = this.objects[i];
      const dx = px - obj.x;
      const dy = py - obj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < pr + obj.hitR) {
        if (obj.type === 'star') {
          this.score += 10;
          sfxCollect();
          this.particles.emit(obj.x, obj.y, 5, {
            sprites: ['sparkle', 'star'], spread: 30, size: 15,
          });
          this.objects.splice(i, 1);
        } else if (obj.type === 'heart') {
          if (this.hp < 3) {
            this.hp++;
            sfxStar();
            this.showMessage('HP回復！');
          }
          this.particles.emit(obj.x, obj.y, 3, {
            sprites: ['heart'], spread: 20, size: 12,
          });
          this.objects.splice(i, 1);
        } else if (this.invincible <= 0) {
          // ダメージ
          this.hp--;
          this.invincible = 1.5;
          sfxBomb();
          this.particles.emit(obj.x, obj.y, 8, {
            sprites: ['sparkle'], spread: 40, size: 10,
          });

          if (obj.type === 'poop') {
            this.showMessage(HIKARI_REACTIONS.stage9.poop);
            // うんこヒット → 巨大おなら雲
            for (let j = 0; j < 5; j++) {
              this.fartClouds.push({
                x: px + (Math.random() - 0.5) * 40,
                y: py + 20 + Math.random() * 20,
                vy: 30 + Math.random() * 20,
                size: 20 + Math.random() * 20,
                life: 1.5,
              });
            }
          } else {
            this.showMessage(HIKARI_REACTIONS.stage9.hit);
          }

          this.objects.splice(i, 1);

          if (this.hp <= 0) {
            this.gameOver = true;
            this.showMessage(HIKARI_REACTIONS.stage9.lose);
            stopBGM();
          }
        }
      }
    }

    // UFO当たり判定
    if (this.ufo) {
      const dx = px - this.ufo.x;
      const dy = py - this.ufo.y;
      if (Math.sqrt(dx * dx + dy * dy) < pr + 25) {
        this.score += 50;
        sfxCollect();
        sfxStar();
        this.showMessage('UFOボーナス！+50点');
        this.particles.emit(this.ufo.x, this.ufo.y, 10, {
          sprites: ['sparkle', 'star', 'glow-star'], spread: 50, size: 20,
        });
        this.ufo = null;
      }
    }
  }

  draw(ctx) {
    const { cw, ch } = this.game;

    // 背景グラデーション（高度で変化: 青空→宇宙）
    const spaceRatio = Math.min(1, this.altitude / GOAL_ALTITUDE);
    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    if (spaceRatio < 0.3) {
      grad.addColorStop(0, '#4488CC');
      grad.addColorStop(1, '#88BBEE');
    } else if (spaceRatio < 0.7) {
      const r = (spaceRatio - 0.3) / 0.4;
      grad.addColorStop(0, lerpColor('#4488CC', '#0a0a2e', r));
      grad.addColorStop(1, lerpColor('#88BBEE', '#1a1a4e', r));
    } else {
      grad.addColorStop(0, '#0a0a2e');
      grad.addColorStop(0.5, '#0a001e');
      grad.addColorStop(1, '#1a0533');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    // 背景の星
    for (const star of this.bgStars) {
      ctx.globalAlpha = star.alpha * Math.min(1, spaceRatio * 2 + 0.2);
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ゴール付近で月を表示
    if (spaceRatio > 0.7) {
      const moonAlpha = (spaceRatio - 0.7) / 0.3;
      ctx.globalAlpha = moonAlpha;
      drawSprite(ctx, 'moon', cw * 0.75, ch * 0.12, 60);
      ctx.globalAlpha = 1;
    }

    // UFO
    if (this.ufo) {
      drawSprite(ctx, 'ufo', this.ufo.x, this.ufo.y, 40);
    }

    // オブジェクト
    for (const obj of this.objects) {
      drawSprite(ctx, obj.sprite, obj.x, obj.y, obj.size);
    }

    // おなら雲
    for (const cloud of this.fartClouds) {
      ctx.globalAlpha = Math.min(1, cloud.life);
      drawSprite(ctx, 'fart-cloud', cloud.x, cloud.y, cloud.size);
    }
    ctx.globalAlpha = 1;

    // プレイヤー（無敵時間は点滅）
    if (this.invincible <= 0 || Math.floor(this.invincible * 10) % 2 === 0) {
      // ヘルメット
      drawSprite(ctx, 'space-helmet', this.playerX, this.playerY - 5, 50);
      // ひかりちゃん
      hikari.draw(ctx, this.playerX, this.playerY, 40);
    }

    this.particles.draw(ctx);

    // ─── UI ───

    // 高度メーター（左側）
    const meterX = 20;
    const meterY = 60;
    const meterH = ch - 140;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(meterX, meterY, 12, meterH);
    const fillH = (this.altitude / GOAL_ALTITUDE) * meterH;
    const meterGrad = ctx.createLinearGradient(0, meterY + meterH, 0, meterY);
    meterGrad.addColorStop(0, '#44FF44');
    meterGrad.addColorStop(0.5, '#FFFF44');
    meterGrad.addColorStop(1, '#FF4444');
    ctx.fillStyle = meterGrad;
    ctx.fillRect(meterX, meterY + meterH - fillH, 12, fillH);
    // 月マーク（ゴール）
    drawSprite(ctx, 'moon', meterX + 6, meterY - 5, 16);
    // 高度テキスト
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${Math.floor(this.altitude)}m`, meterX + 18, meterY + meterH - fillH + 5);

    // HP（右上、ハート）
    for (let i = 0; i < 3; i++) {
      if (i < this.hp) {
        drawSprite(ctx, 'heart', cw - 30 - i * 28, 25, 20);
      } else {
        ctx.globalAlpha = 0.3;
        drawSprite(ctx, 'heart', cw - 30 - i * 28, 25, 20);
        ctx.globalAlpha = 1;
      }
    }

    // スコア
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    drawSprite(ctx, 'star', cw / 2 - 35, 22, 14);
    ctx.fillText(`${this.score}点`, cw / 2, 25);

    // ひかりちゃん + 吹き出し
    hikari.drawWithBubble(ctx, 60, ch - 50, 45, this.messageTimer > 0 ? this.message : null);

    // 操作説明
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('タップでおなら噴射！星を集めて月を目指せ！', cw / 2, ch - 15);

    // ─── ゲームオーバー ───
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#FF4444';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      drawSprite(ctx, 'meteorite', cw / 2 - 110, ch / 2 - 15, 28);
      ctx.fillText('墜落！', cw / 2, ch / 2 - 15);
      ctx.fillStyle = '#FFF';
      ctx.font = '16px sans-serif';
      ctx.fillText(`到達高度: ${Math.floor(this.altitude)}m`, cw / 2, ch / 2 + 20);
      ctx.fillText(`スコア: ${this.score}点`, cw / 2, ch / 2 + 45);
      ctx.font = '18px sans-serif';
      ctx.fillText('タップでやり直し', cw / 2, ch / 2 + 80);
    }

    // ─── クリア ───
    if (this.cleared) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#FFFACD';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      drawSprite(ctx, 'moon', cw / 2 - 100, ch / 2 - 15, 30);
      ctx.fillText('月に到着！', cw / 2, ch / 2 - 15);
      drawSprite(ctx, 'moon', cw / 2 + 100, ch / 2 - 15, 30);
      ctx.fillStyle = '#FFD700';
      ctx.font = '16px sans-serif';
      ctx.fillText(`スコア: ${this.score}点`, cw / 2, ch / 2 + 25);
      ctx.fillStyle = '#FFF';
      ctx.font = '18px sans-serif';
      ctx.fillText('タップで次へ', cw / 2, ch / 2 + 60);
    }
  }

  onClick(x, y) {
    if (this.cleared) {
      this.game.completeStage(9);
      return;
    }
    if (this.gameOver) {
      // リスタート
      this.gameOver = false;
      this.altitude = 0;
      this.score = 0;
      this.hp = 3;
      this.playerY = this.game.ch * 0.7;
      this.velocityY = 0;
      this.objects = [];
      this.fartClouds = [];
      this.invincible = 0;
      this.ufo = null;
      startBGM(9);
      this.showMessage(HIKARI_REACTIONS.stage9.start);
      return;
    }

    // おなら噴射！
    if (this.fartCooldown <= 0) {
      this.velocityY = FART_POWER;
      this.fartCooldown = 0.15;
      sfxFart();

      // おなら雲パーティクル
      for (let i = 0; i < 3; i++) {
        this.fartClouds.push({
          x: this.playerX + (Math.random() - 0.5) * 20,
          y: this.playerY + 25 + Math.random() * 10,
          vy: 40 + Math.random() * 30,
          size: 15 + Math.random() * 10,
          life: 0.8 + Math.random() * 0.4,
        });
      }

      // 通常パーティクル
      this.particles.emit(this.playerX, this.playerY + 20, 3, {
        sprites: ['fart-cloud'], spread: 25, size: 12,
      });
    }
  }

  showMessage(msg) {
    this.message = msg;
    this.messageTimer = 2;
  }

  cleanup() { stopBGM(); }
}

// 色補間ヘルパー
function lerpColor(c1, c2, t) {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
