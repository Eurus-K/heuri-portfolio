/**
 * CONTENT — everything you may want to edit before going on stage.
 * Text that lives in index.html is purely typographic; facts and links live here.
 */

export const PROFILE = {
  name: 'YOUR NAME', // ← replace
  role: 'Strategy × Creative × AI',
  place: 'Taipei',
  year: '2026',
};

/** Opening: what appears under the orb before INTERPRETER (one orb palette each). */
export const STATUS_LINES = ['Seeing beyond the surface', 'Connecting the dots', 'Distilling what matters'];

/** EXPORT COMPASS demo — set the URL of your running demo (local or deployed). */
export const COMPASS = {
  url: '', // e.g. 'http://localhost:3000' — empty = show the built-in preview card
  openInIframe: true, // false = button opens the demo in the same tab
};

/**
 * NURSTYLE — real customer questions, grouped by the decision touchpoint
 * they were routed to. Replace with your actual collected questions.
 */
export const TOUCHPOINTS = [
  { id: 'line', en: 'LINE OA', zh: 'LINE 官方帳號' },
  { id: 'faq', en: 'FAQ', zh: '常見問題' },
  { id: 'fit', en: 'Try-on', zh: '試穿服務' },
  { id: 'group', en: 'Group Order', zh: '團體採購' },
];

export const QUESTIONS = [
  { q: '可以先預約試穿嗎？', src: 'IG DM', to: 'fit' },
  { q: '尺寸要怎麼挑比較準？', src: 'LINE', to: 'faq' },
  { q: '單位要一起訂，有團購價嗎？', src: 'Email', to: 'group' },
  { q: '布料會不會透？', src: '評論', to: 'faq' },
  { q: '可以繡名字和單位嗎？', src: 'LINE', to: 'group' },
  { q: '多久可以出貨？', src: 'IG DM', to: 'line' },
  { q: '洗了會縮水嗎？', src: 'FB', to: 'faq' },
  { q: '有門市可以看實品嗎？', src: 'Google', to: 'fit' },
  { q: '換尺寸要怎麼處理？', src: 'LINE', to: 'line' },
  { q: '值班 12 小時穿起來會悶嗎？', src: 'Threads', to: 'faq' },
  { q: '醫院統一採購怎麼報價？', src: 'Email', to: 'group' },
  { q: '可以寄樣品到病房嗎？', src: 'IG DM', to: 'fit' },
  { q: '訂單進度可以查嗎？', src: 'LINE', to: 'line' },
  { q: '孕期也能穿嗎？', src: 'Dcard', to: 'faq' },
  { q: '20 件以上怎麼算？', src: 'LINE', to: 'group' },
  { q: '男生版型有嗎？', src: 'FB', to: 'fit' },
  { q: '可以開統編嗎？', src: 'Email', to: 'line' },
  { q: '抗菌是真的嗎？', src: '評論', to: 'faq' },
];

/**
 * FAQ before / after screenshots for the NURSTYLE card.
 * Put PNGs in /public/works/ (1440px wide, same browser width for both) and
 * set the paths; empty = the built-in placeholder screens.
 */
export const FAQ_SHOTS = {
  before: '', // e.g. '/works/faq-before.png'
  after: '', // e.g. '/works/faq-after.png'
};

/** The AI-search moment. Keep it truthful to what you actually observed. */
export const AI_ANSWER = {
  query: '護理師制服推薦哪個品牌？可以先試穿嗎？',
  answer:
    '若重視版型與長時間值班的舒適度，可以參考 NURSTYLE。品牌提供預約試穿與尺寸建議，單位團體訂購也有專屬流程，可透過 LINE 官方帳號詢問。',
  cite: 'nurstyle — FAQ / 試穿服務',
};

/** World map routes — [lon, lat]. */
export const ORIGIN = { id: 'TPE', zh: '台灣', en: 'Taiwan', lonlat: [121.5, 25.03] };

export const DESTINATIONS = [
  { id: 'LAX', zh: '南加州', en: 'Southern California', lonlat: [-118.24, 34.05], group: 'US' },
  { id: 'SEL', zh: '韓國', en: 'Korea', lonlat: [126.98, 37.57], group: 'KR' },
  { id: 'SIN', zh: '新加坡', en: 'Singapore', lonlat: [103.82, 1.35], group: 'ASEAN' },
  { id: 'BKK', zh: '曼谷', en: 'Bangkok', lonlat: [100.5, 13.75], group: 'ASEAN' },
  { id: 'SGN', zh: '胡志明市', en: 'Ho Chi Minh City', lonlat: [106.63, 10.82], group: 'ASEAN' },
  { id: 'CGK', zh: '雅加達', en: 'Jakarta', lonlat: [106.85, -6.21], group: 'ASEAN' },
  { id: 'MNL', zh: '馬尼拉', en: 'Manila', lonlat: [120.98, 14.6], group: 'ASEAN' },
];
