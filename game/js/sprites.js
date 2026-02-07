// sprites.js - オリジナルCanvas 2Dスプライト描画モジュール

const registry = {};

function register(id, drawFn) {
  registry[id] = drawFn;
}

export function drawSprite(ctx, id, x, y, size, opts = {}) {
  const fn = registry[id];
  if (!fn) {
    // フォールバック: ピンクの丸（デバッグ用）
    ctx.save();
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.arc(x, y, size / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = `${Math.max(8, size * 0.25)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(id, x, y);
    ctx.restore();
    return;
  }
  ctx.save();
  fn(ctx, x, y, size, opts);
  ctx.restore();
}

// ============================================================
// ヘルパー関数
// ============================================================

function star5(ctx, cx, cy, outerR, innerR) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (Math.PI / 2) * -1 + (Math.PI / 5) * i;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function heartPath(ctx, cx, cy, size) {
  const s = size / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.4);
  ctx.bezierCurveTo(cx - s, cy - s * 0.2, cx - s * 0.5, cy - s, cx, cy - s * 0.4);
  ctx.bezierCurveTo(cx + s * 0.5, cy - s, cx + s, cy - s * 0.2, cx, cy + s * 0.4);
  ctx.closePath();
}

// ============================================================
// キャラクター
// ============================================================

register('hikari', (ctx, x, y, size) => {
  const r = size / 2;
  // 髪（後ろ）
  ctx.fillStyle = '#8B5E3C';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.05, r * 0.95, 0, Math.PI * 2);
  ctx.fill();
  // ツインテール
  ctx.beginPath();
  ctx.ellipse(x - r * 0.75, y + r * 0.15, r * 0.22, r * 0.4, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.75, y + r * 0.15, r * 0.22, r * 0.4, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // 顔
  ctx.fillStyle = '#FFDAB9';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.78, 0, Math.PI * 2);
  ctx.fill();
  // 前髪
  ctx.fillStyle = '#8B5E3C';
  ctx.beginPath();
  ctx.ellipse(x, y - r * 0.35, r * 0.72, r * 0.38, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // ヘアゴム（ピンク）
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.arc(x - r * 0.6, y - r * 0.05, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.6, y - r * 0.05, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // 目
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.25, y - r * 0.02, r * 0.09, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.25, y - r * 0.02, r * 0.09, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  // ハイライト
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(x - r * 0.22, y - r * 0.06, r * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.28, y - r * 0.06, r * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // ほっぺ
  ctx.fillStyle = 'rgba(255,150,150,0.4)';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.38, y + r * 0.15, r * 0.12, r * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.38, y + r * 0.15, r * 0.12, r * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  // 口
  ctx.strokeStyle = '#E07070';
  ctx.lineWidth = Math.max(1, r * 0.05);
  ctx.beginPath();
  ctx.arc(x, y + r * 0.25, r * 0.13, 0.2, Math.PI - 0.2);
  ctx.stroke();
});

register('boy', (ctx, x, y, size) => {
  const r = size / 2;
  // 髪
  ctx.fillStyle = '#4A3728';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.1, r * 0.88, 0, Math.PI * 2);
  ctx.fill();
  // 顔
  ctx.fillStyle = '#FFDAB9';
  ctx.beginPath();
  ctx.arc(x, y + r * 0.05, r * 0.72, 0, Math.PI * 2);
  ctx.fill();
  // 前髪（ギザギザ短め）
  ctx.fillStyle = '#4A3728';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.6, y - r * 0.15);
  ctx.lineTo(x - r * 0.3, y - r * 0.45);
  ctx.lineTo(x - r * 0.1, y - r * 0.2);
  ctx.lineTo(x + r * 0.15, y - r * 0.5);
  ctx.lineTo(x + r * 0.35, y - r * 0.2);
  ctx.lineTo(x + r * 0.6, y - r * 0.15);
  ctx.arc(x, y - r * 0.1, r * 0.88, -0.3, Math.PI + 0.3, true);
  ctx.fill();
  // 目
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x - r * 0.22, y + r * 0.02, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.22, y + r * 0.02, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  // 口
  ctx.strokeStyle = '#C06050';
  ctx.lineWidth = Math.max(1, r * 0.05);
  ctx.beginPath();
  ctx.arc(x, y + r * 0.28, r * 0.1, 0.2, Math.PI - 0.2);
  ctx.stroke();
});

register('girl-ribbon', (ctx, x, y, size) => {
  const r = size / 2;
  // 髪（後ろ）
  ctx.fillStyle = '#6B3A2A';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.05, r * 0.92, 0, Math.PI * 2);
  ctx.fill();
  // サイドの髪
  ctx.beginPath();
  ctx.ellipse(x - r * 0.6, y + r * 0.25, r * 0.18, r * 0.35, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.6, y + r * 0.25, r * 0.18, r * 0.35, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // 顔
  ctx.fillStyle = '#FFDAB9';
  ctx.beginPath();
  ctx.arc(x, y + r * 0.02, r * 0.73, 0, Math.PI * 2);
  ctx.fill();
  // 前髪
  ctx.fillStyle = '#6B3A2A';
  ctx.beginPath();
  ctx.ellipse(x, y - r * 0.35, r * 0.68, r * 0.35, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // リボン（赤）
  ctx.fillStyle = '#FF3333';
  ctx.beginPath();
  ctx.moveTo(x + r * 0.15, y - r * 0.65);
  ctx.quadraticCurveTo(x + r * 0.5, y - r * 0.9, x + r * 0.55, y - r * 0.65);
  ctx.quadraticCurveTo(x + r * 0.5, y - r * 0.55, x + r * 0.15, y - r * 0.65);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + r * 0.15, y - r * 0.65);
  ctx.quadraticCurveTo(x - r * 0.15, y - r * 0.9, x - r * 0.2, y - r * 0.65);
  ctx.quadraticCurveTo(x - r * 0.15, y - r * 0.55, x + r * 0.15, y - r * 0.65);
  ctx.fill();
  // リボン中心
  ctx.fillStyle = '#CC0000';
  ctx.beginPath();
  ctx.arc(x + r * 0.15, y - r * 0.65, r * 0.06, 0, Math.PI * 2);
  ctx.fill();
  // 目
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.22, y + r * 0.0, r * 0.08, r * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.22, y + r * 0.0, r * 0.08, r * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // ほっぺ
  ctx.fillStyle = 'rgba(255,150,150,0.35)';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.35, y + r * 0.18, r * 0.1, r * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.35, y + r * 0.18, r * 0.1, r * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  // 口
  ctx.strokeStyle = '#E07070';
  ctx.lineWidth = Math.max(1, r * 0.05);
  ctx.beginPath();
  ctx.arc(x, y + r * 0.28, r * 0.1, 0.2, Math.PI - 0.2);
  ctx.stroke();
});

register('robot', (ctx, x, y, size) => {
  const r = size / 2;
  // アンテナ
  ctx.strokeStyle = '#999';
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.7);
  ctx.lineTo(x, y - r * 0.95);
  ctx.stroke();
  ctx.fillStyle = '#FF4444';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.95, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // 頭（四角め）
  const hw = r * 0.75, hh = r * 0.7;
  ctx.fillStyle = '#B0C4DE';
  ctx.beginPath();
  ctx.moveTo(x - hw, y - hh + r * 0.15);
  ctx.arcTo(x - hw, y - hh, x - hw + r * 0.15, y - hh, r * 0.15);
  ctx.lineTo(x + hw - r * 0.15, y - hh);
  ctx.arcTo(x + hw, y - hh, x + hw, y - hh + r * 0.15, r * 0.15);
  ctx.lineTo(x + hw, y + hh - r * 0.15);
  ctx.arcTo(x + hw, y + hh, x + hw - r * 0.15, y + hh, r * 0.15);
  ctx.lineTo(x - hw + r * 0.15, y + hh);
  ctx.arcTo(x - hw, y + hh, x - hw, y + hh - r * 0.15, r * 0.15);
  ctx.closePath();
  ctx.fill();
  // 目（LEDっぽい）
  ctx.fillStyle = '#00FF88';
  ctx.beginPath();
  ctx.arc(x - r * 0.25, y - r * 0.05, r * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.25, y - r * 0.05, r * 0.13, 0, Math.PI * 2);
  ctx.fill();
  // 目の中心
  ctx.fillStyle = '#005533';
  ctx.beginPath();
  ctx.arc(x - r * 0.25, y - r * 0.05, r * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.25, y - r * 0.05, r * 0.06, 0, Math.PI * 2);
  ctx.fill();
  // 口（直線）
  ctx.strokeStyle = '#555';
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.beginPath();
  ctx.moveTo(x - r * 0.2, y + r * 0.3);
  ctx.lineTo(x + r * 0.2, y + r * 0.3);
  ctx.stroke();
});

register('cat', (ctx, x, y, size) => {
  const r = size / 2;
  // 耳
  ctx.fillStyle = '#F5A623';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.6, y - r * 0.3);
  ctx.lineTo(x - r * 0.4, y - r * 0.9);
  ctx.lineTo(x - r * 0.1, y - r * 0.4);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + r * 0.6, y - r * 0.3);
  ctx.lineTo(x + r * 0.4, y - r * 0.9);
  ctx.lineTo(x + r * 0.1, y - r * 0.4);
  ctx.fill();
  // 耳内側
  ctx.fillStyle = '#FFD4E8';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.52, y - r * 0.35);
  ctx.lineTo(x - r * 0.4, y - r * 0.72);
  ctx.lineTo(x - r * 0.2, y - r * 0.42);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + r * 0.52, y - r * 0.35);
  ctx.lineTo(x + r * 0.4, y - r * 0.72);
  ctx.lineTo(x + r * 0.2, y - r * 0.42);
  ctx.fill();
  // 顔
  ctx.fillStyle = '#F5A623';
  ctx.beginPath();
  ctx.arc(x, y + r * 0.05, r * 0.7, 0, Math.PI * 2);
  ctx.fill();
  // 目
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.22, y, r * 0.08, r * 0.11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.22, y, r * 0.08, r * 0.11, 0, 0, Math.PI * 2);
  ctx.fill();
  // 鼻
  ctx.fillStyle = '#FF9999';
  ctx.beginPath();
  ctx.moveTo(x, y + r * 0.1);
  ctx.lineTo(x - r * 0.06, y + r * 0.18);
  ctx.lineTo(x + r * 0.06, y + r * 0.18);
  ctx.fill();
  // ヒゲ
  ctx.strokeStyle = '#666';
  ctx.lineWidth = Math.max(0.5, r * 0.025);
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + side * r * 0.15, y + r * 0.15);
    ctx.lineTo(x + side * r * 0.6, y + r * 0.08);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + side * r * 0.15, y + r * 0.2);
    ctx.lineTo(x + side * r * 0.6, y + r * 0.22);
    ctx.stroke();
  }
  // 口
  ctx.strokeStyle = '#666';
  ctx.lineWidth = Math.max(0.5, r * 0.03);
  ctx.beginPath();
  ctx.moveTo(x, y + r * 0.18);
  ctx.lineTo(x, y + r * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - r * 0.08, y + r * 0.32, r * 0.08, Math.PI * 1.8, Math.PI * 1.2, true);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + r * 0.08, y + r * 0.32, r * 0.08, Math.PI * 1.8, Math.PI * 0.8);
  ctx.stroke();
});

register('rabbit', (ctx, x, y, size) => {
  const r = size / 2;
  // 長耳
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.25, y - r * 0.75, r * 0.15, r * 0.45, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.25, y - r * 0.75, r * 0.15, r * 0.45, 0.15, 0, Math.PI * 2);
  ctx.fill();
  // 耳内側
  ctx.fillStyle = '#FFB8C8';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.25, y - r * 0.75, r * 0.08, r * 0.32, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.25, y - r * 0.75, r * 0.08, r * 0.32, 0.15, 0, Math.PI * 2);
  ctx.fill();
  // 顔
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(x, y + r * 0.05, r * 0.65, 0, Math.PI * 2);
  ctx.fill();
  // 目
  ctx.fillStyle = '#E05070';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.2, y, r * 0.07, r * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.2, y, r * 0.07, r * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // 鼻（ピンク丸）
  ctx.fillStyle = '#FF8899';
  ctx.beginPath();
  ctx.arc(x, y + r * 0.15, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  // 口
  ctx.strokeStyle = '#CC6677';
  ctx.lineWidth = Math.max(0.5, r * 0.03);
  ctx.beginPath();
  ctx.arc(x, y + r * 0.25, r * 0.06, 0.2, Math.PI - 0.2);
  ctx.stroke();
});

register('oni', (ctx, x, y, size) => {
  const r = size / 2;
  // 角
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.3, y - r * 0.5);
  ctx.lineTo(x - r * 0.2, y - r * 0.95);
  ctx.lineTo(x - r * 0.05, y - r * 0.5);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + r * 0.3, y - r * 0.5);
  ctx.lineTo(x + r * 0.2, y - r * 0.95);
  ctx.lineTo(x + r * 0.05, y - r * 0.5);
  ctx.fill();
  // 顔（赤）
  ctx.fillStyle = '#DD3333';
  ctx.beginPath();
  ctx.arc(x, y + r * 0.05, r * 0.7, 0, Math.PI * 2);
  ctx.fill();
  // 目
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(x - r * 0.22, y - r * 0.02, r * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.22, y - r * 0.02, r * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(x - r * 0.22, y, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.22, y, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  // 牙
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.2, y + r * 0.25);
  ctx.lineTo(x - r * 0.12, y + r * 0.45);
  ctx.lineTo(x - r * 0.04, y + r * 0.25);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + r * 0.04, y + r * 0.25);
  ctx.lineTo(x + r * 0.12, y + r * 0.45);
  ctx.lineTo(x + r * 0.2, y + r * 0.25);
  ctx.fill();
  // 口
  ctx.strokeStyle = '#800000';
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.beginPath();
  ctx.arc(x, y + r * 0.28, r * 0.2, 0.1, Math.PI - 0.1);
  ctx.stroke();
});

// ============================================================
// ステージ1: うんこ集め
// ============================================================

register('poop', (ctx, x, y, size) => {
  const r = size / 2;
  ctx.fillStyle = '#8B6040';
  // 下段
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.3, r * 0.65, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  // 中段
  ctx.beginPath();
  ctx.ellipse(x + r * 0.03, y + r * 0.0, r * 0.45, r * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  // 上段（先端）
  ctx.beginPath();
  ctx.ellipse(x + r * 0.08, y - r * 0.28, r * 0.22, r * 0.18, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // 目
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(x - r * 0.15, y + r * 0.02, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.18, y + r * 0.02, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x - r * 0.14, y + r * 0.04, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.19, y + r * 0.04, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // 笑顔
  ctx.strokeStyle = '#5A3820';
  ctx.lineWidth = Math.max(1, r * 0.04);
  ctx.beginPath();
  ctx.arc(x + r * 0.02, y + r * 0.18, r * 0.11, 0.2, Math.PI - 0.2);
  ctx.stroke();
});

register('golden-poop', (ctx, x, y, size) => {
  const r = size / 2;
  // 光彩
  ctx.fillStyle = 'rgba(255,215,0,0.2)';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  // 本体（金色）
  ctx.fillStyle = '#DAA520';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.3, r * 0.65, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.03, y + r * 0.0, r * 0.45, r * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.08, y - r * 0.28, r * 0.22, r * 0.18, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // ハイライト
  ctx.fillStyle = 'rgba(255,255,200,0.5)';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.15, y - r * 0.1, r * 0.12, r * 0.08, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // 目
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(x - r * 0.15, y + r * 0.02, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.18, y + r * 0.02, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x - r * 0.14, y + r * 0.04, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.19, y + r * 0.04, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // 笑顔
  ctx.strokeStyle = '#7A6820';
  ctx.lineWidth = Math.max(1, r * 0.04);
  ctx.beginPath();
  ctx.arc(x + r * 0.02, y + r * 0.18, r * 0.11, 0.2, Math.PI - 0.2);
  ctx.stroke();
});

register('bomb', (ctx, x, y, size) => {
  const r = size / 2;
  // 本体
  ctx.fillStyle = '#2A2A2A';
  ctx.beginPath();
  ctx.arc(x, y + r * 0.1, r * 0.6, 0, Math.PI * 2);
  ctx.fill();
  // ハイライト
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.arc(x - r * 0.15, y - r * 0.05, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  // 導火線
  ctx.strokeStyle = '#8B7355';
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.beginPath();
  ctx.moveTo(x + r * 0.1, y - r * 0.45);
  ctx.quadraticCurveTo(x + r * 0.3, y - r * 0.7, x + r * 0.05, y - r * 0.85);
  ctx.stroke();
  // 火花
  ctx.fillStyle = '#FF6600';
  ctx.beginPath();
  ctx.arc(x + r * 0.05, y - r * 0.88, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFCC00';
  ctx.beginPath();
  ctx.arc(x + r * 0.05, y - r * 0.88, r * 0.06, 0, Math.PI * 2);
  ctx.fill();
});

register('explosion', (ctx, x, y, size) => {
  const r = size / 2;
  // 外側（オレンジ）
  ctx.fillStyle = '#FF6600';
  star5(ctx, x, y, r, r * 0.4);
  ctx.fill();
  // 内側（黄色）
  ctx.fillStyle = '#FFCC00';
  star5(ctx, x, y, r * 0.6, r * 0.25);
  ctx.fill();
});

// ============================================================
// ステージ2: ミミズ切り
// ============================================================

register('worm-head', (ctx, x, y, size) => {
  const r = size / 2;
  ctx.fillStyle = '#E8829B';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
  ctx.fill();
  // 目
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x - r * 0.2, y - r * 0.1, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.2, y - r * 0.1, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(x - r * 0.17, y - r * 0.13, r * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.23, y - r * 0.13, r * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // ほっぺ
  ctx.fillStyle = 'rgba(255,120,150,0.3)';
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y + r * 0.1, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.35, y + r * 0.1, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
});

register('lightning', (ctx, x, y, size) => {
  const r = size / 2;
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.1, y - r * 0.8);
  ctx.lineTo(x + r * 0.4, y - r * 0.8);
  ctx.lineTo(x + r * 0.05, y - r * 0.1);
  ctx.lineTo(x + r * 0.4, y - r * 0.1);
  ctx.lineTo(x - r * 0.15, y + r * 0.8);
  ctx.lineTo(x + r * 0.05, y + r * 0.05);
  ctx.lineTo(x - r * 0.35, y + r * 0.05);
  ctx.closePath();
  ctx.fill();
});

// ============================================================
// ステージ3: ガチャ＆鬼ごっこ
// ============================================================

register('gacha-machine', (ctx, x, y, size) => {
  const r = size / 2;
  // 台座
  ctx.fillStyle = '#DD4444';
  ctx.fillRect(x - r * 0.5, y + r * 0.2, r * 1.0, r * 0.5);
  // ガラスドーム
  ctx.fillStyle = 'rgba(200,230,255,0.6)';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.1, r * 0.55, Math.PI, 0);
  ctx.lineTo(x + r * 0.55, y + r * 0.2);
  ctx.lineTo(x - r * 0.55, y + r * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#CC3333';
  ctx.lineWidth = Math.max(1, r * 0.05);
  ctx.stroke();
  // カプセル（中身）
  const colors = ['#FF6699', '#66CC99', '#6699FF', '#FFCC33'];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.arc(x - r * 0.2 + i * r * 0.15, y + r * 0.05 - (i % 2) * r * 0.15, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  // 取り出し口
  ctx.fillStyle = '#222';
  ctx.fillRect(x - r * 0.15, y + r * 0.5, r * 0.3, r * 0.15);
});

register('coin', (ctx, x, y, size) => {
  const r = size / 2;
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.65, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#DAA520';
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.stroke();
  ctx.fillStyle = '#B8860B';
  ctx.font = `bold ${r * 0.7}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('¥', x, y);
});

register('swords', (ctx, x, y, size) => {
  const r = size / 2;
  ctx.strokeStyle = '#AAA';
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  // 左の剣
  ctx.beginPath();
  ctx.moveTo(x - r * 0.5, y + r * 0.5);
  ctx.lineTo(x + r * 0.3, y - r * 0.6);
  ctx.stroke();
  // 右の剣
  ctx.beginPath();
  ctx.moveTo(x + r * 0.5, y + r * 0.5);
  ctx.lineTo(x - r * 0.3, y - r * 0.6);
  ctx.stroke();
  // 鍔（つば）
  ctx.fillStyle = '#DAA520';
  ctx.fillRect(x - r * 0.45, y + r * 0.15, r * 0.25, r * 0.08);
  ctx.fillRect(x + r * 0.2, y + r * 0.15, r * 0.25, r * 0.08);
  // 先端
  ctx.fillStyle = '#DDD';
  ctx.beginPath();
  ctx.moveTo(x + r * 0.3, y - r * 0.6);
  ctx.lineTo(x + r * 0.35, y - r * 0.75);
  ctx.lineTo(x + r * 0.25, y - r * 0.6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - r * 0.3, y - r * 0.6);
  ctx.lineTo(x - r * 0.35, y - r * 0.75);
  ctx.lineTo(x - r * 0.25, y - r * 0.6);
  ctx.fill();
});

register('drum', (ctx, x, y, size) => {
  const r = size / 2;
  // 胴体
  ctx.fillStyle = '#CC3333';
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.6, r * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // 皮（上面）
  ctx.fillStyle = '#F5E6D0';
  ctx.beginPath();
  ctx.ellipse(x, y - r * 0.15, r * 0.55, r * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#AA2222';
  ctx.lineWidth = Math.max(1, r * 0.04);
  ctx.stroke();
  // 装飾線
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = Math.max(1, r * 0.04);
  ctx.beginPath();
  ctx.moveTo(x - r * 0.5, y - r * 0.05);
  ctx.lineTo(x + r * 0.5, y - r * 0.05);
  ctx.stroke();
  // バチ
  ctx.strokeStyle = '#DEB887';
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.beginPath();
  ctx.moveTo(x - r * 0.3, y - r * 0.6);
  ctx.lineTo(x + r * 0.1, y - r * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + r * 0.5, y - r * 0.6);
  ctx.lineTo(x + r * 0.1, y - r * 0.1);
  ctx.stroke();
});

// ============================================================
// ステージ4: バイクレース
// ============================================================

register('bike', (ctx, x, y, size) => {
  const r = size / 2;
  // 後輪
  ctx.strokeStyle = '#333';
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y + r * 0.3, r * 0.28, 0, Math.PI * 2);
  ctx.stroke();
  // 前輪
  ctx.beginPath();
  ctx.arc(x + r * 0.4, y + r * 0.3, r * 0.28, 0, Math.PI * 2);
  ctx.stroke();
  // フレーム
  ctx.strokeStyle = '#FF4444';
  ctx.lineWidth = Math.max(1.5, r * 0.08);
  ctx.beginPath();
  ctx.moveTo(x - r * 0.35, y + r * 0.3);
  ctx.lineTo(x, y - r * 0.1);
  ctx.lineTo(x + r * 0.4, y + r * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.1);
  ctx.lineTo(x + r * 0.45, y - r * 0.15);
  ctx.stroke();
  // シート
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.05, y - r * 0.15, r * 0.18, r * 0.07, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // ハンドル
  ctx.strokeStyle = '#888';
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.beginPath();
  ctx.moveTo(x + r * 0.4, y - r * 0.3);
  ctx.lineTo(x + r * 0.5, y - r * 0.4);
  ctx.stroke();
});

register('bird', (ctx, x, y, size) => {
  const r = size / 2;
  // 体
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.5, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  // 左翼
  ctx.beginPath();
  ctx.moveTo(x - r * 0.2, y - r * 0.1);
  ctx.quadraticCurveTo(x - r * 0.8, y - r * 0.7, x - r * 0.6, y);
  ctx.lineTo(x - r * 0.2, y);
  ctx.fill();
  // 右翼
  ctx.beginPath();
  ctx.moveTo(x + r * 0.2, y - r * 0.1);
  ctx.quadraticCurveTo(x + r * 0.8, y - r * 0.7, x + r * 0.6, y);
  ctx.lineTo(x + r * 0.2, y);
  ctx.fill();
  // 目
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x + r * 0.15, y - r * 0.08, r * 0.06, 0, Math.PI * 2);
  ctx.fill();
  // くちばし
  ctx.fillStyle = '#FF9900';
  ctx.beginPath();
  ctx.moveTo(x + r * 0.45, y);
  ctx.lineTo(x + r * 0.65, y + r * 0.05);
  ctx.lineTo(x + r * 0.45, y + r * 0.1);
  ctx.fill();
});

