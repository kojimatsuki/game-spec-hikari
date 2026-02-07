// scenes.js - シーン遷移（タイトル/ステージ選択/クリア/エンディング）

import { GAME_TITLE, STAGES, SECRET_STAGE, OPENING_TEXTS, ENDING_TEXTS } from './data.js';
import { drawButton, drawCenterText, isInRect, ParticleSystem } from './ui.js';
import { hikari } from './hikari.js';
import { sfxTap, sfxClear, startBGM, stopBGM } from './audio.js';
import { drawSprite } from './sprites.js';

// ── タイトル画面 ──
export class TitleScene {
  constructor(game) {
    this.game = game;
    this.timer = 0;
    this.particles = new ParticleSystem();
    startBGM('title');
  }

  update(dt) {
    this.timer += dt;
    this.particles.update(dt);
    if (Math.random() < 0.1) {
      const { cw, ch } = this.game;
      this.particles.emit(
        Math.random() * cw, Math.random() * ch, 1,
        { sprites: ['sparkle', 'star', 'swirl-star', 'glow-star'], spread: 30, size: 20 }
      );
    }
  }

  draw(ctx) {
    const { cw, ch } = this.game;
    // 背景グラデーション
    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0, '#1a0533');
    grad.addColorStop(0.5, '#4a1a7a');
    grad.addColorStop(1, '#0a0a2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    this.particles.draw(ctx);

    // ポータル
    ctx.save();
    ctx.translate(cw / 2, ch * 0.35);
    const s = 1 + Math.sin(this.timer * 2) * 0.05;
    ctx.scale(s, s);
    drawSprite(ctx, 'portal', 0, 0, 80);
    ctx.restore();

    // ひかりちゃん
    hikari.draw(ctx, cw / 2, ch * 0.35, 50);

    // タイトル
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#FF69B4';
    ctx.shadowBlur = 10;
    ctx.fillText('ひかりちゃんの', cw / 2, ch * 0.55);
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('ゲームワールド', cw / 2, ch * 0.62);
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#FFC0CB';
    ctx.fillText('〜吸い込まれた世界〜', cw / 2, ch * 0.69);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // スタートボタン
    const btnW = 200, btnH = 50;
    const btnX = cw / 2 - btnW / 2, btnY = ch * 0.78;
    const pulse = 1 + Math.sin(this.timer * 3) * 0.03;
    ctx.save();
    ctx.translate(cw / 2, btnY + btnH / 2);
    ctx.scale(pulse, pulse);
    ctx.translate(-cw / 2, -(btnY + btnH / 2));
    drawButton(ctx, 'はじめる', btnX, btnY, btnW, btnH, '#FF69B4');
    ctx.restore();
    this._btnRect = [btnX, btnY, btnW, btnH];
  }

  onClick(x, y) {
    if (this._btnRect && isInRect(x, y, ...this._btnRect)) {
      sfxTap();
      stopBGM();
      const cleared = this.game.state.clearedStages;
      if (cleared.size === 0) {
        this.game.setScene(new OpeningScene(this.game));
      } else {
        this.game.setScene(new StageSelectScene(this.game));
      }
    }
  }

  cleanup() { stopBGM(); }
}

// ── オープニング ──
export class OpeningScene {
  constructor(game) {
    this.game = game;
    this.textIndex = 0;
    this.charIndex = 0;
    this.displayText = '';
    this.timer = 0;
    this.spinAngle = 0;
    this.phase = 'text'; // text | spin | arrive
  }

  update(dt) {
    this.timer += dt;
    if (this.phase === 'text') {
      const full = OPENING_TEXTS[this.textIndex] || '';
      if (this.charIndex < full.length) {
        this.charIndex += dt * 15;
        this.displayText = full.substring(0, Math.floor(this.charIndex));
      }
    } else if (this.phase === 'spin') {
      this.spinAngle += dt * 8;
      if (this.timer > 2) {
        this.phase = 'text';
        this.timer = 0;
      }
    }
  }

