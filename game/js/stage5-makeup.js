// stage5-makeup.js - ステージ5: 変なメイクバトル

import { drawCounter, drawButton, isInRect, ParticleSystem } from './ui.js';
import { hikari } from './hikari.js';
import { MAKEUP_TOOLS, NPC_CHARACTERS, HIKARI_REACTIONS } from './data.js';
import { sfxTap, sfxCollect, startBGM, stopBGM } from './audio.js';

export class Stage5Makeup {
  constructor(game) {
    this.game = game;
    this.count = 0;
    this.goal = 15; // 15人にメイクすればクリア
    this.phase = 'makeup'; // makeup | result
    this.particles = new ParticleSystem();
    this.message = '';
    this.messageTimer = 0;
    this.cleared = false;

    // メイク対象
    this.currentTarget = 0;
    this.targets = [
      { name: 'ひかりちゃん', emoji: '👧' },
      ...this.shuffleNPCs(),
    ];

    // メイク道具
    this.selectedTool = 0;
    this.appliedMakeup = []; // {x, y, color, tool}
    this.weirdScore = 0;

    // 顔パーツ
    this.faceRadius = 0;

    startBGM(5);
    this.showMessage(HIKARI_REACTIONS.stage5.start);
  }

  shuffleNPCs() {
    const pool = [];
    for (let i = 0; i < 3; i++) {
      pool.push(...NPC_CHARACTERS.map(n => ({ ...n })));
    }
    return pool.sort(() => Math.random() - 0.5);
  }

  update(dt) {
    if (this.cleared) return;
    this.particles.update(dt);
    if (this.messageTimer > 0) this.messageTimer -= dt;
  }

  draw(ctx) {
    const { cw, ch } = this.game;
    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0, '#FF69B4');
    grad.addColorStop(1, '#DB7093');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    if (this.phase === 'makeup') {
      this.drawMakeupPhase(ctx, cw, ch);
    } else {
      this.drawResultPhase(ctx, cw, ch);
    }

    this.particles.draw(ctx);
    drawCounter(ctx, this.count, this.goal, '💄 メイク', cw);
    hikari.drawWithBubble(ctx, 50, ch - 50, 30, this.messageTimer > 0 ? this.message : null);