register('mountain', (ctx, x, y, size) => {
  const r = size / 2;
  // 山本体
  ctx.fillStyle = '#6B8E6B';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.8, y + r * 0.6);
  ctx.lineTo(x, y - r * 0.7);
  ctx.lineTo(x + r * 0.8, y + r * 0.6);
  ctx.closePath();
  ctx.fill();
  // 雪冠
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.2, y - r * 0.35);
  ctx.lineTo(x, y - r * 0.7);
  ctx.lineTo(x + r * 0.2, y - r * 0.35);
  ctx.lineTo(x + r * 0.1, y - r * 0.25);
  ctx.lineTo(x - r * 0.05, y - r * 0.3);
  ctx.lineTo(x - r * 0.15, y - r * 0.22);
  ctx.closePath();
  ctx.fill();
});

register('cloud', (ctx, x, y, size) => {
  const r = size / 2;
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y + r * 0.1, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.25, y + r * 0.1, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y - r * 0.1, r * 0.38, 0, Math.PI * 2);
  ctx.fill();
});

register('rainbow', (ctx, x, y, size) => {
  const r = size / 2;
  const colors = ['#FF0000', '#FF7700', '#FFFF00', '#00CC00', '#0077FF', '#4400CC', '#8800CC'];
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = colors[i];
    ctx.lineWidth = Math.max(1.5, r * 0.1);
    ctx.beginPath();
    ctx.arc(x, y + r * 0.3, r * 0.8 - i * r * 0.08, Math.PI, 0);
    ctx.stroke();
  }
});