  draw(ctx) {
    const { cw, ch } = this.game;
    ctx.fillStyle = '#1a0533';
    ctx.fillRect(0, 0, cw, ch);

    if (this.phase === 'spin') {
      ctx.save();
      ctx.translate(cw / 2, ch / 2);
      ctx.rotate(this.spinAngle);
      drawSprite(ctx, 'portal', 0, 0, 100);
      ctx.restore();
    } else {
      // テキスト表示
      hikari.draw(ctx, cw / 2, ch * 0.3, 60);
      ctx.fillStyle = '#FFF';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      wrapText(ctx, this.displayText, cw / 2, ch * 0.55, cw - 60, 28);

      // タップで次へ
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '14px sans-serif';
      ctx.fillText('タップで次へ', cw / 2, ch * 0.9);
    }
  }

  onClick() {
    sfxTap();
    if (this.phase === 'spin') return;
    const full = OPENING_TEXTS[this.textIndex] || '';
    if (this.charIndex < full.length) {
      this.charIndex = full.length;
      this.displayText = full;
      return;
    }
    this.textIndex++;
    this.charIndex = 0;
    this.displayText = '';
    // ぐるぐる演出
    if (this.textIndex === 3) {
      this.phase = 'spin';
      this.timer = 0;
      return;
    }
    if (this.textIndex >= OPENING_TEXTS.length) {
      this.game.setScene(new StageSelectScene(this.game));
    }
  }

  cleanup() {}
}

// ── ステージ選択 ──
export class StageSelectScene {
  constructor(game) {
    this.game = game;
    this.buttons = [];
  }

  update() {}

  draw(ctx) {
    const { cw, ch } = this.game;
    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0, '#2a1a4a');
    grad.addColorStop(1, '#0a0a2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ステージ選択', cw / 2, 40);

    this.buttons = [];
    const cols = 2;
    const btnW = cw * 0.4;
    const btnH = 70;
    const gapX = cw * 0.06;
    const gapY = 14;
    const startX = (cw - (btnW * cols + gapX * (cols - 1))) / 2;
    const startY = 70;

    const cleared = this.game.state.clearedStages;
    const allCleared = STAGES.every(s => cleared.has(s.id));

    const allStages = [...STAGES];
    if (allCleared) allStages.push(SECRET_STAGE);

    allStages.forEach((stage, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (btnW + gapX);
      const y = startY + row * (btnH + gapY);

      const isCleared = cleared.has(stage.id);
      const isSecret = stage.id === 7;
      const isLocked = !isSecret && !isCleared && stage.id > 1 && !cleared.has(stage.id - 1);

      let color = stage.colorTheme.bg;
      if (isLocked) color = '#555';

      ctx.fillStyle = color;
      ctx.globalAlpha = isLocked ? 0.5 : 1;
      roundRect(ctx, x, y, btnW, btnH, 12);
      ctx.fill();
      ctx.globalAlpha = 1;

      // ステージアイコン（スプライト）
      drawSprite(ctx, stage.sprite, x + 24, y + btnH / 2, 28);

      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      if (isLocked) {
        drawSprite(ctx, 'lock', x + 62, y + btnH / 2 - 10, 15);
      } else {
        ctx.fillText(stage.name, x + 48, y + btnH / 2 - 10);
      }

      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#DDD';
      if (isCleared) {
        drawSprite(ctx, 'star', x + 52, y + btnH / 2 + 12, 12);
        ctx.fillText('クリア済み', x + 63, y + btnH / 2 + 12);
      } else if (!isLocked) {
        ctx.fillText(stage.description, x + 48, y + btnH / 2 + 12);
      }

      if (!isLocked) {
        this.buttons.push({ x, y, w: btnW, h: btnH, stageId: stage.id });
      }
    });
  }

  onClick(x, y) {
    for (const btn of this.buttons) {
      if (isInRect(x, y, btn.x, btn.y, btn.w, btn.h)) {
        sfxTap();
        this.game.startStage(btn.stageId);
        return;
      }
    }
  }

  cleanup() {}
}

// ── ステージクリア ──
export class StageClearScene {
  constructor(game, stageId) {
    this.game = game;
    this.stageId = stageId;
    this.timer = 0;
    this.particles = new ParticleSystem();
    sfxClear();
  }

