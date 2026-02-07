// main.js - ゲーム初期化・ステージ管理

import { TitleScene, StageSelectScene, StageClearScene } from './scenes.js';
import { Transition } from './ui.js';
import { hikari } from './hikari.js';
import { resumeAudio } from './audio.js';
import { Stage1Poop } from './stage1-poop.js';
import { Stage2Worm } from './stage2-worm.js';
import { Stage3Knife } from './stage3-knife.js';
import { Stage4Race } from './stage4-race.js';
import { Stage5Makeup } from './stage5-makeup.js';
import { Stage6Flush } from './stage6-flush.js';
import { SecretGhost } from './secret-ghost.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.scene = null;
    this.transition = new Transition();
    this.lastTime = 0;

    // ゲーム状態
    this.state = {
      clearedStages: new Set(),
      secretUnlocked: false,
    };

    // セーブデータ読み込み
    this.loadState();

    // Canvas サイズ
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // 入力
    this.setupInput();

    // 開始
    this.setScene(new TitleScene(this));
    requestAnimationFrame((t) => this.loop(t));
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.min(window.innerWidth, 480);
    const h = Math.min(window.innerHeight, 800);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._logicW = w;
    this._logicH = h;
  }

  get cw() { return this._logicW || 480; }
  get ch() { return this._logicH || 800; }

  setupInput() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches ? e.touches[0] || e.changedTouches[0] : e;
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    };

    // タッチ/クリック
    const onDown = (e) => {
      e.preventDefault();
      resumeAudio();
      const pos = getPos(e);
      if (this.scene?.onDragStart) this.scene.onDragStart(pos.x, pos.y);
      this._downPos = pos;
    };

    const onMove = (e) => {
      e.preventDefault();
      const pos = getPos(e);
      if (this.scene?.onDragMove) this.scene.onDragMove(pos.x, pos.y);
    };

    const onUp = (e) => {
      e.preventDefault();
      // エラー復帰
      if (this._hasError) {
        this._hasError = false;
        this.transition.active = false;
        this.setScene(new TitleScene(this));
        this._downPos = null;
        return;
      }
      const pos = getPos(e);
      if (this.scene?.onDragEnd) this.scene.onDragEnd(pos.x, pos.y);
      // クリック判定
      if (this._downPos) {
        const dx = pos.x - this._downPos.x;
        const dy = pos.y - this._downPos.y;
        if (dx * dx + dy * dy < 400) { // 20px以内ならクリック
          if (this.scene?.onClick) this.scene.onClick(pos.x, pos.y);
        }
      }
      this._downPos = null;
    };

    this.canvas.addEventListener('mousedown', onDown);
    this.canvas.addEventListener('mousemove', onMove);
    this.canvas.addEventListener('mouseup', onUp);
    this.canvas.addEventListener('touchstart', onDown, { passive: false });
    this.canvas.addEventListener('touchmove', onMove, { passive: false });
    this.canvas.addEventListener('touchend', onUp, { passive: false });

    // キーボード（レース用）
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.scene?.onDragStart) this.scene.onDragStart(0, 0);
        if (this.scene?.onClick) this.scene.onClick(this.cw / 2, this.ch / 2);
      }
    });
    document.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        if (this.scene?.onDragEnd) this.scene.onDragEnd(0, 0);
      }
    });
  }

  setScene(scene) {
    if (this.scene?.cleanup) this.scene.cleanup();
    this.scene = scene;
  }

  startStage(stageId) {
    this.transition.start(() => {
      const stageMap = {
        1: Stage1Poop,
        2: Stage2Worm,
        3: Stage3Knife,
        4: Stage4Race,
        5: Stage5Makeup,
        6: Stage6Flush,
        7: SecretGhost,
      };
      const StageClass = stageMap[stageId];
      if (StageClass) {
        this.setScene(new StageClass(this));
      }
    });
  }

  completeStage(stageId) {
    this.state.clearedStages.add(stageId);
    this.saveState();
    this.transition.start(() => {
      this.setScene(new StageClearScene(this, stageId));
    });
  }

  loop(time) {
    requestAnimationFrame((t) => this.loop(t));

    const dt = Math.min(0.05, (time - this.lastTime) / 1000);
    this.lastTime = time;

    // クリア
    this.ctx.clearRect(0, 0, this.cw, this.ch);

    try {
      // 更新
      if (this.scene?.update) this.scene.update(dt);
      this.transition.update(dt);

      // 描画
      if (this.scene?.draw) this.scene.draw(this.ctx);
      this.transition.draw(this.ctx, this.cw, this.ch);
    } catch (e) {
      console.error('Game loop error:', e);
      // エラー時はシーンをリセットしてステージ選択に戻す
      this.ctx.fillStyle = '#1a0533';
      this.ctx.fillRect(0, 0, this.cw, this.ch);
      this.ctx.fillStyle = '#FF4444';
      this.ctx.font = 'bold 16px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('エラーが発生しました', this.cw / 2, this.ch / 2 - 10);
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = '14px sans-serif';
      this.ctx.fillText('タップでメニューに戻る', this.cw / 2, this.ch / 2 + 20);
      this._hasError = true;
    }
  }

  saveState() {
    const data = {
      clearedStages: [...this.state.clearedStages],
      secretUnlocked: this.state.secretUnlocked,
    };
    try {
      localStorage.setItem('hikari-game-save', JSON.stringify(data));
    } catch (e) { /* ignore */ }
  }

  loadState() {
    try {
      const raw = localStorage.getItem('hikari-game-save');
      if (raw) {
        const data = JSON.parse(raw);
        this.state.clearedStages = new Set(data.clearedStages || []);
        this.state.secretUnlocked = data.secretUnlocked || false;
      }
    } catch (e) { /* ignore */ }
  }
}

// 起動
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