register('finish-flag', (ctx, x, y, size) => {
  const r = size / 2;
  // ポール
  ctx.strokeStyle = '#666';
  ctx.lineWidth = Math.max(1.5, r * 0.06);
  ctx.beginPath();
  ctx.moveTo(x - r * 0.4, y - r * 0.8);
  ctx.lineTo(x - r * 0.4, y + r * 0.8);
  ctx.stroke();
  // 旗（チェッカー）
  const fw = r * 0.7, fh = r * 0.55;
  const fx = x - r * 0.4, fy = y - r * 0.8;
  const cs = fw / 4;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? '#111' : '#FFF';
      ctx.fillRect(fx + col * cs, fy + row * (fh / 3), cs, fh / 3);
    }
  }
  ctx.strokeStyle = '#333';
  ctx.lineWidth = Math.max(0.5, r * 0.02);
  ctx.strokeRect(fx, fy, fw, fh);
});

// ============================================================
// ステージ5: メイク
// ============================================================

register('lipstick', (ctx, x, y, size) => {
  const r = size / 2;
  // ケース
  ctx.fillStyle = '#333';
  ctx.fillRect(x - r * 0.15, y, r * 0.3, r * 0.6);
  // 金帯
  ctx.fillStyle = '#DAA520';
  ctx.fillRect(x - r * 0.16, y - r * 0.02, r * 0.32, r * 0.1);
  // リップ部分
  ctx.fillStyle = '#FF2244';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.13, y);
  ctx.lineTo(x - r * 0.13, y - r * 0.35);
  ctx.quadraticCurveTo(x, y - r * 0.55, x + r * 0.13, y - r * 0.35);
  ctx.lineTo(x + r * 0.13, y);
  ctx.closePath();
  ctx.fill();
});

