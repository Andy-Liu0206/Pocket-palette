import { allTags, cuisineTags, dailyMealTags, taiwanAreas } from './restaurantSchema.js';

const cuisineSignals: Record<string, string[]> = {
  台式: ['台式', '小吃', '滷肉飯', '牛肉湯', '蚵仔', '肉圓', '雞肉飯', '便當'],
  日式: ['日式', '壽司', '丼飯', '咖哩', '串燒', '居酒屋', '和牛'],
  燒肉: ['燒肉', '烤肉', '牛小排', '牛舌', '燒烤'],
  韓式: ['韓式', '韓國', '泡菜', '部隊鍋', '烤五花', '炸雞'],
  拉麵: ['拉麵', '雞白湯', '豚骨', '沾麵'],
  火鍋: ['火鍋', '鍋物', '涮涮鍋', '麻辣鍋', '酸菜魚'],
  牛排: ['牛排', '排餐', '肋眼', '菲力'],
  素食: ['素食', '蔬食', '植物肉', '全素', '蛋奶素'],
  港式: ['港式', '茶餐廳', '點心', '燒臘', '菠蘿油'],
  健康餐: ['健康餐', '舒肥', '藜麥', '餐盒', '沙拉'],
  泰式: ['泰式', '打拋', '綠咖哩', '月亮蝦餅'],
  義式: ['義式', '義大利麵', '燉飯', '披薩', '提拉米蘇', '寬麵'],
};

const foodSignals = [
  '威士忌醬油菇菇溫泉蛋豬肉末義大利麵',
  '冬陰功（泰式酸辣蝦）義大利麵',
  '老奶奶焦糖蘋果派佐冰淇淋',
  '松阪豬燉飯',
  '干貝奶油海鮮麵',
  '戚風蛋糕',
  '提拉米蘇',
  '抹茶草莓',
  '巧克力',
  '義大利麵',
  '燉飯',
  '拉麵',
  '牛肉湯',
  '咖啡',
  '甜點',
  '燒肉',
  '火鍋',
  '便當',
  '蛋糕',
  '漢堡',
  '披薩',
  '丼飯',
  '咖哩',
  '牛排',
];

function clean(value: string) {
  return value
    .replace(/[@#].*$/, '')
    .replace(/[˚₊୧⃛୨⃛✧˖◛⁺✰჻ᐟ☆★|｜·•・]/g, ' ')
    .replace(/[^\p{Script=Han}a-zA-Z0-9（）()\- ]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function extractName(caption: string) {
  const patterns = [
    /(?:店名|餐廳|店家)\s*[:：｜|]\s*([^\n#]+)/,
    /[｜|]\s*([^\n｜|#@]{2,24})\s*[｜|]/,
    /✧\s*([^✧\n@]{2,24})\s*✧/,
    /(?:^|\n)\s*📌\s*([^\n#@]+)/,
  ];
  for (const pattern of patterns) {
    const match = caption.match(pattern);
    if (match?.[1]) return clean(match[1]).slice(0, 32);
  }
  return '';
}

function extractAddress(caption: string) {
  const explicit = caption.match(/(?:📍\s*)?(?:地址|位置|地點)\s*[:：｜|]?\s*([^\n]+)/);
  if (explicit?.[1]) return explicit[1].trim();
  return (
    caption
      .split('\n')
      .map((line) => line.trim())
      .find((line) => /(?:市|縣).{0,8}(?:區|鎮|鄉|市).{1,30}(?:路|街|巷|弄|號)/.test(line)) ?? ''
  );
}

function inferArea(caption: string, address: string) {
  const text = `${caption}\n${address}`.replace(/臺/g, '台');
  const city = Object.keys(taiwanAreas).find((item) => text.includes(item)) ?? '';
  const district = city ? taiwanAreas[city]?.find((item) => text.includes(item)) ?? '' : '';
  return { city, district };
}

function extractFoods(caption: string) {
  const lineFoods = caption
    .split('\n')
    .map((line) => clean(line.replace(/\$\s*\d+.*/, '')))
    .filter((line) => !/(?:店名|地址|電話|營業|附近|這家|必收|真的|追蹤|一定|試試|推薦)/.test(line))
    .filter((line) => /(?:義大利麵|蛋糕|派|冰淇淋|咖啡|甜點|燉飯|拉麵|火鍋|牛排|披薩)/.test(line))
    .filter((line) => line.length >= 3 && line.length <= 30);
  return unique([...lineFoods, ...foodSignals.filter((item) => caption.includes(item)).sort((a, b) => b.length - a.length)]).slice(0, 4);
}

function inferDaily(caption: string) {
  const tags: string[] = [];
  if (/早午餐|早餐|brunch/i.test(caption)) tags.push('早午餐');
  if (/午餐|中午|餐盒|便當|商業午餐/.test(caption)) tags.push('午餐');
  if (/晚餐|晚間|晚上|聚餐|餐酒|燒肉|火鍋|義式|義大利麵|牛排|17:30|20:30/.test(caption)) tags.push('晚餐');
  if (/宵夜|深夜|凌晨|夜食/.test(caption)) tags.push('宵夜');
  if (/便當|餐盒|外帶/.test(caption)) tags.push('便當');
  return unique(tags.filter((tag) => (dailyMealTags as readonly string[]).includes(tag)));
}

function inferCuisine(caption: string) {
  const tags = cuisineTags.filter((tag) => (cuisineSignals[tag] ?? [tag]).some((signal) => caption.includes(signal)));
  if (caption.includes('義大利麵') && tags.includes('泰式')) return unique(['義式', ...tags.filter((tag) => tag !== '泰式')]);
  return unique(tags);
}

export function parseRestaurantLocally(caption: string) {
  const address = extractAddress(caption);
  const area = inferArea(caption, address);
  const daily = inferDaily(caption);
  const cuisine = inferCuisine(caption);
  const tags = unique([...daily, ...cuisine, ...allTags.filter((tag) => caption.includes(tag))].filter((tag) => (allTags as readonly string[]).includes(tag)));
  const foods = extractFoods(caption);

  return {
    name: extractName(caption),
    city: area.city,
    district: area.district,
    address,
    signatureFood: foods.join('、'),
    tags,
    aiDailyMealTags: daily,
    aiCuisineTags: cuisine,
    aiSummary: '',
    aiConfidence: 0.45,
    warnings: [],
  };
}
