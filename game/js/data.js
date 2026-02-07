// data.js - 全ステージの設定データ・セリフ

export const GAME_TITLE = 'ひかりちゃんのゲームワールド 〜吸い込まれた世界〜';

export const STAGES = [
  {
    id: 1,
    name: 'うんこ集め',
    emoji: '💩',
    description: '💩を100個集めろ！',
    colorTheme: { bg: '#8B6914', accent: '#FFD700' },
    goal: 100,
  },
  {
    id: 2,
    name: 'ミミズ切り',
    emoji: '🪱',
    description: 'ミミズを100匹切れ！',
    colorTheme: { bg: '#2E5A1E', accent: '#8B6914' },
    goal: 100,
  },
  {
    id: 3,
    name: '包丁ゲーム',
    emoji: '⚔️',
    description: 'ガチャで鬼を決めて100回タッチ！',
    colorTheme: { bg: '#CC3300', accent: '#FF8800' },
    goal: 100,
  },
  {
    id: 4,
    name: 'バイクレース',
    emoji: '🏍️',
    description: '空を飛べ！星を取れ！うんこを踏むな！',
    colorTheme: { bg: '#4488CC', accent: '#FF77FF' },
    goal: null, // ゴール到達でクリア
  },
  {
    id: 5,
    name: '変なメイク',
    emoji: '💄',
    description: '変なメイクを100回やったら勝ち！',
    colorTheme: { bg: '#FF69B4', accent: '#FFD700' },
    goal: 100,
  },
  {
    id: 6,
    name: '全部流す',
    emoji: '🚽',
    description: '全部まとめて流しちゃえ！',
    colorTheme: { bg: '#87CEEB', accent: '#FFFFFF' },
    goal: null,
  },
];

export const SECRET_STAGE = {
  id: 7,
  name: 'お化けかくれんぼ',
  emoji: '👻',
  description: 'お化けから隠れろ！',
  colorTheme: { bg: '#1a0033', accent: '#00FF00' },
};

export const HIKARI_REACTIONS = {
  stage1: {
    10: 'がんばる！',
    50: '半分きた！くさーい！',
    90: 'もうちょっと！',
    100: 'やったー！クリア！💩✨',
  },
  stage2: {
    start: 'きゃー！ミミズ！',
    50: '切っても切っても増えるー！',
    100: '100匹いったー！もう見たくない！',
  },
  stage3: {
    gachaStart: 'ドキドキ…誰が鬼かな？',
    oni: '鬼は…👹',
    chase: 'まてまて〜！',
    clear: 'やった！全員つかまえた！',
  },
  stage4: {
    start: 'かっこいいバイク！いくよー！',
    poop: 'ぎゃー！うんこ踏んだ！',
    star: 'キラキラ〜⭐',
    goal: 'かっこいい〜！ゴール！✨',
  },
  stage5: {
    start: 'メイクタイム！💄',
    funny: 'あはは！変な顔〜🤣',
    clear: 'へんてこ大賞！🏆',
  },
  stage6: {
    start: '全部流しちゃえ〜！',
    flushing: 'じゃーーー！🌊',
    done: '帰れる！元の世界に帰れるよ！',
  },
  secret: {
    start: 'こわい…でもがんばる！',
    found: 'みーつけた👻！',
    clear: '色々の世界を抜け出した！伝説のプレイヤー！🌟',
  },
};

export const OPENING_TEXTS = [
  'ある日、ひかりちゃん👧✨は部屋でゲームをしていました。',
  'すると…画面が光り出した！💫',
  '「きゃー！吸い込まれるー！」🌀',
  '…ぐるぐるぐるぐる…',
  '「ここは…ゲームの世界？」',
  '「全部クリアしないと帰れないみたい！」',
  '「よーし、がんばるぞ！」✨',
];

export const ENDING_TEXTS = [
  'ひかりちゃんは自分の部屋に戻ってきた。',
  '「楽しかった〜！」',
  '「…でも もういいかな😅」',
  '',
  '🎮 THE END 🎮',
  '',
  '…でも、隠しステージが解放されたみたい！👻',
];

export const NPC_CHARACTERS = [
  { name: 'たろう', emoji: '👦' },
  { name: 'はなこ', emoji: '👧🎀' },
  { name: 'ロボくん', emoji: '🤖' },
  { name: 'ねこた', emoji: '🐱' },
  { name: 'うさぴょん', emoji: '🐰' },
];

export const MAKEUP_TOOLS = [
  { name: '口紅', emoji: '💄', colors: ['#FF0000', '#0000FF', '#00FF00', '#FF00FF'] },
  { name: 'アイシャドウ', emoji: '👁️', colors: ['#FFD700', '#FF69B4', '#00CED1', '#9400D3'] },
  { name: 'チーク', emoji: '🌈', colors: ['#FF6347', '#FF1493', '#FFD700'] },
  { name: '眉毛ペン', emoji: '✏️', colors: ['#000000', '#8B4513', '#FF4500'] },
  { name: 'デコ', emoji: '⭐', colors: ['#FFD700', '#FF69B4', '#8B4513'] },
  { name: 'フェイスペイント', emoji: '🎨', colors: ['#FF4500', '#4B0082', '#008000'] },
];

export const GHOST_TYPES = [
  { name: 'おばけ', emoji: '👻', speed: 1, behavior: 'patrol' },
  { name: 'ガイコツ', emoji: '💀', speed: 2.5, behavior: 'chase' },
  { name: 'カボチャ', emoji: '🎃', speed: 1, behavior: 'teleport' },
];

export const HIDE_SPOTS = [
  { emoji: '📦', name: '箱' },
  { emoji: '🌳', name: '木' },
  { emoji: '🪨', name: '岩' },
];