register('eye', (ctx, x, y, size) => {
  const r = size / 2;
  // 白目
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.65, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = Math.max(1, r * 0.05);
  ctx.stroke();
  // 虹彩
  ctx.fillStyle = '#6B4226';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  // 瞳孔
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.15, 0, Math.PI * 2);
  ctx.fill();
  // ハイライト
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(x + r * 0.1, y - r * 0.1, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
});

register('pencil', (ctx, x, y, size) => {
  const r = size / 2;
  // 本体
  ctx.fillStyle = '#FFD700';
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.3);
  ctx.fillRect(-r * 0.12, -r * 0.5, r * 0.24, r * 0.75);
  // 金属部分
  ctx.fillStyle = '#CCC';
  ctx.fillRect(-r * 0.13, r * 0.2, r * 0.26, r * 0.12);
  // 消しゴム
  ctx.fillStyle = '#FF8888';
  ctx.fillRect(-r * 0.11, r * 0.3, r * 0.22, r * 0.12);
  // 先端
  ctx.fillStyle = '#FFDAB9';
  ctx.beginPath();
  ctx.moveTo(-r * 0.12, -r * 0.5);
  ctx.lineTo(0, -r * 0.7);
  ctx.lineTo(r * 0.12, -r * 0.5);
  ctx.fill();
  // 芯
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(-r * 0.03, -r * 0.55);
  ctx.lineTo(0, -r * 0.7);
  ctx.lineTo(r * 0.03, -r * 0.55);
  ctx.fill();
  ctx.restore();
});

register('palette', (ctx, x, y, size) => {
  const r = size / 2;
  // パレット本体
  ctx.fillStyle = '#DEB887';
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.75, r * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  // 穴
  ctx.fillStyle = '#C8A870';
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y + r * 0.15, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  // 絵の具
  const colors = ['#FF3333', '#3366FF', '#FFCC00', '#33CC33', '#FF66CC'];
  const positions = [
    [-0.1, -0.3], [0.25, -0.2], [0.4, 0.05], [0.2, 0.25], [-0.25, 0.1],
  ];
  for (let i = 0; i < colors.length; i++) {
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.arc(x + positions[i][0] * r, y + positions[i][1] * r, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
});

register('heart', (ctx, x, y, size) => {
  ctx.fillStyle = '#FF4466';
  heartPath(ctx, x, y, size);
  ctx.fill();
});

register('trophy', (ctx, x, y, size) => {
  const r = size / 2;
  // カップ本体
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.35, y - r * 0.5);
  ctx.lineTo(x - r * 0.25, y + r * 0.15);
  ctx.quadraticCurveTo(x, y + r * 0.3, x + r * 0.25, y + r * 0.15);
  ctx.lineTo(x + r * 0.35, y - r * 0.5);
  ctx.closePath();
  ctx.fill();
  // 持ち手
  ctx.strokeStyle = '#DAA520';
  ctx.lineWidth = Math.max(1, r * 0.07);
  ctx.beginPath();
  ctx.arc(x - r * 0.45, y - r * 0.15, r * 0.18, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + r * 0.45, y - r * 0.15, r * 0.18, Math.PI * 0.5, -Math.PI * 0.5);
  ctx.stroke();
  // 台座
  ctx.fillStyle = '#DAA520';
  ctx.fillRect(x - r * 0.08, y + r * 0.15, r * 0.16, r * 0.2);
  ctx.fillRect(x - r * 0.25, y + r * 0.32, r * 0.5, r * 0.1);
  // 星
  ctx.fillStyle = '#FFF8DC';
  star5(ctx, x, y - r * 0.15, r * 0.12, r * 0.05);
  ctx.fill();
});

// ============================================================
// ステージ6: トイレ
// ============================================================

register('toilet', (ctx, x, y, size) => {
  const r = size / 2;
  // タンク
  ctx.fillStyle = '#E8E8E8';
  ctx.fillRect(x - r * 0.3, y - r * 0.7, r * 0.6, r * 0.4);
  ctx.strokeStyle = '#CCC';
  ctx.lineWidth = Math.max(1, r * 0.03);
  ctx.strokeRect(x - r * 0.3, y - r * 0.7, r * 0.6, r * 0.4);
  // レバー
  ctx.strokeStyle = '#AAA';
  ctx.lineWidth = Math.max(1, r * 0.05);
  ctx.beginPath();
  ctx.moveTo(x + r * 0.3, y - r * 0.55);
  ctx.lineTo(x + r * 0.5, y - r * 0.55);
  ctx.stroke();
  // 便座
  ctx.fillStyle = '#F5F5F5';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.15, r * 0.5, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#CCC';
  ctx.lineWidth = Math.max(1, r * 0.03);
  ctx.stroke();
  // 穴
  ctx.fillStyle = '#88BBDD';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.15, r * 0.33, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
});

register('water-drop', (ctx, x, y, size) => {
  const r = size / 2;
  ctx.fillStyle = '#4499DD';
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.6);
  ctx.quadraticCurveTo(x + r * 0.6, y + r * 0.1, x, y + r * 0.6);
  ctx.quadraticCurveTo(x - r * 0.6, y + r * 0.1, x, y - r * 0.6);
  ctx.fill();
  // ハイライト
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(x - r * 0.12, y, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
});

register('wave', (ctx, x, y, size) => {
  const r = size / 2;
  ctx.fillStyle = '#4499DD';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.8, y + r * 0.2);
  ctx.quadraticCurveTo(x - r * 0.5, y - r * 0.5, x - r * 0.15, y);
  ctx.quadraticCurveTo(x + r * 0.15, y + r * 0.4, x + r * 0.45, y - r * 0.1);
  ctx.quadraticCurveTo(x + r * 0.65, y - r * 0.4, x + r * 0.8, y + r * 0.1);
  ctx.lineTo(x + r * 0.8, y + r * 0.4);
  ctx.lineTo(x - r * 0.8, y + r * 0.4);
  ctx.closePath();
  ctx.fill();
  // 泡
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y + r * 0.15, r * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.2, y + r * 0.2, r * 0.04, 0, Math.PI * 2);
  ctx.fill();
});

