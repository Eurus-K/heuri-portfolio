/**
 * WORKS — the exhibition inventory.
 *
 * Each entry is one "frame" in the Opening Gallery.
 * To swap a placeholder for a real piece, drop the file into /public/works/
 * and fill in `src` (image or .mp4/.webm). Layout and animation stay the same.
 *
 *   ratio   width / height of the frame (keep the real artwork's ratio)
 *   tone    placeholder colour (ignored once `src` is set, still used as loading bg)
 *   src     '/works/brand-01.jpg' | '/works/ai-03.mp4'   (optional)
 *   audio   '/audio/track-01.mp3'  (MUSIC only, optional — playback reserved for v2)
 *   size    relative frame size (optional; small for low-resolution sources)
 *
 * Order = order of appearance in the flight. The four 'Photo to come' slots
 * are waiting for phone photos: add `src` and the real `ratio`.
 */

export const CATEGORIES = {
  BRAND: { en: 'Brand Identity', zh: '品牌視覺' },
  PACK: { en: 'Packaging', zh: '包裝' },
  PRINT: { en: 'Graphic / Print', zh: '平面' },
  AI: { en: 'AI Creation', zh: 'AI 創作' },
  MUSIC: { en: 'Music Cover', zh: '音樂封面' },
};

export const WORKS = [
  { id: 'w01', cat: 'BRAND', title: 'NURSTYLE Key Visual', ratio: 1400 / 840, tone: '#2c2228', src: '/works/nurstyle-banner.webp' },
  { id: 'w02', cat: 'MUSIC', title: '가만히 있지 않아', ratio: 1254 / 1254, tone: '#2c2228', src: '/works/music-gamanhi.webp' },
  { id: 'w03', cat: 'AI', title: 'SCOUT LAB Character IP', ratio: 1400 / 933, tone: '#2c2228', src: '/works/scout-lab.webp' },
  { id: 'w04', cat: 'PRINT', title: 'NURSTYLE Vol.16', ratio: 342 / 319, tone: '#2c2228', src: '/works/nurstyle-vol16.webp', size: 0.42 },
  { id: 'w05', cat: 'MUSIC', title: '흥흥흥', ratio: 1254 / 1254, tone: '#2c2228', src: '/works/music-heungheung.webp' },
  { id: 'w06', cat: 'PACK', title: 'Photo to come', ratio: 4 / 5, tone: '#4a3a44' }, // ← phone photo slot 1
  { id: 'w07', cat: 'PACK', title: 'NURSTYLE Shipping Boxes', ratio: 1400 / 998, tone: '#2c2228', src: '/works/nurstyle-boxes.webp' },
  { id: 'w08', cat: 'AI', title: 'BAD TUTU', ratio: 1254 / 1254, tone: '#2c2228', src: '/works/bad-tutu.webp' },
  { id: 'w09', cat: 'PRINT', title: 'NURSTYLE Vol.01', ratio: 1400 / 1269, tone: '#2c2228', src: '/works/nurstyle-vol01.webp' },
  { id: 'w10', cat: 'BRAND', title: 'Baking Passport', ratio: 1400 / 787, tone: '#2c2228', src: '/works/itri-baking.webp', size: 0.7 },
  { id: 'w11', cat: 'PRINT', title: 'NURSTYLE Live BINGO', ratio: 1400 / 668, tone: '#2c2228', src: '/works/nurstyle-bingo.webp' },
  { id: 'w12', cat: 'PACK', title: 'Photo to come', ratio: 4 / 5, tone: '#5c4a52' }, // ← phone photo slot 2
  { id: 'w13', cat: 'PACK', title: '4D Motion Wear', ratio: 603 / 898, tone: '#2c2228', src: '/works/nurstyle-4d.webp' },
  { id: 'w14', cat: 'MUSIC', title: 'Room Tone', ratio: 1241 / 1241, tone: '#2c2228', src: '/works/music-roomtone.webp' },
  { id: 'w15', cat: 'PRINT', title: 'In Motion, Still Precise', ratio: 654 / 861, tone: '#2c2228', src: '/works/nurstyle-motion.webp' },
  { id: 'w16', cat: 'PACK', title: 'NURSTYLE Logistics Box', ratio: 922 / 1276, tone: '#2c2228', src: '/works/nurstyle-box.webp' },
  { id: 'w17', cat: 'AI', title: 'Trick or Treat', ratio: 805 / 1400, tone: '#2c2228', src: '/works/itri-trick.webp' },
  { id: 'w18', cat: 'PACK', title: 'Photo to come', ratio: 4 / 5, tone: '#3e3640' }, // ← phone photo slot 3
  { id: 'w19', cat: 'PRINT', title: 'IG #hashtag Mission', ratio: 1400 / 668, tone: '#2c2228', src: '/works/nurstyle-hashtag.webp' },
  { id: 'w20', cat: 'PRINT', title: 'NURSTYLE Vol.14', ratio: 343 / 319, tone: '#2c2228', src: '/works/nurstyle-vol14.webp', size: 0.42 },
  { id: 'w21', cat: 'PRINT', title: 'Lucky Project', ratio: 664 / 840, tone: '#2c2228', src: '/works/nurstyle-lucky.webp' },
  { id: 'w22', cat: 'MUSIC', title: '윤율 FM', ratio: 1400 / 560, tone: '#2c2228', src: '/works/music-yunyul.webp' },
  { id: 'w23', cat: 'BRAND', title: 'Brand Proposition', ratio: 1400 / 787, tone: '#2c2228', src: '/works/nurstyle-brand.webp' },
  { id: 'w24', cat: 'PACK', title: 'Photo to come', ratio: 4 / 5, tone: '#544650' }, // ← phone photo slot 4
  { id: 'w25', cat: 'PRINT', title: 'Take Care Project', ratio: 666 / 734, tone: '#2c2228', src: '/works/nurstyle-survey.webp' },
  { id: 'w26', cat: 'PRINT', title: 'Special Offer', ratio: 1400 / 664, tone: '#2c2228', src: '/works/nurstyle-offer.webp' },
  { id: 'w27', cat: 'PRINT', title: 'NURSTYLE Vol.15', ratio: 340 / 319, tone: '#2c2228', src: '/works/nurstyle-vol15.webp', size: 0.42 },
  { id: 'w28', cat: 'BRAND', title: 'Customer Journey Touchpoints', ratio: 1400 / 787, tone: '#2c2228', src: '/works/itri-journey.webp' },
  { id: 'w29', cat: 'BRAND', title: 'Brand Identity Evolution', ratio: 1400 / 787, tone: '#2c2228', src: '/works/nurstyle-identity.webp' },
  { id: 'w30', cat: 'PACK', title: 'Try-on Sticker', ratio: 355 / 626, tone: '#2c2228', src: '/works/nurstyle-sticker.webp', size: 0.5 },
];
