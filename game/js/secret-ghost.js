// secret-ghost.js - 隠しステージ: お化けかくれんぼ

import { ParticleSystem } from './ui.js';
import { hikari } from './hikari.js';
import { GHOST_TYPES, HIDE_SPOTS, HIKARI_REACTIONS } from './data.js';
import { sfxGhost, sfxTap, startBGM, stopBGM } from './audio.js';

const COLORS = ['#FF4444', '#4444FF', '#44BB44', '#FFDD44', '#BB44BB', '#44BBBB'];
const GRID_COLS = 5;
const GRID_ROWS = 6;

export class SecretGhost {
  constructor(game) {
    this.game = game;
    this.particles = new ParticleSystem();
    this.message = '';
    this.messageTimer = 0;
    this.cleared = false;
    this.gameOver = false;
    this.timer = 0;

    // 色変更
    this.bgColor = COLORS[0];
    this.colorTimer = 0;
    this.colorInterval = 3;

    // グリッドベース
    this.cellW = 0;
    this.cellH = 0;

    // プレイヤー
    this.playerCol = 0;
    this.playerRow = Math.floor(GRID_ROWS / 2);
    this.isHiding = false;

    // ゴール
    this.goalCol = GRID_COLS - 1;
    this.goalRow = Math.floor(GRID_ROWS / 2);

    // 隠れ場所を配置
    this.hideSpots = [];
    this.placeHideSpots();

    // お化け
    this.ghosts = [];
    this.spawnGhosts();

    startBGM(7);
    this.showMessage(HIKARI_REACTIONS.secret.start);
  }

  placeHideSpots() {
    for (let i = 0; i < 10; i++) {
      const col = Math.floor(Math.random() * GRID_COLS);
      const row = Math.floor(Math.random() * GRID_ROWS);
      if (col === 0 && row === this.playerRow) continue;
      if (col === this.goalCol && row === this.goalRow) continue;
      const spot = HIDE_SPOTS[Math.floor(Math.random() * HIDE_SPOTS.length)];
      this.hideSpots.push({ col, row, ...spot });
    }
  }

  spawnGhosts() {
    // 普通のお化け x2
    this.ghosts.push(this.createGhost(GHOST_TYPES[0], 2, 1));
    this.ghosts.push(this.createGhost(GHOST_TYPES[0], 3, 4));
    // ガイコツ
    this.ghosts.push(this.createGhost(GHOST_TYPES[1], 4, 2));
    // カボチャ
    this.ghosts.push(this.createGhost(GHOST_TYPES[2], 3, 0));
  }

  createGhost(type, col, row) {
    return {
      ...type,
      col, row,
      moveTimer: 1 + Math.random() * 2,
      moveInterval: 3 / type.speed,
      targetCol: col,
      targetRow: row,
    };
  }

  update(dt) {
    if (this.cleared || this.gameOver) return;
    this.timer += dt;
    this.particles.update(dt);
    if (this.messageTimer > 0) this.messageTimer -= dt;

    // 色変更
    this.colorTimer += dt;
    if (this.colorTimer >= this.colorInterval) {
      this.colorTimer = 0;
      this.bgColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      // 色が変わるとお化けの速度も変わる
      for (const g of this.ghosts) {
        g.moveInterval = (2 + Math.random() * 2) / g.speed;
      }
    }

    // お化け移動
    for (const g of this.ghosts) {
      g.moveTimer -= dt;
      if (g.moveTimer <= 0) {
        g.moveTimer = g.moveInterval;
        this.moveGhost(g);
      }
    }

    // 当たり判定（隠れていない場合のみ）
    if (!this.isHiding) {
      for (const g of this.ghosts) {
        if (g.col === this.playerCol && g.row === this.playerRow) {
          this.gameOver = true;
          sfxGhost();
          this.showMessage(HIKARI_REACTIONS.secret.found);
          stopBGM();
          return;
        }
      }
    }

    // ゴール判定
    if (this.playerCol === this.goalCol && this.playerRow === this.goalRow) {
      this.cleared = true;
      this.showMessage(HIKARI_REACTIONS.secret.clear);
      stopBGM();
    }
  }

  moveGhost(g) {
    if (g.behavior === 'patrol') {
      // ランダム巡回
      const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      const [dc, dr] = dirs[Math.floor(Math.random() * dirs.length)];
      const nc = g.col + dc;
      const nr = g.row + dr;
      if (nc >= 0 && nc < GRID_COLS && nr >= 0 && nr < GRID_ROWS) {
        g.col = nc;
        g.row = nr;
      }
    } else if (g.behavior === 'chase') {
      // プレイヤーに向かって一直線
      if (!this.isHiding) {
        const dc = Math.sign(this.playerCol - g.col);
        const dr = Math.sign(this.playerRow - g.row);
        if (Math.random() < 0.5 && dc !== 0) {
          g.col += dc;
        } else if (dr !== 0) {
          g.row += dr;
        }
      }
    } else if (g.behavior === 'teleport') {
      // ランダムワープ
      g.col = Math.floor(Math.random() * GRID_COLS);
      g.row = Math.floor(Math.random() * GRID_ROWS);
    }
  }