register('splash', (ctx, x, y, size) => {
  const r = size / 2;
  ctx.fillStyle = '#66BBEE';
  // 中央滴
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.5);
  ctx.quadraticCurveTo(x + r * 0.2, y, x, y + r * 0.15);
  ctx.quadraticCurveTo(x - r * 0.2, y, x, y - r * 0.5);
  ctx.fill();
  // 左滴
  ctx.beginPath();
  ctx.moveTo(x - r * 0.35, y - r * 0.2);
  ctx.quadraticCurveTo(x - r * 0.2, y + r * 0.1, x - r * 0.35, y + r * 0.2);
  ctx.quadraticCurveTo(x - r * 0.5, y + r * 0.1, x - r * 0.35, y - r * 0.2);
  ctx.fill();
  // 右滴
  ctx.beginPath();
  ctx.moveTo(x + r * 0.35, y - r * 0.3);
  ctx.quadraticCurveTo(x + r * 0.5, y, x + r * 0.35, y + r * 0.1);
  ctx.quadraticCurveTo(x + r * 0.2, y, x + r * 0.35, y - r * 0.3);
  ctx.fill();
});

// ============================================================
// シークレット: おばけかくれんぼ
// ============================================================

register('ghost', (ctx, x, y, size) => {
  const r = size / 2;
  ctx.fillStyle = '#F0F0F8';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.15, r * 0.55, Math.PI, 0);
  ctx.lineTo(x + r * 0.55, y + r * 0.4);
  // 波状の裾
  ctx.quadraticCurveTo(x + r * 0.35, y + r * 0.25, x + r * 0.2, y + r * 0.4);
  ctx.quadraticCurveTo(x, y + r * 0.25, x - r * 0.2, y + r * 0.4);
  ctx.quadraticCurveTo(x - r * 0.35, y + r * 0.25, x - r * 0.55, y + r * 0.4);
  ctx.closePath();
  ctx.fill();
  // 目
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.18, y - r * 0.1, r * 0.1, r * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.18, y - r * 0.1, r * 0.1, r * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  // 口
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.12, r * 0.1, r * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
});

register('skull', (ctx, x, y, size) => {
  const r = size / 2;
  // 頭蓋骨
  ctx.fillStyle = '#F5F0E8';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.1, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
  // 顎
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.35, r * 0.35, r * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  // 目穴
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.2, y - r * 0.1, r * 0.14, r * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.2, y - r * 0.1, r * 0.14, r * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  // 鼻穴
  ctx.beginPath();
  ctx.moveTo(x, y + r * 0.08);
  ctx.lineTo(x - r * 0.06, y + r * 0.18);
  ctx.lineTo(x + r * 0.06, y + r * 0.18);
  ctx.fill();
  // 歯
  ctx.strokeStyle = '#333';
  ctx.lineWidth = Math.max(0.5, r * 0.03);
  ctx.beginPath();
  ctx.moveTo(x - r * 0.2, y + r * 0.32);
  ctx.lineTo(x + r * 0.2, y + r * 0.32);
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const tx = x - r * 0.12 + i * r * 0.12;
    ctx.beginPath();
    ctx.moveTo(tx, y + r * 0.28);
    ctx.lineTo(tx, y + r * 0.38);
    ctx.stroke();
  }
});

register('pumpkin', (ctx, x, y, size) => {
  const r = size / 2;
  // 本体
  ctx.fillStyle = '#FF8800';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.05, r * 0.65, r * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  // 溝
  ctx.strokeStyle = '#CC6600';
  ctx.lineWidth = Math.max(0.5, r * 0.03);
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.05, r * 0.25, r * 0.55, 0, 0, Math.PI * 2);
  ctx.stroke();
  // ヘタ
  ctx.fillStyle = '#336600';
  ctx.fillRect(x - r * 0.06, y - r * 0.55, r * 0.12, r * 0.18);
  // 目（三角）
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.3, y - r * 0.05);
  ctx.lineTo(x - r * 0.15, y - r * 0.25);
  ctx.lineTo(x - r * 0.02, y - r * 0.05);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + r * 0.02, y - r * 0.05);
  ctx.lineTo(x + r * 0.15, y - r * 0.25);
  ctx.lineTo(x + r * 0.3, y - r * 0.05);
  ctx.fill();
  // 口
  ctx.beginPath();
  ctx.moveTo(x - r * 0.3, y + r * 0.2);
  ctx.lineTo(x - r * 0.15, y + r * 0.3);
  ctx.lineTo(x, y + r * 0.15);
  ctx.lineTo(x + r * 0.15, y + r * 0.3);
  ctx.lineTo(x + r * 0.3, y + r * 0.2);
  ctx.fill();
});

register('door', (ctx, x, y, size) => {
  const r = size / 2;
  // ドア本体
  ctx.fillStyle = '#8B5E3C';
  ctx.fillRect(x - r * 0.4, y - r * 0.7, r * 0.8, r * 1.4);
  // フレーム
  ctx.strokeStyle = '#6B3E1C';
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.strokeRect(x - r * 0.4, y - r * 0.7, r * 0.8, r * 1.4);
  // パネル
  ctx.strokeStyle = '#7B4E2C';
  ctx.lineWidth = Math.max(0.5, r * 0.03);
  ctx.strokeRect(x - r * 0.28, y - r * 0.55, r * 0.56, r * 0.45);
  ctx.strokeRect(x - r * 0.28, y + r * 0.05, r * 0.56, r * 0.45);
  // ノブ
  ctx.fillStyle = '#DAA520';
  ctx.beginPath();
  ctx.arc(x + r * 0.22, y + r * 0.05, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
});

register('box', (ctx, x, y, size) => {
  const r = size / 2;
  // 箱本体
  ctx.fillStyle = '#D4A76A';
  ctx.fillRect(x - r * 0.55, y - r * 0.4, r * 1.1, r * 0.9);
  // 蓋
  ctx.fillStyle = '#C49756';
  ctx.fillRect(x - r * 0.6, y - r * 0.55, r * 1.2, r * 0.2);
  // テープ
  ctx.fillStyle = '#B8860B';
  ctx.fillRect(x - r * 0.08, y - r * 0.55, r * 0.16, r * 0.9);
  // 枠線
  ctx.strokeStyle = '#A07030';
  ctx.lineWidth = Math.max(0.5, r * 0.03);
  ctx.strokeRect(x - r * 0.55, y - r * 0.4, r * 1.1, r * 0.9);
});

register('tree', (ctx, x, y, size) => {
  const r = size / 2;
  // 幹
  ctx.fillStyle = '#8B5E3C';
  ctx.fillRect(x - r * 0.12, y + r * 0.05, r * 0.24, r * 0.55);
  // 葉（丸3つ）
  ctx.fillStyle = '#339933';
  ctx.beginPath();
  ctx.arc(x - r * 0.25, y - r * 0.1, r * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.25, y - r * 0.1, r * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#44AA44';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.35, r * 0.38, 0, Math.PI * 2);
  ctx.fill();
});

register('rock', (ctx, x, y, size) => {
  const r = size / 2;
  ctx.fillStyle = '#888';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.5, y + r * 0.3);
  ctx.quadraticCurveTo(x - r * 0.6, y - r * 0.1, x - r * 0.2, y - r * 0.4);
  ctx.quadraticCurveTo(x, y - r * 0.5, x + r * 0.3, y - r * 0.35);
  ctx.quadraticCurveTo(x + r * 0.6, y - r * 0.15, x + r * 0.55, y + r * 0.3);
  ctx.closePath();
  ctx.fill();
  // ハイライト
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.1, y - r * 0.15, r * 0.2, r * 0.12, -0.3, 0, Math.PI * 2);
  ctx.fill();
});