  update(dt) {
    this.timer += dt;
    this.particles.update(dt);
    if (this.timer < 2 && Math.random() < 0.3) {
      const { cw, ch } = this.game;
      this.particles.emit(
        Math.random() * cw, Math.random() * ch, 2,
        { sprites: ['celebration', 'star', 'sparkle', 'glow-star', 'swirl-star'], spread: 100, size: 30 }
      );
    }
  }

  draw(ctx) {
    const { cw, ch } = this.game;
    ctx.fillStyle = '#1a0533';
    ctx.fillRect(0, 0, cw, ch);
    this.particles.draw(ctx);

    // クリアテキスト（スプライト + テキスト）
    drawSprite(ctx, 'celebration', cw / 2 - 120, ch * 0.7, 28);
    drawCenterText(ctx, 'ステージクリア！', cw, ch * 0.7, 28, '#FFD700');
    drawSprite(ctx, 'celebration', cw / 2 + 120, ch * 0.7, 28);

    const stage = STAGES.find(s => s.id === this.stageId) || SECRET_STAGE;
    drawSprite(ctx, stage.sprite, cw / 2 - 60, ch * 0.45, 18);
    ctx.fillStyle = '#FFC0CB';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(stage.name, cw / 2 + 10, ch * 0.45);

    hikari.drawWithBubble(ctx, cw / 2, ch * 0.3, 50, 'やったー！');

    if (this.timer > 1.5) {
      const btnW = 200, btnH = 50;
      const btnX = cw / 2 - btnW / 2, btnY = ch * 0.75;
      drawButton(ctx, '次へ ▶', btnX, btnY, btnW, btnH, '#4CAF50');
      this._btnRect = [btnX, btnY, btnW, btnH];
    }
  }

  onClick(x, y) {
    if (this._btnRect && isInRect(x, y, ...this._btnRect)) {
      sfxTap();
      const cleared = this.game.state.clearedStages;
      const allCleared = STAGES.every(s => cleared.has(s.id));
      if (this.stageId === 6 && allCleared) {
        this.game.setScene(new EndingScene(this.game));
      } else {
        this.game.setScene(new StageSelectScene(this.game));
      }
    }
  }

  cleanup() {}
}

// ── エンディング ──
export class EndingScene {
  constructor(game) {
    this.game = game;
    this.textIndex = 0;
    this.charIndex = 0;
    this.displayText = '';
    this.timer = 0;
    this.particles = new ParticleSystem();
  }

  update(dt) {
    this.timer += dt;
    this.particles.update(dt);
    const full = ENDING_TEXTS[this.textIndex] || '';
    if (this.charIndex < full.length) {
      this.charIndex += dt * 12;
      this.displayText = full.substring(0, Math.floor(this.charIndex));
    }
    if (Math.random() < 0.05) {
      const { cw, ch } = this.game;
      this.particles.emit(Math.random() * cw, ch, 1, {
        sprites: ['sparkle', 'glow-star', 'swirl-star'], spread: 60, upward: 150, size: 20,
      });
    }
  }

  draw(ctx) {
    const { cw, ch } = this.game;
    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0, '#FFB6C1');
    grad.addColorStop(1, '#DDA0DD');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    this.particles.draw(ctx);
    hikari.draw(ctx, cw / 2, ch * 0.25, 60);

    ctx.fillStyle = '#333';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    wrapText(ctx, this.displayText, cw / 2, ch * 0.5, cw - 60, 30);

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.font = '14px sans-serif';
    ctx.fillText('タップで次へ', cw / 2, ch * 0.9);
  }

  onClick() {
    sfxTap();
    const full = ENDING_TEXTS[this.textIndex] || '';
    if (this.charIndex < full.length) {
      this.charIndex = full.length;
      this.displayText = full;
      return;
    }
    this.textIndex++;
    this.charIndex = 0;
    this.displayText = '';
    if (this.textIndex >= ENDING_TEXTS.length) {
      this.game.state.secretUnlocked = true;
      this.game.setScene(new StageSelectScene(this.game));
    }
  }

  cleanup() {}
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  const chars = [...text];
  let line = '';
  let ly = y;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, ly);
      line = ch;
      ly += lineH;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, ly);
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