  draw(ctx) {
    const { cw, ch } = this.game;
    // 背景
    ctx.fillStyle = this.bgColor;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(0, 0, cw, ch);
    ctx.globalAlpha = 1;
    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0, 'rgba(26,0,51,0.8)');
    grad.addColorStop(1, 'rgba(0,0,30,0.9)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    // グリッド計算
    const gridX = 20;
    const gridY = 70;
    const gridW = cw - 40;
    const gridH = ch - 140;
    this.cellW = gridW / GRID_COLS;
    this.cellH = gridH / GRID_ROWS;
    this._gridX = gridX;
    this._gridY = gridY;

    // グリッド線
    ctx.strokeStyle = `rgba(255,255,255,0.1)`;
    ctx.lineWidth = 1;
    for (let c = 0; c <= GRID_COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(gridX + c * this.cellW, gridY);
      ctx.lineTo(gridX + c * this.cellW, gridY + gridH);
      ctx.stroke();
    }
    for (let r = 0; r <= GRID_ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(gridX, gridY + r * this.cellH);
      ctx.lineTo(gridX + gridW, gridY + r * this.cellH);
      ctx.stroke();
    }

    // ゴール
    this.drawEmoji(ctx, '🚪', this.goalCol, this.goalRow, 0.6);

    // 隠れ場所
    for (const spot of this.hideSpots) {
      this.drawEmoji(ctx, spot.emoji, spot.col, spot.row, 0.6);
    }

    // お化け
    for (const g of this.ghosts) {
      this.drawEmoji(ctx, g.emoji, g.col, g.row, 0.7);
    }

    // プレイヤー
    if (!this.isHiding) {
      this.drawEmoji(ctx, '👧✨', this.playerCol, this.playerRow, 0.6);
    } else {
      // 隠れているマーク
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      const cx = this._gridX + (this.playerCol + 0.5) * this.cellW;
      const cy = this._gridY + (this.playerRow + 0.5) * this.cellH;
      ctx.fillText('(隠れ中)', cx, cy + this.cellH * 0.35);
    }

    this.particles.draw(ctx);

    // 色変更カウンター
    ctx.fillStyle = '#FFF';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    const remain = Math.ceil(this.colorInterval - this.colorTimer);
    ctx.fillText(`🎨 色変更まで ${remain}秒`, cw / 2, 30);

    // 操作説明
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px sans-serif';
    ctx.fillText('タップで移動 / 隠れ場所でタップ=隠れる', cw / 2, ch - 40);

    hikari.drawWithBubble(ctx, 50, 50, 30, this.messageTimer > 0 ? this.message : null);

    // ゲームオーバー
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#FF4444';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👻 みーつけた！', cw / 2, ch / 2 - 20);
      ctx.fillStyle = '#FFF';
      ctx.font = '18px sans-serif';
      ctx.fillText('タップでやり直し', cw / 2, ch / 2 + 30);
    }

    if (this.cleared) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#00FF00';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👻 クリア！ 🌟', cw / 2, ch / 2 - 20);
      ctx.fillStyle = '#FFD700';
      ctx.font = '16px sans-serif';
      ctx.fillText('伝説のプレイヤー！', cw / 2, ch / 2 + 20);
    }
  }

  drawEmoji(ctx, emoji, col, row, scale) {
    const cx = this._gridX + (col + 0.5) * this.cellW;
    const cy = this._gridY + (row + 0.5) * this.cellH;
    const size = Math.min(this.cellW, this.cellH) * scale;
    ctx.font = `${size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, cx, cy);
  }

  onClick(x, y) {
    if (this.cleared) {
      this.game.completeStage(7);
      return;
    }
    if (this.gameOver) {
      // リスタート
      this.gameOver = false;
      this.playerCol = 0;
      this.playerRow = Math.floor(GRID_ROWS / 2);
      this.isHiding = false;
      this.ghosts = [];
      this.spawnGhosts();
      startBGM(7);
      return;
    }

    // グリッド上のタップ位置
    const col = Math.floor((x - this._gridX) / this.cellW);
    const row = Math.floor((y - this._gridY) / this.cellH);
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return;

    // 隣接セルのみ移動可能
    const dc = Math.abs(col - this.playerCol);
    const dr = Math.abs(row - this.playerRow);
    if (dc + dr !== 1 && !(dc === 0 && dr === 0)) return;

    sfxTap();

    if (dc === 0 && dr === 0) {
      // 同じセルをタップ → 隠れ場所なら隠れる/出る
      const spot = this.hideSpots.find(s => s.col === col && s.row === row);
      if (spot) {
        this.isHiding = !this.isHiding;
      }
      return;
    }

    // 移動
    this.isHiding = false;
    this.playerCol = col;
    this.playerRow = row;

    // 隠れ場所にいたら自動で隠れるオプション
    const spot = this.hideSpots.find(s => s.col === col && s.row === row);
    if (spot) {
      // 隠れ場所に着いたら案内
      this.showMessage('ここをもう1回タップで隠れる！');
    }
  }

  showMessage(msg) {
    this.message = msg;
    this.messageTimer = 2;
  }

  cleanup() { stopBGM(); }
}