// ============================================================
// 共通UI/エフェクト
// ============================================================

register('sparkle', (ctx, x, y, size) => {
  const r = size / 2;
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = Math.max(1, r * 0.15);
  ctx.lineCap = 'round';
  // 十字キラキラ
  const len = r * 0.6;
  ctx.beginPath();
  ctx.moveTo(x, y - len);
  ctx.lineTo(x, y + len);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - len, y);
  ctx.lineTo(x + len, y);
  ctx.stroke();
  // 斜め（短い）
  const slen = len * 0.5;
  ctx.lineWidth = Math.max(0.5, r * 0.1);
  ctx.beginPath();
  ctx.moveTo(x - slen, y - slen);
  ctx.lineTo(x + slen, y + slen);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + slen, y - slen);
  ctx.lineTo(x - slen, y + slen);
  ctx.stroke();
});

register('star', (ctx, x, y, size) => {
  const r = size / 2;
  ctx.fillStyle = '#FFD700';
  star5(ctx, x, y, r * 0.75, r * 0.3);
  ctx.fill();
});

register('glow-star', (ctx, x, y, size) => {
  const r = size / 2;
  // 光彩
  ctx.fillStyle = 'rgba(255,215,0,0.25)';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFD700';
  star5(ctx, x, y, r * 0.7, r * 0.28);
  ctx.fill();
});

register('swirl-star', (ctx, x, y, size) => {
  const r = size / 2;
  // 軌跡の弧
  ctx.strokeStyle = 'rgba(255,215,0,0.4)';
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.5, 0, Math.PI * 1.5);
  ctx.stroke();
  // 星
  ctx.fillStyle = '#FFD700';
  star5(ctx, x + r * 0.5, y, r * 0.3, r * 0.12);
  ctx.fill();
});

register('portal', (ctx, x, y, size) => {
  const r = size / 2;
  const rings = 5;
  for (let i = rings; i > 0; i--) {
    const ratio = i / rings;
    ctx.strokeStyle = i % 2 === 0 ? '#9933FF' : '#FF69B4';
    ctx.globalAlpha = 0.3 + ratio * 0.5;
    ctx.lineWidth = Math.max(1.5, r * 0.08);
    ctx.beginPath();
    ctx.arc(x, y, r * ratio * 0.8, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // 中心の光
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.15, 0, Math.PI * 2);
  ctx.fill();
});

register('gamepad', (ctx, x, y, size) => {
  const r = size / 2;
  // 本体
  ctx.fillStyle = '#555';
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.7, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  // 十字キー（左）
  ctx.fillStyle = '#222';
  ctx.fillRect(x - r * 0.45, y - r * 0.06, r * 0.22, r * 0.12);
  ctx.fillRect(x - r * 0.4, y - r * 0.15, r * 0.12, r * 0.3);
  // ボタン（右）
  ctx.fillStyle = '#FF4466';
  ctx.beginPath();
  ctx.arc(x + r * 0.3, y - r * 0.08, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4488FF';
  ctx.beginPath();
  ctx.arc(x + r * 0.45, y + r * 0.02, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
});

register('lock', (ctx, x, y, size) => {
  const r = size / 2;
  // つる（上のU字）
  ctx.strokeStyle = '#888';
  ctx.lineWidth = Math.max(1.5, r * 0.12);
  ctx.beginPath();
  ctx.arc(x, y - r * 0.25, r * 0.25, Math.PI, 0);
  ctx.stroke();
  // 本体
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(x - r * 0.35, y - r * 0.1, r * 0.7, r * 0.65);
  // 鍵穴
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x, y + r * 0.1, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - r * 0.03, y + r * 0.1, r * 0.06, r * 0.18);
});

register('fire', (ctx, x, y, size) => {
  const r = size / 2;
  // 外炎（赤）
  ctx.fillStyle = '#FF4400';
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.7);
  ctx.quadraticCurveTo(x + r * 0.5, y - r * 0.2, x + r * 0.4, y + r * 0.5);
  ctx.quadraticCurveTo(x, y + r * 0.3, x - r * 0.4, y + r * 0.5);
  ctx.quadraticCurveTo(x - r * 0.5, y - r * 0.2, x, y - r * 0.7);
  ctx.fill();
  // 内炎（オレンジ）
  ctx.fillStyle = '#FF8800';
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.35);
  ctx.quadraticCurveTo(x + r * 0.3, y, x + r * 0.2, y + r * 0.35);
  ctx.quadraticCurveTo(x, y + r * 0.2, x - r * 0.2, y + r * 0.35);
  ctx.quadraticCurveTo(x - r * 0.3, y, x, y - r * 0.35);
  ctx.fill();
  // 中心（黄色）
  ctx.fillStyle = '#FFCC00';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.1, r * 0.1, r * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
});

register('celebration', (ctx, x, y, size) => {
  const r = size / 2;
  // クラッカー本体
  ctx.fillStyle = '#FF6699';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.35, y + r * 0.5);
  ctx.lineTo(x + r * 0.15, y - r * 0.2);
  ctx.lineTo(x + r * 0.3, y - r * 0.1);
  ctx.lineTo(x - r * 0.2, y + r * 0.6);
  ctx.closePath();
  ctx.fill();
  // 飛び出すもの
  const bits = [
    { dx: 0.2, dy: -0.4, color: '#FFD700' },
    { dx: 0.4, dy: -0.5, color: '#FF4466' },
    { dx: 0.5, dy: -0.2, color: '#44BBFF' },
    { dx: 0.3, dy: -0.6, color: '#66FF66' },
    { dx: 0.6, dy: -0.35, color: '#FF88CC' },
  ];
  for (const b of bits) {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(x + b.dx * r, y + b.dy * r, r * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  // 紙テープ
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = Math.max(0.5, r * 0.03);
  ctx.beginPath();
  ctx.moveTo(x + r * 0.2, y - r * 0.2);
  ctx.quadraticCurveTo(x + r * 0.5, y - r * 0.6, x + r * 0.7, y - r * 0.3);
  ctx.stroke();
  ctx.strokeStyle = '#44BBFF';
  ctx.beginPath();
  ctx.moveTo(x + r * 0.25, y - r * 0.15);
  ctx.quadraticCurveTo(x + r * 0.4, y - r * 0.5, x + r * 0.6, y - r * 0.55);
  ctx.stroke();
});

register('knife', (ctx, x, y, size) => {
  const r = size / 2;
  // 刃
  ctx.fillStyle = '#DDD';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.05, y - r * 0.7);
  ctx.lineTo(x + r * 0.15, y - r * 0.7);
  ctx.lineTo(x + r * 0.15, y + r * 0.05);
  ctx.quadraticCurveTo(x + r * 0.05, y + r * 0.15, x - r * 0.05, y + r * 0.05);
  ctx.closePath();
  ctx.fill();
  // 柄
  ctx.fillStyle = '#8B5E3C';
  ctx.fillRect(x - r * 0.1, y + r * 0.1, r * 0.3, r * 0.5);
  // ボルト
  ctx.fillStyle = '#AAA';
  ctx.beginPath();
  ctx.arc(x + r * 0.05, y + r * 0.25, r * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.05, y + r * 0.42, r * 0.04, 0, Math.PI * 2);
  ctx.fill();
});

// ============================================================
// ステージ8: 鬼滅バトル (8種)
// ============================================================

