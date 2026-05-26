import type { ImportAnalyzeResponse, SourcePlatform } from './types.js';

export const categoryGroups = [
  {
    title: '日常餐食',
    tags: ['早午餐', '午餐', '晚餐', '宵夜', '便當', '下午茶'],
  },
  {
    title: '料理種類',
    tags: ['台式', '日式', '燒肉', '韓式', '拉麵', '火鍋', '牛排', '素食', '港式', '健康餐', '泰式', '義式', '咖啡廳', '飲料'],
  },
  {
    title: '情境',
    tags: ['小吃', '點心', '甜點', '聚餐', '約會'],
  },
] as const;

export const dailyMealTags = categoryGroups[0].tags;
export const cuisineTags = categoryGroups[1].tags;
export const allTags = categoryGroups.flatMap((group) => group.tags);

export const taiwanAreas: Record<string, string[]> = {
  台北市: ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'],
  新北市: ['板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區', '土城區', '蘆洲區', '樹林區', '汐止區', '鶯歌區', '三峽區', '淡水區', '瑞芳區', '五股區', '泰山區', '林口區', '深坑區', '石碇區', '坪林區', '三芝區', '石門區', '八里區', '平溪區', '雙溪區', '貢寮區', '金山區', '萬里區', '烏來區'],
  桃園市: ['桃園區', '中壢區', '平鎮區', '八德區', '楊梅區', '蘆竹區', '大溪區', '龍潭區', '龜山區', '大園區', '觀音區', '新屋區', '復興區'],
  台中市: ['中區', '東區', '南區', '西區', '北區', '北屯區', '西屯區', '南屯區', '太平區', '大里區', '霧峰區', '烏日區', '豐原區', '后里區', '石岡區', '東勢區', '和平區', '新社區', '潭子區', '大雅區', '神岡區', '大肚區', '沙鹿區', '龍井區', '梧棲區', '清水區', '大甲區', '外埔區', '大安區'],
  台南市: ['中西區', '東區', '南區', '北區', '安平區', '安南區', '永康區', '歸仁區', '新化區', '左鎮區', '玉井區', '楠西區', '南化區', '仁德區', '關廟區', '龍崎區', '官田區', '麻豆區', '佳里區', '西港區', '七股區', '將軍區', '學甲區', '北門區', '新營區', '後壁區', '白河區', '東山區', '六甲區', '下營區', '柳營區', '鹽水區', '善化區', '大內區', '山上區', '新市區', '安定區'],
  高雄市: ['新興區', '前金區', '苓雅區', '鹽埕區', '鼓山區', '旗津區', '前鎮區', '三民區', '楠梓區', '小港區', '左營區', '仁武區', '大社區', '岡山區', '路竹區', '阿蓮區', '田寮區', '燕巢區', '橋頭區', '梓官區', '彌陀區', '永安區', '湖內區', '鳳山區', '大寮區', '林園區', '鳥松區', '大樹區', '旗山區', '美濃區', '六龜區', '內門區', '杉林區', '甲仙區', '桃源區', '那瑪夏區', '茂林區', '茄萣區'],
  基隆市: ['仁愛區', '信義區', '中正區', '中山區', '安樂區', '暖暖區', '七堵區'],
  新竹市: ['東區', '北區', '香山區'],
  嘉義市: ['東區', '西區'],
  新竹縣: ['竹北市', '竹東鎮', '新埔鎮', '關西鎮', '湖口鄉', '新豐鄉', '芎林鄉', '橫山鄉', '北埔鄉', '寶山鄉', '峨眉鄉', '尖石鄉', '五峰鄉'],
  苗栗縣: ['苗栗市', '苑裡鎮', '通霄鎮', '竹南鎮', '頭份市', '後龍鎮', '卓蘭鎮', '大湖鄉', '公館鄉', '銅鑼鄉', '南庄鄉', '頭屋鄉', '三義鄉', '西湖鄉', '造橋鄉', '三灣鄉', '獅潭鄉', '泰安鄉'],
  彰化縣: ['彰化市', '員林市', '和美鎮', '鹿港鎮', '溪湖鎮', '二林鎮', '田中鎮', '北斗鎮', '花壇鄉', '芬園鄉', '大村鄉', '永靖鄉', '伸港鄉', '線西鄉', '福興鄉', '秀水鄉', '埔心鄉', '埔鹽鄉', '大城鄉', '芳苑鄉', '竹塘鄉', '社頭鄉', '二水鄉', '田尾鄉', '埤頭鄉', '溪州鄉'],
  南投縣: ['南投市', '埔里鎮', '草屯鎮', '竹山鎮', '集集鎮', '名間鄉', '鹿谷鄉', '中寮鄉', '魚池鄉', '國姓鄉', '水里鄉', '信義鄉', '仁愛鄉'],
  雲林縣: ['斗六市', '斗南鎮', '虎尾鎮', '西螺鎮', '土庫鎮', '北港鎮', '古坑鄉', '大埤鄉', '莿桐鄉', '林內鄉', '二崙鄉', '崙背鄉', '麥寮鄉', '東勢鄉', '褒忠鄉', '台西鄉', '元長鄉', '四湖鄉', '口湖鄉', '水林鄉'],
  嘉義縣: ['太保市', '朴子市', '布袋鎮', '大林鎮', '民雄鄉', '溪口鄉', '新港鄉', '六腳鄉', '東石鄉', '義竹鄉', '鹿草鄉', '水上鄉', '中埔鄉', '竹崎鄉', '梅山鄉', '番路鄉', '大埔鄉', '阿里山鄉'],
  屏東縣: ['屏東市', '潮州鎮', '東港鎮', '恆春鎮', '萬丹鄉', '長治鄉', '麟洛鄉', '九如鄉', '里港鄉', '鹽埔鄉', '高樹鄉', '萬巒鄉', '內埔鄉', '竹田鄉', '新埤鄉', '枋寮鄉', '新園鄉', '崁頂鄉', '林邊鄉', '南州鄉', '佳冬鄉', '琉球鄉', '車城鄉', '滿州鄉', '枋山鄉', '三地門鄉', '霧台鄉', '瑪家鄉', '泰武鄉', '來義鄉', '春日鄉', '獅子鄉', '牡丹鄉'],
  宜蘭縣: ['宜蘭市', '羅東鎮', '蘇澳鎮', '頭城鎮', '礁溪鄉', '壯圍鄉', '員山鄉', '冬山鄉', '五結鄉', '三星鄉', '大同鄉', '南澳鄉'],
  花蓮縣: ['花蓮市', '鳳林鎮', '玉里鎮', '新城鄉', '吉安鄉', '壽豐鄉', '光復鄉', '豐濱鄉', '瑞穗鄉', '富里鄉', '秀林鄉', '萬榮鄉', '卓溪鄉'],
  台東縣: ['台東市', '成功鎮', '關山鎮', '卑南鄉', '鹿野鄉', '池上鄉', '東河鄉', '長濱鄉', '太麻里鄉', '大武鄉', '綠島鄉', '海端鄉', '延平鄉', '金峰鄉', '達仁鄉', '蘭嶼鄉'],
  澎湖縣: ['馬公市', '湖西鄉', '白沙鄉', '西嶼鄉', '望安鄉', '七美鄉'],
  金門縣: ['金城鎮', '金湖鎮', '金沙鎮', '金寧鄉', '烈嶼鄉', '烏坵鄉'],
  連江縣: ['南竿鄉', '北竿鄉', '莒光鄉', '東引鄉'],
};

