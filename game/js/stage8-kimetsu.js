// stage8-kimetsu.js - ステージ8: 鬼滅バトル（ターン制対戦）

import { drawButton, isInRect, ParticleSystem } from './ui.js';
import { hikari } from './hikari.js';
import { HIKARI_REACTIONS } from './data.js';
import { sfxSlash, sfxTap, sfxBomb, sfxCollect, sfxClear, startBGM, stopBGM } from './audio.js';
import { drawSprite } from './sprites.js';

const BREATH_TYPES = [
  { name: '水の呼吸', sprite: 'water-slash', power: 1.0, color: '#4488FF' },
  { name: '雷の呼吸', sprite: 'thunder-slash', power: 1.3, color: '#FFD700' },
  { name: '炎の呼吸', sprite: 'fire-slash', power: 1.5, color: '#FF4400' },
];

const ENEMIES = [
  { name: '雑魚鬼', sprite: 'demon', maxHp: 30, atk: 8 },
  { name: '手鬼', sprite: 'demon', maxHp: 50, atk: 12 },
  { name: '上弦の鬼', sprite: 'demon-boss', maxHp: 80, atk: 18 },
];

const TIMING_SPEED = 120; // 円が縮小する速度（px/s）
const TARGET_RADIUS = 40;
const PERFECT_RANGE = 8;
const GOOD_RANGE = 20;

export class Stage8Kimetsu {
  constructor(game) {
    this.game = game;
    this.particles = new ParticleSystem();
    this.message = '';
    this.messageTimer = 0;
    this.cleared = false;

    // プレイヤー
    this.playerHp = 100;
    this.playerMaxHp = 100;

    // 敵
    this.currentEnemyIndex = 0;
    this.enemy = this.createEnemy(0);

    // フェーズ
    this.phase = 'intro'; // intro | select | timing | damage | enemyAttack | defend | win | lose | cleared
    this.phaseTimer = 0;

    // タイミング
    this.timingRadius = 0;
    this.selectedBreath = -1;

    // ダメージ表示
    this.damageText = '';
    this.damageTimer = 0;
    this.damageX = 0;
    this.damageY = 0;

    // 防御
    this.defendWindow = 0;
    this.defendSuccess = false;

    // 斬撃エフェクト
    this.slashEffect = null;
    this.slashTimer = 0;

    // 敵攻撃エフェクト
    this.enemyAttackTimer = 0;

    startBGM(8);
    this.showMessage(HIKARI_REACTIONS.stage8.start);
    this.phaseTimer = 1.5;
  }

  createEnemy(index) {
    const e = ENEMIES[index];
    return { ...e, hp: e.maxHp };
  }