register('tanjiro', (ctx, x, y, size) => {
  const r = size / 2;
  // 羽織（市松模様 緑黒）
  ctx.fillStyle = '#2D8B4E';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.6, y + r * 0.1);
  ctx.lineTo(x - r * 0.75, y + r * 0.9);
  ctx.lineTo(x + r * 0.75, y + r * 0.9);
  ctx.lineTo(x + r * 0.6, y + r * 0.1);
  ctx.closePath();
  ctx.fill();
  // 市松模様パッチ
  ctx.fillStyle = '#1a1a1a';
  const patchSize = r * 0.18;
  for (let py = 0; py < 3; py++) {
    for (let px = 0; px < 3; px++) {
      if ((px + py) % 2 === 0) {
        ctx.fillRect(x - r * 0.5 + px * patchSize, y + r * 0.15 + py * patchSize, patchSize, patchSize);
      }
    }
  }
  // 顔
  ctx.fillStyle = '#FFDAB9';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.15, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
  // 黒髪
  ctx.fillStyle = '#2B1A0E';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.3, r * 0.42, Math.PI, 0);
  ctx.fill();
  // 額の傷
  ctx.strokeStyle = '#CC3333';
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.beginPath();
  ctx.moveTo(x - r * 0.15, y - r * 0.4);
  ctx.lineTo(x + r * 0.1, y - r * 0.25);
  ctx.stroke();
  // 目
  ctx.fillStyle = '#8B2252';
  ctx.beginPath();
  ctx.arc(x - r * 0.15, y - r * 0.12, r * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.15, y - r * 0.12, r * 0.06, 0, Math.PI * 2);
  ctx.fill();
  // 口（キリッ）
  ctx.strokeStyle = '#333';
  ctx.lineWidth = Math.max(0.5, r * 0.03);
  ctx.beginPath();
  ctx.moveTo(x - r * 0.08, y + r * 0.05);
  ctx.lineTo(x + r * 0.08, y + r * 0.05);
  ctx.stroke();
  // 耳飾り
  ctx.fillStyle = '#FF4444';
  ctx.beginPath();
  ctx.arc(x - r * 0.42, y - r * 0.05, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
});

register('demon', (ctx, x, y, size) => {
  const r = size / 2;
  // 体
  ctx.fillStyle = '#6B2D6B';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
  // 角
  ctx.fillStyle = '#8B0000';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.2, y - r * 0.5);
  ctx.lineTo(x - r * 0.1, y - r * 0.9);
  ctx.lineTo(x, y - r * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + r * 0.2, y - r * 0.5);
  ctx.lineTo(x + r * 0.3, y - r * 0.85);
  ctx.lineTo(x + r * 0.4, y - r * 0.5);
  ctx.closePath();
  ctx.fill();
  // 黄色い目
  ctx.fillStyle = '#FFDD00';
  ctx.beginPath();
  ctx.arc(x - r * 0.2, y - r * 0.1, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.2, y - r * 0.1, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // 瞳
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.arc(x - r * 0.2, y - r * 0.1, r * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.2, y - r * 0.1, r * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // 牙
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.15, y + r * 0.15);
  ctx.lineTo(x - r * 0.1, y + r * 0.35);
  ctx.lineTo(x - r * 0.05, y + r * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + r * 0.05, y + r * 0.15);
  ctx.lineTo(x + r * 0.1, y + r * 0.35);
  ctx.lineTo(x + r * 0.15, y + r * 0.15);
  ctx.closePath();
  ctx.fill();
});

register('demon-boss', (ctx, x, y, size) => {
  const r = size / 2;
  // 紫オーラ
  ctx.fillStyle = 'rgba(128,0,255,0.2)';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
  ctx.fill();
  // 体
  ctx.fillStyle = '#4B0082';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
  ctx.fill();
  // 角3本
  ctx.fillStyle = '#8B0000';
  const hornPositions = [-0.25, 0, 0.25];
  for (const hx of hornPositions) {
    ctx.beginPath();
    ctx.moveTo(x + hx * r - r * 0.06, y - r * 0.55);
    ctx.lineTo(x + hx * r, y - r * 0.95);
    ctx.lineTo(x + hx * r + r * 0.06, y - r * 0.55);
    ctx.closePath();
    ctx.fill();
  }
  // 3つの目
  ctx.fillStyle = '#FFDD00';
  ctx.beginPath();
  ctx.arc(x - r * 0.25, y - r * 0.1, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y - r * 0.2, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.25, y - r * 0.1, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // 瞳
  ctx.fillStyle = '#FF0000';
  for (const ex of [-0.25, 0, 0.25]) {
    ctx.beginPath();
    ctx.arc(x + ex * r, ex === 0 ? y - r * 0.2 : y - r * 0.1, r * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }
  // 口（裂け）
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = Math.max(1, r * 0.04);
  ctx.beginPath();
  ctx.moveTo(x - r * 0.3, y + r * 0.2);
  ctx.quadraticCurveTo(x, y + r * 0.35, x + r * 0.3, y + r * 0.2);
  ctx.stroke();
});

register('water-slash', (ctx, x, y, size) => {
  const r = size / 2;
  ctx.strokeStyle = '#4488FF';
  ctx.lineWidth = Math.max(2, r * 0.15);
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.8;
  // 3本の弧状の斬撃
  for (let i = 0; i < 3; i++) {
    const offset = (i - 1) * r * 0.25;
    ctx.beginPath();
    ctx.arc(x, y + offset, r * 0.7, Math.PI * 0.8, Math.PI * 0.2, true);
    ctx.stroke();
  }
  // 水しぶき
  ctx.fillStyle = '#88CCFF';
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const dx = Math.cos(angle) * r * 0.5;
    const dy = Math.sin(angle) * r * 0.3;
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, r * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
});

register('thunder-slash', (ctx, x, y, size) => {
  const r = size / 2;
  ctx.fillStyle = '#FFD700';
  ctx.globalAlpha = 0.9;
  // 稲妻型斬撃
  ctx.beginPath();
  ctx.moveTo(x - r * 0.1, y - r * 0.8);
  ctx.lineTo(x + r * 0.3, y - r * 0.2);
  ctx.lineTo(x + r * 0.05, y - r * 0.15);
  ctx.lineTo(x + r * 0.4, y + r * 0.6);
  ctx.lineTo(x + r * 0.1, y + r * 0.1);
  ctx.lineTo(x - r * 0.15, y + r * 0.15);
  ctx.lineTo(x - r * 0.1, y - r * 0.8);
  ctx.closePath();
  ctx.fill();
  // 光のハイライト
  ctx.fillStyle = '#FFFFAA';
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.5);
  ctx.lineTo(x + r * 0.15, y - r * 0.1);
  ctx.lineTo(x - r * 0.05, y - r * 0.05);
  ctx.lineTo(x + r * 0.2, y + r * 0.35);
  ctx.lineTo(x + r * 0.05, y + r * 0.1);
  ctx.lineTo(x - r * 0.05, y + r * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
});

register('fire-slash', (ctx, x, y, size) => {
  const r = size / 2;
  ctx.globalAlpha = 0.85;
  // 外炎
  ctx.fillStyle = '#FF4400';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.7, Math.PI * 0.7, Math.PI * 0.3, true);
  ctx.quadraticCurveTo(x + r * 0.3, y + r * 0.5, x, y + r * 0.3);
  ctx.quadraticCurveTo(x - r * 0.3, y + r * 0.5, x, y);
  ctx.closePath();
  ctx.fill();
  // 内炎
  ctx.fillStyle = '#FF8800';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.45, Math.PI * 0.8, Math.PI * 0.2, true);
  ctx.quadraticCurveTo(x + r * 0.15, y + r * 0.3, x, y + r * 0.15);
  ctx.quadraticCurveTo(x - r * 0.15, y + r * 0.3, x, y);
  ctx.closePath();
  ctx.fill();
  // 中心
  ctx.fillStyle = '#FFCC00';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.1, r * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
});

