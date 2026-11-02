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
 * NURSTYLE — the decision touchpoints (tabs on the case card).
 */
export const TOUCHPOINTS = [
  { id: 'line', label: 'LINE OA' },
  { id: 'faq', label: 'FAQ' },
  { id: 'fit', label: '試穿服務' },
  { id: 'group', label: '團體採購' },
];

/**
 * Customer questions that fall and pile up as pills. Taken from the NURSTYLE
 * FAQ corpus (2026-06-01), shortened to read at a glance; `faq` is the source id.
 */
export const QUESTIONS = [
  { q: '第一次買醫護服，怎麼挑？', faq: '1-1' },
  { q: '尺寸怎麼選？', faq: '1-2' },
  { q: '女版、男版、通用版差在哪？', faq: '1-3' },
  { q: '可以試穿嗎？', faq: '1-4' },
  { q: '這次和上次有色差？', faq: '1-5' },
  { q: '可以匯款嗎？', faq: '2-2' },
  { q: '團體採購有優惠嗎？', faq: '2-3' },
  { q: '可以刺繡嗎？', faq: '2-4' },
  { q: '多久會出貨？', faq: '3-1' },
  { q: '預購什麼時候出貨？', faq: '3-2' },
  { q: '多少免運？', faq: '3-3' },
  { q: '怎麼查配送進度？', faq: '3-4' },
  { q: '可以開統編發票嗎？', faq: '4-1' },
  { q: '沒收到發票怎麼辦？', faq: '4-2' },
  { q: '尺寸不合可以退貨嗎？', faq: '5-1' },
  { q: '收到瑕疵怎麼辦？', faq: '5-2' },
  { q: '退款多久入帳？', faq: '5-3' },
  { q: '一定要註冊會員嗎？', faq: '6-1' },
  { q: '診所訂購用誰的帳號？', faq: '6-3' },
  { q: '帳號可以整合嗎？', faq: '6-4' },
];

/**
 * FAQ before / after screenshots for the NURSTYLE card (in /public/works/).
 * `after` is a full-page capture (GoFullPage expands every answer, which is
 * what crawlers and AI see); the card scrolls down it after the wipe.
 * Empty = the built-in placeholder screens.
 */
export const FAQ_SHOTS = {
  before: '/works/faq-before.webp', // old FAQ page, June 2026
  after: '/works/faq-after-full.webp', // new FAQ page, full-page capture
};

/**
 * The results frame — real figures from the case study
 * 「NURSTYLE｜醫護服內容的 AI 搜尋能見度」(AI search test, 2026-11-01).
 * Every scored query left the brand name out.
 */
export const RESULTS = {
  eyebrow: 'SEO · AEO · GEO',
  title: 'From brand to search',
  stats: [
    { value: '7 / 10', label: '沒提品牌的診所問題，AI 主動推薦' },
    { value: '6 / 10', label: 'FAQ、團購、試穿頁成為 AI 引用來源' },
    { value: '3 題', label: '推薦排名第一' },
  ],
  note: '未登入網頁搜尋・2026-11-01・28 個不帶品牌名的問法',
};

/** One real query from that test, quoted as the AI answered it. */
export const AI_ANSWER = {
  query: '診所制服 可以先試穿 樣衣 再團購',
  answer: '可以。NURSTYLE 團體採購前可申請寄送試穿，每次最多 10 件，運費 NT$100。',
  rank: '推薦・第 1 名',
  cite: 'nurstyle.com.tw/pages/bulk-order',
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
