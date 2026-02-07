// stage3-knife.js - ステージ3: 包丁ゲーム（鬼ごっこ＋ガチャ）

import { drawCounter, drawButton, isInRect, ParticleSystem } from './ui.js';
import { hikari } from './hikari.js';
import { NPC_CHARACTERS, HIKARI_REACTIONS } from './data.js';
import { sfxTap, sfxPeshi, sfxDrumroll, sfxCollect, startBGM, stopBGM } from './audio.js';

export class Stage3Knife {
  constructor(game) {
    this.game = game;
    this.phase = 'gacha'; // gacha | drumroll | reveal | chase
    this.count = 0;
    this.goal = 100;
    this.particles = new ParticleSystem();
    this.message = '';
    this.messageTimer = 0;
    this.cleared = false;

    // ガチャ
    this.gachaAngle = 0;
    this.gachaSpinning = false;
    this.gachaResult = null;
    this.revealTimer = 0;

    // 鬼ごっこ
    this.characters = [];
    this.oniIndex = -1;

    startBGM(3);
    this.showMessage(HIKARI_REACTIONS.stage3.gachaStart);
  }

  update(dt) {
    if (this.cleared) return;
    this.particles.update(dt);
    if (this.messageTimer > 0) this.messageTimer -= dt;

    if (this.phase === 'drumroll') {
      this.gachaAngle += dt * 15;
      this.revealTimer -= dt;
      if (this.revealTimer <= 0) {
        this.phase = 'reveal';
        this.revealTimer = 2;
        this.setupChase();
      }
    } else if (this.phase === 'reveal') {
      this.revealTimer -= dt;
      if (this.revealTimer <= 0) {
        this.phase = 'chase';
        this.showMessage(HIKARI_REACTIONS.stage3.chase);
      }
    } else if (this.phase === 'chase') {
      this.updateChase(dt);
    }
  }

  setupChase() {
    const { cw, ch } = this.game;
    // ひかりちゃんは常に鬼（プレイヤーが追いかける）
    this.oniIndex = 0;
    this.characters = [
      { name: 'ひかり', emoji: '👧✨', x: cw / 2, y: ch / 2, isOni: true, isPlayer: true },
    ];
    // NPC逃げるキャラ
    const npcs = [...NPC_CHARACTERS].sort(() => Math.random() - 0.5).slice(0, 4);
    npcs.forEach((npc, i) => {
      this.characters.push({
        name: npc.name,
        emoji: npc.emoji,
        x: 60 + Math.random() * (cw - 120),
        y: 100 + Math.random() * (ch - 200),
        isOni: false,
        isPlayer: false,
        vx: (Math.random() - 0.5) * 100,
        vy: (Math.random() - 0.5) * 100,
        changeTimer: 1 + Math.random() * 2,
      });
    });
    const oniChar = this.characters.find(c => c.isOni);
    this.showMessage(`${HIKARI_REACTIONS.stage3.oni} ${oniChar.name}！`);
  }

  updateChase(dt) {
    const { cw, ch } = this.game;
    for (const c of this.characters) {
      if (c.isPlayer) continue;
      c.changeTimer -= dt;
      if (c.changeTimer <= 0) {
        c.vx = (Math.random() - 0.5) * 150;
        c.vy = (Math.random() - 0.5) * 150;
        c.changeTimer = 0.8 + Math.random() * 1.5;
      }
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      if (c.x < 30 || c.x > cw - 30) c.vx *= -1;
      if (c.y < 80 || c.y > ch - 80) c.vy *= -1;
      c.x = Math.max(30, Math.min(cw - 30, c.x));
      c.y = Math.max(80, Math.min(ch - 80, c.y));
    }
  }

  draw(ctx) {
    const { cw, ch } = this.game;
    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0, '#CC3300');
    grad.addColorStop(1, '#881100');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    if (this.phase === 'gacha') {
      this.drawGacha(ctx, cw, ch);
    } else if (this.phase === 'drumroll') {
      this.drawDrumroll(ctx, cw, ch);
    } else if (this.phase === 'reveal') {
      this.drawReveal(ctx, cw, ch);
    } else {
      this.drawChase(ctx, cw, ch);
    }

    this.particles.draw(ctx);
    if (this.phase === 'chase') {
      drawCounter(ctx, this.count, this.goal, '💰 つかまえた', cw);
    }
    hikari.drawWithBubble(ctx, 50, ch - 60, 35, this.messageTimer > 0 ? this.message : null);

    if (this.cleared) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#FF8800';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚔️ ステージクリア！ ⚔️', cw / 2, ch / 2);
    }
  }

  drawGacha(ctx, cw, ch) {
    ctx.font = '100px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎰', cw / 2, ch * 0.35);

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('ガチャを回して鬼を決めよう！', cw / 2, ch * 0.55);

    const btnW = 200, btnH = 50;
    drawButton(ctx, '🎰 ガチャを回す！', cw / 2 - btnW / 2, ch * 0.65, btnW, btnH, '#FF8800');
    this._gachaBtnRect = [cw / 2 - btnW / 2, ch * 0.65, btnW, btnH];
  }

  drawDrumroll(ctx, cw, ch) {
    ctx.save();
    ctx.translate(cw / 2, ch * 0.4);
    ctx.rotate(this.gachaAngle);
    ctx.font = '100px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎰', 0, 0);
    ctx.restore();
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🥁 ドキドキ…', cw / 2, ch * 0.65);
  }

  drawReveal(ctx, cw, ch) {
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('鬼は…', cw / 2, ch * 0.3);
    ctx.font = '80px serif';
    ctx.fillText('👹 ひかりちゃん！', cw / 2, ch * 0.5);
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#FFF';
    ctx.fillText('みんなを捕まえよう！', cw / 2, ch * 0.65);
  }

  drawChase(ctx, cw, ch) {
    for (const c of this.characters) {
      if (c.isPlayer) continue;
      ctx.font = '35px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.emoji, c.x, c.y);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#FFF';
      ctx.fillText(c.name, c.x, c.y + 25);
    }
  }

  onClick(x, y) {
    if (this.cleared) {
      this.game.completeStage(3);
      return;
    }

    if (this.phase === 'gacha') {
      if (this._gachaBtnRect && isInRect(x, y, ...this._gachaBtnRect)) {
        sfxDrumroll();
        this.phase = 'drumroll';
        this.revealTimer = 2;
      }
    } else if (this.phase === 'chase') {
      // NPC をタップで捕まえる
      for (const c of this.characters) {
        if (c.isPlayer) continue;
        const dx = x - c.x;
        const dy = y - c.y;
        if (dx * dx + dy * dy < 35 * 35) {
          sfxPeshi();
          this.count++;
          this.particles.emit(c.x, c.y, 4, {
            emojis: ['💰', '✨', '⚡'], spread: 80, size: 20,
          });
          // 逃がす
          c.x = 30 + Math.random() * (this.game.cw - 60);
          c.y = 80 + Math.random() * (this.game.ch - 160);
          c.vx = (Math.random() - 0.5) * 200;
          c.vy = (Math.random() - 0.5) * 200;

          if (this.count >= this.goal) {
            this.cleared = true;
            this.showMessage(HIKARI_REACTIONS.stage3.clear);
            stopBGM();
          }
          return;
        }
      }
    }
  }

  showMessage(msg) {
    this.message = msg;
    this.messageTimer = 2.5;
  }

  cleanup() { stopBGM(); }
}