  update(dt) {
    if (this.cleared) return;
    this.particles.update(dt);
    if (this.messageTimer > 0) this.messageTimer -= dt;
    if (this.damageTimer > 0) this.damageTimer -= dt;

    if (this.phase === 'intro') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        this.phase = 'select';
      }
    } else if (this.phase === 'timing') {
      this.timingRadius -= TIMING_SPEED * dt;
      if (this.timingRadius <= 0) {
        // ミスった
        this.applyDamage(0);
      }
    } else if (this.phase === 'damage') {
      this.slashTimer -= dt;
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        if (this.enemy.hp <= 0) {
          this.phase = 'win';
          this.phaseTimer = 2;
          this.showMessage(HIKARI_REACTIONS.stage8.kill);
          this.particles.emit(this.game.cw * 0.65, this.game.ch * 0.4, 15, {
            sprites: ['sparkle', 'fire', 'star'], spread: 150, size: 25,
          });
        } else {
          this.phase = 'enemyAttack';
          this.phaseTimer = 1.0;
          this.enemyAttackTimer = 1.0;
          this.showMessage(HIKARI_REACTIONS.stage8.enemyAttack);
        }
      }
    } else if (this.phase === 'enemyAttack') {
      this.enemyAttackTimer -= dt;
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        this.phase = 'defend';
        this.defendWindow = 1.5;
        this.defendSuccess = false;
      }
    } else if (this.phase === 'defend') {
      this.defendWindow -= dt;
      if (this.defendWindow <= 0 && !this.defendSuccess) {
        // 防御失敗
        const dmg = this.enemy.atk;
        this.playerHp = Math.max(0, this.playerHp - dmg);
        this.showDamage(this.game.cw * 0.25, this.game.ch * 0.45, `-${dmg}`);
        sfxBomb();
        this.particles.emit(this.game.cw * 0.25, this.game.ch * 0.4, 6, {
          sprites: ['fire', 'explosion'], spread: 80, size: 18,
        });
        if (this.playerHp <= 0) {
          this.phase = 'lose';
          this.showMessage(HIKARI_REACTIONS.stage8.lose);
          stopBGM();
        } else {
          this.phase = 'select';
        }
      }
    } else if (this.phase === 'win') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        this.currentEnemyIndex++;
        if (this.currentEnemyIndex >= ENEMIES.length) {
          this.phase = 'cleared';
          this.cleared = true;
          this.showMessage(HIKARI_REACTIONS.stage8.clear);
          stopBGM();
        } else {
          this.enemy = this.createEnemy(this.currentEnemyIndex);
          this.phase = 'intro';
          this.phaseTimer = 1.5;
          this.showMessage(`次の鬼: ${this.enemy.name}！`);
          // 少しHP回復
          this.playerHp = Math.min(this.playerMaxHp, this.playerHp + 20);
        }
      }
    }
  }

  applyDamage(accuracy) {
    const breath = BREATH_TYPES[this.selectedBreath];
    let dmg = 0;
    let label = '';
    if (accuracy >= 2) {
      dmg = Math.floor(25 * breath.power);
      label = `完璧！ ${dmg}`;
    } else if (accuracy >= 1) {
      dmg = Math.floor(15 * breath.power);
      label = `良い！ ${dmg}`;
    } else {
      dmg = Math.floor(5 * breath.power);
      label = `ミス… ${dmg}`;
    }
    this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
    sfxSlash();

    this.slashEffect = breath.sprite;
    this.slashTimer = 0.6;
    this.showDamage(this.game.cw * 0.65, this.game.ch * 0.35, label);
    this.particles.emit(this.game.cw * 0.65, this.game.ch * 0.4, 8, {
      sprites: [breath.sprite, 'sparkle'], spread: 120, size: 20,
    });

    this.phase = 'damage';
    this.phaseTimer = 1.0;
  }

  showDamage(x, y, text) {
    this.damageText = text;
    this.damageX = x;
    this.damageY = y;
    this.damageTimer = 1.2;
  }

  draw(ctx) {
    const { cw, ch } = this.game;

    // 背景
    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0, '#0a001e');
    grad.addColorStop(0.5, '#1a0033');
    grad.addColorStop(1, '#330011');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    // 地面
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, ch * 0.7, cw, ch * 0.3);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, ch * 0.7);
    ctx.lineTo(cw, ch * 0.7);
    ctx.stroke();

    // 月
    ctx.fillStyle = 'rgba(255,220,150,0.15)';
    ctx.beginPath();
    ctx.arc(cw * 0.8, ch * 0.12, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,220,150,0.3)';
    ctx.beginPath();
    ctx.arc(cw * 0.8, ch * 0.12, 25, 0, Math.PI * 2);
    ctx.fill();

    // プレイヤー側
    drawSprite(ctx, 'tanjiro', cw * 0.25, ch * 0.5, 60);
    drawSprite(ctx, 'katana', cw * 0.35, ch * 0.45, 35);
    // プレイヤーHP
    this.drawHpBar(ctx, cw * 0.05, ch * 0.65, cw * 0.35, 12, this.playerHp, this.playerMaxHp, '#44CC44');
    ctx.fillStyle = '#FFF';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`ひかり HP: ${this.playerHp}`, cw * 0.05, ch * 0.65 - 4);

    // 敵側
    if (this.phase !== 'win' || this.phaseTimer > 1) {
      const enemyShake = this.phase === 'damage' && this.slashTimer > 0.3 ? (Math.random() - 0.5) * 8 : 0;
      const bossScale = this.enemy.sprite === 'demon-boss' ? 80 : 60;
      drawSprite(ctx, this.enemy.sprite, cw * 0.65 + enemyShake, ch * 0.42, bossScale);
      // 敵HP
      this.drawHpBar(ctx, cw * 0.5, ch * 0.65, cw * 0.42, 12, this.enemy.hp, this.enemy.maxHp, '#FF4444');
      ctx.fillStyle = '#FFF';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${this.enemy.name} HP: ${this.enemy.hp}`, cw * 0.5, ch * 0.65 - 4);
    }

    // 斬撃エフェクト
    if (this.slashTimer > 0 && this.slashEffect) {
      ctx.globalAlpha = Math.min(1, this.slashTimer * 2);
      drawSprite(ctx, this.slashEffect, cw * 0.65, ch * 0.4, 70);
      ctx.globalAlpha = 1;
    }

    // 敵攻撃エフェクト
    if (this.phase === 'enemyAttack' && this.enemyAttackTimer > 0.3) {
      ctx.globalAlpha = 0.6;
      drawSprite(ctx, 'fire', cw * 0.35, ch * 0.45, 50);
      ctx.globalAlpha = 1;
    }

    this.particles.draw(ctx);

    // ダメージテキスト
    if (this.damageTimer > 0) {
      ctx.fillStyle = this.damageText.includes('完璧') ? '#FFD700' :
                       this.damageText.includes('良い') ? '#88FF88' :
                       this.damageText.startsWith('-') ? '#FF4444' : '#FFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      const floatY = this.damageY - (1.2 - this.damageTimer) * 30;
      ctx.globalAlpha = Math.min(1, this.damageTimer * 2);
      ctx.fillText(this.damageText, this.damageX, floatY);
      ctx.globalAlpha = 1;
    }

    // フェーズ別UI
    if (this.phase === 'intro') {
      ctx.fillStyle = '#FF4444';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.enemy.name} 出現！`, cw / 2, ch * 0.2);
    } else if (this.phase === 'select') {
      this.drawSelectUI(ctx, cw, ch);
    } else if (this.phase === 'timing') {
      this.drawTimingUI(ctx, cw, ch);
    } else if (this.phase === 'defend') {
      this.drawDefendUI(ctx, cw, ch);
    } else if (this.phase === 'lose') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#FF4444';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('やられた…', cw / 2, ch / 2 - 20);
      ctx.fillStyle = '#FFF';
      ctx.font = '18px sans-serif';
      ctx.fillText('タップでやり直し', cw / 2, ch / 2 + 25);
    } else if (this.phase === 'cleared') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      drawSprite(ctx, 'katana', cw / 2 - 100, ch / 2 - 10, 30);
      ctx.fillText('全集中・完全勝利！', cw / 2 + 10, ch / 2 - 10);
      drawSprite(ctx, 'tanjiro', cw / 2, ch / 2 + 50, 40);
    }

    // 進捗（倒した鬼の数）
    if (this.phase !== 'cleared' && this.phase !== 'lose') {
      ctx.fillStyle = '#FFF';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.currentEnemyIndex} / ${ENEMIES.length} 体撃破`, cw / 2, 20);
    }

    hikari.drawWithBubble(ctx, 50, ch - 50, 25, this.messageTimer > 0 ? this.message : null);
  }

  drawHpBar(ctx, x, y, w, h, hp, maxHp, color) {
    const ratio = Math.max(0, hp / maxHp);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    roundRect(ctx, x, y, w, h, h / 2);
    ctx.fill();
    if (ratio > 0) {
      ctx.fillStyle = color;
      roundRect(ctx, x, y, Math.max(h, w * ratio), h, h / 2);
      ctx.fill();
    }
  }

  drawSelectUI(ctx, cw, ch) {
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('呼吸の型を選べ！', cw / 2, ch * 0.78);

    const btnW = cw * 0.28;
    const btnH = 50;
    const gap = 8;
    const totalW = BREATH_TYPES.length * btnW + (BREATH_TYPES.length - 1) * gap;
    const startX = (cw - totalW) / 2;
    this._breathButtons = [];

    BREATH_TYPES.forEach((b, i) => {
      const bx = startX + i * (btnW + gap);
      const by = ch * 0.83;
      drawButton(ctx, b.name, bx, by, btnW, btnH, b.color);
      this._breathButtons.push({ x: bx, y: by, w: btnW, h: btnH, index: i });
    });
  }

  drawTimingUI(ctx, cw, ch) {
    const cx = cw / 2;
    const cy = ch * 0.82;

    // 外の縮小する円
    ctx.strokeStyle = BREATH_TYPES[this.selectedBreath].color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, this.timingRadius, 0, Math.PI * 2);
    ctx.stroke();

    // ターゲット円
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(cx, cy, TARGET_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 中央テキスト
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('タップ！', cx, cy + 4);

    // 呼吸名
    ctx.fillStyle = BREATH_TYPES[this.selectedBreath].color;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(BREATH_TYPES[this.selectedBreath].name + '！', cx, ch * 0.75);
  }

  drawDefendUI(ctx, cw, ch) {
    if (this.defendSuccess) {
      ctx.fillStyle = '#44FF44';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('全集中！防御成功！', cw / 2, ch * 0.82);
    } else {
      const btnW = 200, btnH = 55;
      const pulse = 1 + Math.sin(Date.now() / 100) * 0.08;
      ctx.save();
      ctx.translate(cw / 2, ch * 0.84);
      ctx.scale(pulse, pulse);
      drawButton(ctx, '全集中！防御！', -btnW / 2, -btnH / 2, btnW, btnH, '#FF8800');
      ctx.restore();
      this._defendBtnRect = [cw / 2 - btnW / 2, ch * 0.84 - btnH / 2, btnW, btnH];

      // 残り時間バー
      const ratio = this.defendWindow / 1.5;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      roundRect(ctx, cw * 0.2, ch * 0.77, cw * 0.6, 8, 4);
      ctx.fill();
      ctx.fillStyle = ratio > 0.3 ? '#FF8800' : '#FF2222';
      roundRect(ctx, cw * 0.2, ch * 0.77, Math.max(8, cw * 0.6 * ratio), 8, 4);
      ctx.fill();
    }
  }

  onClick(x, y) {
    if (this.cleared) {
      this.game.completeStage(8);
      return;
    }

    if (this.phase === 'lose') {
      // リスタート
      this.playerHp = this.playerMaxHp;
      this.currentEnemyIndex = 0;
      this.enemy = this.createEnemy(0);
      this.phase = 'intro';
      this.phaseTimer = 1.5;
      this.showMessage(HIKARI_REACTIONS.stage8.start);
      startBGM(8);
      return;
    }

    if (this.phase === 'select') {
      for (const btn of this._breathButtons || []) {
        if (isInRect(x, y, btn.x, btn.y, btn.w, btn.h)) {
          sfxTap();
          this.selectedBreath = btn.index;
          this.phase = 'timing';
          this.timingRadius = 120;
          return;
        }
      }
    } else if (this.phase === 'timing') {
      // タイミング判定
      const diff = Math.abs(this.timingRadius - TARGET_RADIUS);
      let accuracy = 0;
      if (diff <= PERFECT_RANGE) accuracy = 2;
      else if (diff <= GOOD_RANGE) accuracy = 1;
      this.applyDamage(accuracy);
    } else if (this.phase === 'defend') {
      if (this._defendBtnRect && isInRect(x, y, ...this._defendBtnRect)) {
        // 防御成功
        this.defendSuccess = true;
        sfxCollect();
        const reducedDmg = Math.floor(this.enemy.atk * 0.3);
        this.playerHp = Math.max(0, this.playerHp - reducedDmg);
        this.showDamage(this.game.cw * 0.25, this.game.ch * 0.45, reducedDmg > 0 ? `-${reducedDmg}` : '完全防御！');
        this.particles.emit(this.game.cw * 0.25, this.game.ch * 0.4, 5, {
          sprites: ['sparkle', 'star'], spread: 60, size: 15,
        });
        this.showMessage('全集中！');
        // 少し待ってからselectへ
        setTimeout(() => {
          if (this.playerHp <= 0) {
            this.phase = 'lose';
            this.showMessage(HIKARI_REACTIONS.stage8.lose);
            stopBGM();
          } else {
            this.phase = 'select';
          }
        }, 800);
      }
    }
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