function normalizeTaiwanText(value?: string) {
  return (value ?? '').replace(/臺/g, '台').trim();
}

function toStringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function clampConfidence(value: unknown, fallback: number) {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(1, number));
}

function inferAreaFromText(text: string, city?: string, district?: string) {
  const haystack = normalizeTaiwanText([text, city, district].filter(Boolean).join('\n'));
  const inferredCity = normalizeTaiwanText(city) || Object.keys(taiwanAreas).find((item) => haystack.includes(item)) || '';
  const inferredDistrict =
    (inferredCity && taiwanAreas[inferredCity]?.find((item) => normalizeTaiwanText(district) === item)) ||
    (inferredCity && taiwanAreas[inferredCity]?.find((item) => haystack.includes(item))) ||
    '';
  return { city: inferredCity, district: inferredDistrict };
}

function buildMissingFields(result: Partial<ImportAnalyzeResponse>) {
  const missing: string[] = [];
  if (!result.name) missing.push('店家名稱');
  if (!result.city) missing.push('城市');
  if (!result.district) missing.push('區域');
  if (!result.tags?.length) missing.push('至少一個標籤分類');
  return missing;
}

function buildSummary(result: Partial<ImportAnalyzeResponse>) {
  const parts = [
    result.name ? `店名：${result.name}` : '',
    result.address ? `地址：${result.address}` : '',
    result.signatureFood ? `招牌：${result.signatureFood}` : '',
    result.aiDailyMealTags?.length ? `適合：${result.aiDailyMealTags.join('、')}` : '',
    result.aiCuisineTags?.length ? `料理：${result.aiCuisineTags.join('、')}` : '',
  ];
  return parts.filter(Boolean).join('\n');
}

export function sanitizeImportAnalysis({
  raw,
  normalizedUrl,
  sourcePlatform,
  sourceCaption,
  warnings = [],
}: {
  raw: Record<string, unknown>;
  normalizedUrl: string;
  sourcePlatform: SourcePlatform;
  sourceCaption: string;
  warnings?: string[];
}): ImportAnalyzeResponse {
  const area = inferAreaFromText(
    `${sourceCaption}\n${toStringValue(raw.address)}`,
    toStringValue(raw.city),
    toStringValue(raw.district),
  );
  const aiDailyMealTags = unique(toStringArray(raw.aiDailyMealTags).filter((tag) => (dailyMealTags as readonly string[]).includes(tag)));
  const aiCuisineTags = unique(toStringArray(raw.aiCuisineTags).filter((tag) => (cuisineTags as readonly string[]).includes(tag)));
  const tags = unique(
    [...toStringArray(raw.tags), ...aiDailyMealTags, ...aiCuisineTags].filter((tag) => (allTags as readonly string[]).includes(tag)),
  );

  const result: ImportAnalyzeResponse = {
    name: toStringValue(raw.name),
    city: area.city,
    district: area.district,
    address: toStringValue(raw.address).replace(/^地址\s*[:：｜|]?\s*/, ''),
    signatureFood: toStringValue(raw.signatureFood),
    tags,
    status: '尚未去過',
    sourceUrl: normalizedUrl,
    sourcePlatform,
    sourceCaption,
    aiSummary: toStringValue(raw.aiSummary),
    aiExtractedTags: tags,
    aiDailyMealTags,
    aiCuisineTags,
    aiConfidence: clampConfidence(raw.aiConfidence, 0.72),
    isImportedFromSocial: true,
    missingFields: [],
    normalizedUrl,
    warnings: unique([...warnings, ...toStringArray(raw.warnings)]),
  };

  result.missingFields = buildMissingFields(result);
  if (!result.aiSummary) result.aiSummary = buildSummary(result);
  if (result.missingFields.length) result.aiConfidence = Math.min(result.aiConfidence ?? 0.5, 0.55);

  return result;
}
