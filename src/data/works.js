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
 *   key     true = one of the "20%" pieces that survive longest in the convergence
 */

export const CATEGORIES = {
  BRAND: { en: 'Brand Identity', zh: '品牌視覺' },
  PACK: { en: 'Packaging', zh: '包裝' },
  PRINT: { en: 'Graphic / Print', zh: '平面' },
  AI: { en: 'AI Creation', zh: 'AI 創作' },
  MUSIC: { en: 'Music Cover', zh: '音樂封面' },
};

export const WORKS = [
  { id: 'w01', cat: 'BRAND', title: 'Untitled Identity', year: 2025, ratio: 16 / 10, tone: '#1F1E1C', key: true },
  { id: 'w02', cat: 'MUSIC', title: 'Single Cover I', year: 2025, ratio: 1, tone: '#C8402A' },
  { id: 'w03', cat: 'PACK', title: 'Tea Series', year: 2024, ratio: 4 / 5, tone: '#B9B2A3' },
  { id: 'w04', cat: 'AI', title: 'Synthetic Still 01', year: 2025, ratio: 2 / 3, tone: '#2E3A4A' },
  { id: 'w05', cat: 'PRINT', title: 'Poster A1', year: 2023, ratio: 1 / 1.414, tone: '#E3DED3' },
  { id: 'w06', cat: 'BRAND', title: 'Wordmark Study', year: 2024, ratio: 4 / 3, tone: '#6E6A5E' },
  { id: 'w07', cat: 'MUSIC', title: 'EP Artwork', year: 2024, ratio: 1, tone: '#2A2A2A', key: true },
  { id: 'w08', cat: 'AI', title: 'Generated Landscape', year: 2025, ratio: 16 / 9, tone: '#8F9A8C' },
  { id: 'w09', cat: 'PACK', title: 'Gift Box', year: 2023, ratio: 1, tone: '#D9CBB0' },
  { id: 'w10', cat: 'PRINT', title: 'Editorial Spread', year: 2024, ratio: 3 / 2, tone: '#F2EFE9' },
  { id: 'w11', cat: 'BRAND', title: 'Signage System', year: 2025, ratio: 3 / 4, tone: '#3B4A3F' },
  { id: 'w12', cat: 'AI', title: 'Portrait Series', year: 2025, ratio: 4 / 5, tone: '#A6705A', key: true },
  { id: 'w13', cat: 'MUSIC', title: 'Album Cover', year: 2023, ratio: 1, tone: '#D7D2C8' },
  { id: 'w14', cat: 'PRINT', title: 'Exhibition Poster', year: 2024, ratio: 1 / 1.414, tone: '#191919' },
  { id: 'w15', cat: 'PACK', title: 'Label System', year: 2025, ratio: 5 / 4, tone: '#7C8794' },
  { id: 'w16', cat: 'BRAND', title: 'Brand Guidelines', year: 2024, ratio: 16 / 10, tone: '#CFC7B8' },
  { id: 'w17', cat: 'AI', title: 'Motion Frame', year: 2025, ratio: 9 / 16, tone: '#4A4F57' },
  { id: 'w18', cat: 'MUSIC', title: 'Single Cover II', year: 2025, ratio: 1, tone: '#E4572E' },
  { id: 'w19', cat: 'PRINT', title: 'Type Specimen', year: 2023, ratio: 3 / 4, tone: '#ECE8E0' },
  { id: 'w20', cat: 'PACK', title: 'Bottle Wrap', year: 2024, ratio: 2 / 3, tone: '#5B5446', key: true },
  { id: 'w21', cat: 'BRAND', title: 'Campaign Key Visual', year: 2025, ratio: 21 / 9, tone: '#26303A' },
  { id: 'w22', cat: 'AI', title: 'Texture Study', year: 2024, ratio: 1, tone: '#BFB6A6' },
  { id: 'w23', cat: 'MUSIC', title: 'Mixtape', year: 2024, ratio: 1, tone: '#151515' },
  { id: 'w24', cat: 'PRINT', title: 'Zine Cover', year: 2025, ratio: 4 / 5, tone: '#9C3B2C' },
  { id: 'w25', cat: 'PACK', title: 'Seasonal Edition', year: 2025, ratio: 3 / 4, tone: '#E7E1D4' },
  { id: 'w26', cat: 'BRAND', title: 'Stationery', year: 2023, ratio: 1.414, tone: '#AFA899' },
  { id: 'w27', cat: 'AI', title: 'Speculative Object', year: 2025, ratio: 4 / 5, tone: '#33302B' },
  { id: 'w28', cat: 'MUSIC', title: 'Live Session', year: 2025, ratio: 1, tone: '#6B7468', key: true },
];