    if (this.cleared) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#FF69B4';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💄 へんてこ大賞！ 🏆', cw / 2, ch / 2);
    }
  }

  drawMakeupPhase(ctx, cw, ch) {
    const target = this.targets[this.currentTarget];
    // 対象名
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${target.emoji} ${target.name}にメイク！`, cw / 2, 60);

    // 顔
    const faceX = cw / 2;
    const faceY = ch * 0.35;
    this.faceRadius = Math.min(cw, ch) * 0.18;
    const r = this.faceRadius;

    // 肌色の丸
    ctx.fillStyle = '#FFDAB9';
    ctx.beginPath();
    ctx.arc(faceX, faceY, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#DEB887';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 目
    ctx.font = `${r * 0.4}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👁️', faceX - r * 0.35, faceY - r * 0.15);
    ctx.fillText('👁️', faceX + r * 0.35, faceY - r * 0.15);
    // 鼻
    ctx.fillStyle = '#DEB887';
    ctx.beginPath();
    ctx.arc(faceX, faceY + r * 0.1, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
    // 口
    ctx.strokeStyle = '#CD5C5C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(faceX, faceY + r * 0.35, r * 0.2, 0, Math.PI);
    ctx.stroke();

    // メイク済みの要素
    for (const m of this.appliedMakeup) {
      ctx.fillStyle = m.color;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size || 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      if (m.emoji) {
        ctx.font = `${m.size * 2 || 16}px serif`;
        ctx.fillText(m.emoji, m.x, m.y);
      }
    }

    // 道具パレット
    const toolY = ch * 0.62;
    const toolW = 50;
    const toolGap = 8;
    const totalW = MAKEUP_TOOLS.length * (toolW + toolGap);
    const startX = (cw - totalW) / 2;
    this._toolButtons = [];

    MAKEUP_TOOLS.forEach((tool, i) => {
      const tx = startX + i * (toolW + toolGap);
      const isSelected = i === this.selectedTool;
      ctx.fillStyle = isSelected ? '#FFD700' : 'rgba(255,255,255,0.8)';
      roundRect(ctx, tx, toolY, toolW, toolW, 8);
      ctx.fill();
      if (isSelected) {
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.font = `${toolW * 0.5}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tool.emoji, tx + toolW / 2, toolY + toolW * 0.35);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#333';
      ctx.fillText(tool.name, tx + toolW / 2, toolY + toolW * 0.75);
      this._toolButtons.push({ x: tx, y: toolY, w: toolW, h: toolW, index: i });
    });

    // 完成ボタン
    const btnW = 160, btnH = 44;
    const btnX = cw / 2 - btnW / 2;
    const btnY = ch * 0.82;
    drawButton(ctx, '✨ 完成！', btnX, btnY, btnW, btnH, '#FF1493');
    this._doneBtnRect = [btnX, btnY, btnW, btnH];
  }

  drawResultPhase(ctx, cw, ch) {
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('変度チェック！', cw / 2, ch * 0.2);

    const stars = Math.min(3, Math.ceil(this.weirdScore / 3));
    ctx.font = '40px serif';
    ctx.fillText('⭐'.repeat(stars) + '☆'.repeat(3 - stars), cw / 2, ch * 0.35);

    const reactions = ['え…これ私？😂', 'すごい顔…🤣', '…芸術的！🎨'];
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#FFF';
    ctx.fillText(reactions[Math.min(stars - 1, 2)], cw / 2, ch * 0.5);

    const btnW = 160, btnH = 44;
    drawButton(ctx, '次の人へ ▶', cw / 2 - btnW / 2, ch * 0.65, btnW, btnH, '#4CAF50');
    this._nextBtnRect = [cw / 2 - btnW / 2, ch * 0.65, btnW, btnH];
  }

  onClick(x, y) {
    if (this.cleared) {
      this.game.completeStage(5);
      return;
    }

    if (this.phase === 'makeup') {
      // 道具選択
      for (const btn of this._toolButtons || []) {
        if (isInRect(x, y, btn.x, btn.y, btn.w, btn.h)) {
          sfxTap();
          this.selectedTool = btn.index;
          return;
        }
      }
      // 完成ボタン
      if (this._doneBtnRect && isInRect(x, y, ...this._doneBtnRect)) {
        sfxCollect();
        this.weirdScore = Math.min(10, this.appliedMakeup.length);
        this.count++;
        this.phase = 'result';
        this.particles.emit(this.game.cw / 2, this.game.ch / 2, 10, {
          emojis: ['✨', '💄', '🌈', '⭐'], spread: 150, size: 25,
        });
        if (this.count >= this.goal) {
          this.cleared = true;
          this.showMessage(HIKARI_REACTIONS.stage5.clear);
          stopBGM();
        }
        return;
      }
      // 顔にメイク
      const faceX = this.game.cw / 2;
      const faceY = this.game.ch * 0.35;
      const dx = x - faceX;
      const dy = y - faceY;
      if (dx * dx + dy * dy < this.faceRadius * this.faceRadius * 1.2) {
        const tool = MAKEUP_TOOLS[this.selectedTool];
        const color = tool.colors[Math.floor(Math.random() * tool.colors.length)];
        this.appliedMakeup.push({
          x, y, color,
          emoji: tool.emoji === '⭐' ? ['⭐', '❤️', '💩'][Math.floor(Math.random() * 3)] : null,
          size: 5 + Math.random() * 8,
        });
        sfxTap();
        this.particles.emit(x, y, 2, { emojis: ['✨'], spread: 30, size: 10 });
        this.showMessage(HIKARI_REACTIONS.stage5.funny);
      }
    } else if (this.phase === 'result') {
      if (this._nextBtnRect && isInRect(x, y, ...this._nextBtnRect)) {
        sfxTap();
        this.currentTarget++;
        this.appliedMakeup = [];
        this.phase = 'makeup';
        if (this.currentTarget >= this.targets.length) {
          this.currentTarget = 0;
        }
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