register('katana', (ctx, x, y, size) => {
  const r = size / 2;
  // 刀身（黒）
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.03, y - r * 0.85);
  ctx.lineTo(x + r * 0.06, y - r * 0.85);
  ctx.lineTo(x + r * 0.06, y + r * 0.15);
  ctx.lineTo(x - r * 0.03, y + r * 0.15);
  ctx.closePath();
  ctx.fill();
  // 刃先（先端カーブ）
  ctx.beginPath();
  ctx.moveTo(x - r * 0.03, y - r * 0.85);
  ctx.quadraticCurveTo(x + r * 0.015, y - r * 0.95, x + r * 0.06, y - r * 0.85);
  ctx.fill();
  // 刃文（白いライン）
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = Math.max(0.5, r * 0.02);
  ctx.beginPath();
  ctx.moveTo(x + r * 0.05, y - r * 0.8);
  ctx.lineTo(x + r * 0.05, y + r * 0.1);
  ctx.stroke();
  // 鍔（つば）
  ctx.fillStyle = '#888';
  ctx.fillRect(x - r * 0.12, y + r * 0.12, r * 0.27, r * 0.06);
  // 柄（白）
  ctx.fillStyle = '#F5F5F5';
  ctx.fillRect(x - r * 0.05, y + r * 0.18, r * 0.13, r * 0.55);
  // 柄巻き（菱形模様）
  ctx.strokeStyle = '#222';
  ctx.lineWidth = Math.max(0.5, r * 0.02);
  for (let i = 0; i < 5; i++) {
    const py = y + r * 0.22 + i * r * 0.1;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.05, py);
    ctx.lineTo(x + r * 0.08, py + r * 0.05);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + r * 0.08, py);
    ctx.lineTo(x - r * 0.05, py + r * 0.05);
    ctx.stroke();
  }
});

register('breath-circle', (ctx, x, y, size) => {
  const r = size / 2;
  // 外円
  ctx.strokeStyle = 'rgba(100,200,255,0.6)';
  ctx.lineWidth = Math.max(2, r * 0.08);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.8, 0, Math.PI * 2);
  ctx.stroke();
  // 内円のターゲット
  ctx.strokeStyle = 'rgba(255,200,50,0.8)';
  ctx.lineWidth = Math.max(1.5, r * 0.06);
  ctx.setLineDash([r * 0.1, r * 0.08]);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  // 中央の十字
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = Math.max(0.5, r * 0.03);
  ctx.beginPath();
  ctx.moveTo(x - r * 0.15, y);
  ctx.lineTo(x + r * 0.15, y);
  ctx.moveTo(x, y - r * 0.15);
  ctx.lineTo(x, y + r * 0.15);
  ctx.stroke();
});

// ============================================================
// ステージ9: おなら宇宙飛行
// ============================================================

register('fart-cloud', (ctx, x, y, size) => {
  const r = size / 2;
  // メインの雲（黄緑〜茶色のもくもく）
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, 'rgba(180,200,50,0.8)');
  grad.addColorStop(0.5, 'rgba(140,160,30,0.5)');
  grad.addColorStop(1, 'rgba(100,80,20,0)');
  ctx.fillStyle = grad;
  // もくもく3つの円
  ctx.beginPath();
  ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y + r * 0.1, r * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.3, y - r * 0.1, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
  // 渦巻き線
  ctx.strokeStyle = 'rgba(100,120,20,0.4)';
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.2, 0, Math.PI * 1.5);
  ctx.stroke();
});

register('meteorite', (ctx, x, y, size) => {
  const r = size / 2;
  // 本体（ゴツゴツした岩）
  ctx.fillStyle = '#8B7355';
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.6);
  ctx.lineTo(x + r * 0.5, y - r * 0.3);
  ctx.lineTo(x + r * 0.6, y + r * 0.1);
  ctx.lineTo(x + r * 0.3, y + r * 0.5);
  ctx.lineTo(x - r * 0.2, y + r * 0.6);
  ctx.lineTo(x - r * 0.55, y + r * 0.2);
  ctx.lineTo(x - r * 0.5, y - r * 0.3);
  ctx.closePath();
  ctx.fill();
  // ハイライト
  ctx.fillStyle = '#A09070';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.1, y - r * 0.4);
  ctx.lineTo(x + r * 0.3, y - r * 0.2);
  ctx.lineTo(x + r * 0.1, y + r * 0.1);
  ctx.lineTo(x - r * 0.2, y);
  ctx.closePath();
  ctx.fill();
  // クレーター
  ctx.fillStyle = '#6B5B45';
  ctx.beginPath();
  ctx.arc(x + r * 0.15, y + r * 0.15, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - r * 0.2, y - r * 0.1, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // 炎の尾（落下感）
  ctx.fillStyle = 'rgba(255,100,0,0.6)';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.3, y - r * 0.5);
  ctx.quadraticCurveTo(x - r * 0.1, y - r * 0.9, x + r * 0.2, y - r * 0.7);
  ctx.lineTo(x, y - r * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,200,0,0.4)';
  ctx.beginPath();
  ctx.moveTo(x + r * 0.1, y - r * 0.5);
  ctx.quadraticCurveTo(x + r * 0.3, y - r * 1, x + r * 0.5, y - r * 0.6);
  ctx.lineTo(x + r * 0.3, y - r * 0.3);
  ctx.closePath();
  ctx.fill();
});

register('moon', (ctx, x, y, size) => {
  const r = size / 2;
  // 月（クレセント）
  ctx.fillStyle = '#FFFACD';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
  ctx.fill();
  // 影（三日月にする）
  ctx.fillStyle = '#1a0533';
  ctx.beginPath();
  ctx.arc(x + r * 0.25, y - r * 0.1, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
  // 光るエフェクト
  const glow = ctx.createRadialGradient(x - r * 0.15, y, r * 0.3, x, y, r);
  glow.addColorStop(0, 'rgba(255,250,200,0.3)');
  glow.addColorStop(1, 'rgba(255,250,200,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
});

register('ufo', (ctx, x, y, size) => {
  const r = size / 2;
  // ドーム（ガラス）
  ctx.fillStyle = 'rgba(100,200,255,0.6)';
  ctx.beginPath();
  ctx.ellipse(x, y - r * 0.15, r * 0.3, r * 0.35, 0, Math.PI, 0);
  ctx.fill();
  // 本体（円盤）
  const grad = ctx.createLinearGradient(x, y - r * 0.2, x, y + r * 0.2);
  grad.addColorStop(0, '#C0C0C0');
  grad.addColorStop(0.5, '#888');
  grad.addColorStop(1, '#555');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.7, r * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  // ライト
  const colors = ['#FF0000', '#00FF00', '#FFFF00'];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.arc(x + (i - 1) * r * 0.35, y + r * 0.05, r * 0.07, 0, Math.PI * 2);
    ctx.fill();
  }
  // ビーム
  ctx.fillStyle = 'rgba(100,255,100,0.15)';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.3, y + r * 0.15);
  ctx.lineTo(x + r * 0.3, y + r * 0.15);
  ctx.lineTo(x + r * 0.6, y + r * 0.7);
  ctx.lineTo(x - r * 0.6, y + r * 0.7);
  ctx.closePath();
  ctx.fill();
});

register('space-helmet', (ctx, x, y, size) => {
  const r = size / 2;
  // ヘルメット外枠
  ctx.fillStyle = '#E0E0E0';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.65, 0, Math.PI * 2);
  ctx.fill();
  // バイザー（反射）
  const visor = ctx.createLinearGradient(x - r * 0.3, y - r * 0.3, x + r * 0.3, y + r * 0.3);
  visor.addColorStop(0, 'rgba(100,180,255,0.7)');
  visor.addColorStop(0.5, 'rgba(200,230,255,0.9)');
  visor.addColorStop(1, 'rgba(100,180,255,0.7)');
  ctx.fillStyle = visor;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
  ctx.fill();
  // ヘルメットリング
  ctx.strokeStyle = '#AAA';
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.65, 0, Math.PI * 2);
  ctx.stroke();
  // アンテナ
  ctx.strokeStyle = '#CCC';
  ctx.lineWidth = Math.max(1, r * 0.05);
  ctx.beginPath();
  ctx.moveTo(x + r * 0.3, y - r * 0.55);
  ctx.lineTo(x + r * 0.35, y - r * 0.85);
  ctx.stroke();
  ctx.fillStyle = '#FF4444';
  ctx.beginPath();
  ctx.arc(x + r * 0.35, y - r * 0.9, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
});

// ============================================================
// エイリアス（同じスプライトを別名で参照）
// ============================================================
register('rainbow-icon', (ctx, x, y, size, opts) => registry['rainbow'](ctx, x, y, size, opts));
register('course-star', (ctx, x, y, size, opts) => registry['star'](ctx, x, y, size, opts));
register('course-poop', (ctx, x, y, size, opts) => registry['poop'](ctx, x, y, size, opts));
