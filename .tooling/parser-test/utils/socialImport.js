"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractUrlFromSharedText = extractUrlFromSharedText;
exports.normalizeSocialUrl = normalizeSocialUrl;
exports.detectSourcePlatform = detectSourcePlatform;
exports.analyzeSocialFoodUrl = analyzeSocialFoodUrl;
const categories_1 = require("../data/categories");
const taiwanAreas_1 = require("../data/taiwanAreas");
const dailyMealTags = [...categories_1.categoryGroups[0].tags];
const cuisineTags = [...categories_1.categoryGroups[1].tags];
const cuisineSignals = {
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
const signatureFoodSignals = [
    '松阪豬燉飯',
    '干貝奶油海鮮麵',
    '提拉米蘇',
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
    '戚風蛋糕',
    '抹茶草莓',
    '巧克力',
    '威士忌醬油菇菇溫泉蛋豬肉末義大利麵',
    '冬陰功（泰式酸辣蝦）義大利麵',
    '老奶奶焦糖蘋果派佐冰淇淋',
];
function extractUrlFromSharedText(value) {
    const match = value.match(/https?:\/\/[^\s<>"'，。)）]+/i);
    return match?.[0] ?? value.trim();
}
function extractCaptionFromSharedText(value) {
    return value
        .replace(/https?:\/\/[^\s<>"'，。)）]+/gi, '')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !/^分享|^傳送|^看這|^watch\b/i.test(line))
        .join('\n')
        .trim();
}
function shouldPreserveSearchParams(parsed) {
    const loweredHost = parsed.hostname.toLowerCase();
    return loweredHost.includes('google.') || loweredHost.includes('goo.gl') || loweredHost.includes('maps.app.goo.gl');
}
function normalizeSocialUrl(url) {
    const trimmed = extractUrlFromSharedText(url);
    if (!trimmed)
        return '';
    try {
        const parsed = new URL(trimmed);
        if (!shouldPreserveSearchParams(parsed))
            parsed.search = '';
        parsed.hash = '';
        parsed.pathname = parsed.pathname.replace('/reels/', '/reel/');
        return parsed.toString().replace(/\/$/, '');
    }
    catch {
        return trimmed.replace('/reels/', '/reel/').split('#')[0].replace(/\/$/, '');
    }
}
function detectSourcePlatform(url) {
    const lowered = url.toLowerCase();
    if (lowered.includes('threads'))
        return 'Threads';
    if (lowered.includes('/reel/'))
        return 'Reels';
    if (lowered.includes('instagram'))
        return 'Instagram';
    if (lowered.includes('maps.google') || lowered.includes('goo.gl/maps') || lowered.includes('google.com/maps'))
        return 'Google Maps';
    if (lowered.includes('http'))
        return 'Website';
    return 'Other';
}
function decodeHtml(value) {
    return value
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'");
}
function stripHtml(value) {
    return decodeHtml(value.replace(/<[^>]*>/g, ' ')).replace(/\s+\n/g, '\n').trim();
}
function readMetaContent(html, key) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const metaTags = html.match(/<meta\s+[^>]*>/gi) ?? [];
    for (const tag of metaTags) {
        const hasKey = new RegExp(`(?:property|name)=["']${escapedKey}["']`, 'i').test(tag);
        if (!hasKey)
            continue;
        const content = tag.match(/\bcontent=(["'])([\s\S]*?)\1/i);
        if (content?.[2])
            return decodeHtml(content[2]);
    }
    return '';
}
function extractCaptionFromMetadata(html, platform) {
    const description = readMetaContent(html, 'og:description') || readMetaContent(html, 'description');
    const title = readMetaContent(html, 'og:title') || readMetaContent(html, 'twitter:title');
    if (platform === 'Instagram' || platform === 'Reels' || platform === 'Threads') {
        const descriptionQuoted = description.match(/:\s*"([\s\S]+?)"\.?\s*$/);
        if (descriptionQuoted?.[1])
            return descriptionQuoted[1].trim();
        const titleQuoted = title.match(/on Instagram:\s*"([\s\S]+)"$/);
        if (titleQuoted?.[1])
            return titleQuoted[1].trim();
    }
    const combined = [description, title].filter(Boolean).join('\n');
    return stripHtml(combined);
}
async function fetchCaptionFromUrl(url, platform) {
    const response = await fetch(url);
    if (!response.ok)
        throw new Error(`Unable to fetch URL metadata: ${response.status}`);
    const html = await response.text();
    return extractCaptionFromMetadata(html, platform);
}
function getImportAnalysisEndpoint() {
    return process?.env?.EXPO_PUBLIC_IMPORT_ANALYSIS_URL?.trim() ?? '';
}
function normalizeBackendAnalysis(payload, normalizedUrl, sourcePlatform) {
    const sourceCaption = payload.sourceCaption ?? payload.caption ?? '';
    const result = {
        ...payload,
        sourceUrl: payload.sourceUrl ?? normalizedUrl,
        sourcePlatform: payload.sourcePlatform ?? sourcePlatform,
        sourceCaption,
        aiConfidence: payload.aiConfidence ?? payload.confidence,
        isImportedFromSocial: true,
    };
    const missingFields = payload.missingFields ?? buildMissingFields(result);
    if (!result.name && !sourceCaption)
        return undefined;
    return {
        ...result,
        normalizedUrl,
        missingFields,
    };
}
async function analyzeWithConfiguredBackend(normalizedUrl, caption, sourcePlatform) {
    const endpoint = getImportAnalysisEndpoint();
    if (!endpoint)
        return undefined;
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: normalizedUrl,
                platform: sourcePlatform,
                caption,
                locale: 'zh-TW',
                schema: {
                    required: ['name', 'city', 'district', 'address', 'signatureFood', 'aiDailyMealTags', 'aiCuisineTags'],
                },
            }),
        });
        if (!response.ok)
            return undefined;
        const payload = (await response.json());
        return normalizeBackendAnalysis(payload, normalizedUrl, sourcePlatform);
    }
    catch {
        return undefined;
    }
}
function normalizeText(text) {
    return text.replace(/\r/g, '').replace(/[ \t]+/g, ' ').trim();
}
function unique(values) {
    return [...new Set(values.filter(Boolean))];
}
function cleanDecorativeText(value) {
    return value
        .replace(/[@#].*$/, '')
        .replace(/[˚₊୧⃛୨⃛✧˖◛⁺✰჻ᐟ☆★|｜·•・]/g, ' ')
        .replace(/[^\p{Script=Han}a-zA-Z0-9（）()\- ]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function extractRestaurantName(caption) {
    const patterns = [
        /(?:店名|餐廳|店家)\s*[:：｜|]\s*([^\n#]+)/,
        /-\s*\n\s*📌?\s*([^\n#]+)/,
        /(?:^|\n)\s*📌\s*([^\n#@]*(?:店|館|屋|所|坊|食堂|餐酒館|咖啡|甜點|中山店|分店)[^\n#@]*)/,
        /[｜|]\s*([^\n｜|#@]{2,24})\s*[｜|]/,
        /✧\s*([^✧\n@]{2,24})\s*✧/,
        /(?:^|\n)\s*([^\n#]{2,28}(?:店|館|屋|所|坊|食堂|餐酒館|咖啡|甜點|中山店|分店|青沐)[^\n#]*)/,
    ];
    for (const pattern of patterns) {
        const match = caption.match(pattern);
        if (match?.[1]) {
            const candidate = cleanDecorativeText(match[1]).replace(/[()（）]\s*$/, '').trim().slice(0, 32);
            if (!candidate.toLowerCase().startsWith('ig') && !candidate.includes('@'))
                return candidate;
        }
    }
    const handleLine = caption
        .split('\n')
        .map((line) => line.trim())
        .find((line) => /(?:店|餐廳|咖啡|甜點|食堂)/.test(line) && !line.startsWith('#'));
    return handleLine ? cleanDecorativeText(handleLine).slice(0, 32) : '';
}
function extractArea(caption, address) {
    const haystack = `${caption}\n${address}`.replace(/臺/g, '台');
    const city = Object.keys(taiwanAreas_1.taiwanAreas).find((item) => haystack.includes(item)) ?? '';
    const district = city ? taiwanAreas_1.taiwanAreas[city].find((item) => haystack.includes(item)) ?? '' : '';
    return { city, district };
}
function extractAddress(caption) {
    const explicit = caption.match(/(?:📍\s*)?(?:地址|位置|地點)\s*[:：｜|]?\s*([^\n]+)/);
    if (explicit?.[1])
        return explicit[1].trim();
    const addressLine = caption
        .split('\n')
        .map((line) => line.trim())
        .find((line) => /(?:市|縣).{0,8}(?:區|鎮|鄉|市).{1,30}(?:路|街|巷|弄|號)/.test(line));
    return addressLine ?? '';
}
function extractSignatureFoods(caption) {
    const explicit = caption.match(/(?:招牌|必點|推薦餐點|推薦|我自己很愛吃|甜點推薦)\s*[:：｜|]?\s*([^\n#，,。]+)/);
    const explicitFood = explicit?.[1]?.trim() ?? '';
    const foods = explicitFood && /(?:麵|飯|蛋糕|甜點|咖啡|派|冰淇淋|燉飯|拉麵|火鍋|牛排|披薩|肉|蝦|魚|茶|草莓|巧克力)/.test(explicitFood) ? [explicitFood] : [];
    foods.push(...caption
        .split('\n')
        .map((line) => cleanDecorativeText(line.replace(/\$\s*\d+.*/, '')))
        .filter((line) => !/(?:店名|地址|電話|營業|附近|這家|必收|真的|追蹤|一定|試試|推薦)/.test(line))
        .filter((line) => /(?:義大利麵|蛋糕|派|冰淇淋|咖啡|甜點|燉飯|拉麵|火鍋|牛排|披薩)/.test(line))
        .filter((line) => line.length >= 3 && line.length <= 30));
    foods.push(...signatureFoodSignals.filter((keyword) => caption.includes(keyword)).sort((a, b) => b.length - a.length));
    return unique(foods).slice(0, 4);
}
function inferDailyMeals(caption) {
    const tags = [];
    if (/早午餐|早餐|brunch/i.test(caption))
        tags.push('早午餐');
    if (/午餐|中午|餐盒|便當|商業午餐/.test(caption))
        tags.push('午餐');
    if (/晚餐|晚間|晚上|聚餐|餐酒|燒肉|火鍋|義式|義大利麵|牛排|17:30|20:30/.test(caption))
        tags.push('晚餐');
    if (/宵夜|深夜|凌晨|夜食/.test(caption))
        tags.push('宵夜');
    if (/便當|餐盒|外帶/.test(caption))
        tags.push('便當');
    return unique(tags.filter((tag) => dailyMealTags.includes(tag))).slice(0, 3);
}
function inferCuisineTags(caption) {
    const tags = cuisineTags.filter((tag) => {
        const signals = cuisineSignals[tag] ?? [tag];
        return signals.some((signal) => caption.includes(signal));
    });
    if (caption.includes('義大利麵') && tags.includes('泰式')) {
        return unique(['義式', ...tags.filter((tag) => tag !== '泰式')]).slice(0, 4);
    }
    return unique(tags).slice(0, 4);
}
function extractTags(caption, dailyMeals, cuisines) {
    let directTags = categories_1.allTags.filter((tag) => caption.includes(tag));
    if (caption.includes('義大利麵') && cuisines.includes('義式')) {
        directTags = directTags.filter((tag) => tag !== '泰式');
    }
    const situationalTags = ['小吃', '點心', '甜點', '飲料', '咖啡廳', '聚餐', '約會'].filter((tag) => caption.includes(tag));
    if (caption.includes('咖啡') && !situationalTags.includes('咖啡廳'))
        situationalTags.push('咖啡廳');
    return unique([...dailyMeals, ...cuisines, ...directTags, ...situationalTags]).slice(0, 8);
}
function buildMissingFields(result) {
    const missing = [];
    if (!result.name)
        missing.push('店家名稱');
    if (!result.city)
        missing.push('城市');
    if (!result.district)
        missing.push('區域');
    if (!result.tags?.length)
        missing.push('至少一個標籤分類');
    return missing;
}
function buildSummary({ name, address, signatureFoods, dailyMeals, cuisines, }) {
    const parts = [
        name ? `店名：${name}` : '',
        address ? `地址：${address}` : '',
        signatureFoods.length ? `招牌：${signatureFoods.join('、')}` : '',
        dailyMeals.length ? `適合：${dailyMeals.join('、')}` : '',
        cuisines.length ? `料理：${cuisines.join('、')}` : '',
    ];
    return parts.filter(Boolean).join('\n');
}
async function analyzeSocialFoodUrl(url, caption = '') {
    const normalizedUrl = normalizeSocialUrl(url);
    if (!/^https?:\/\//i.test(normalizedUrl)) {
        throw new Error('Invalid URL');
    }
    const sourcePlatform = detectSourcePlatform(normalizedUrl);
    let cleanCaption = normalizeText(caption || extractCaptionFromSharedText(url));
    const backendResult = await analyzeWithConfiguredBackend(normalizedUrl, cleanCaption, sourcePlatform);
    if (backendResult)
        return backendResult;
    if (!cleanCaption) {
        try {
            cleanCaption = normalizeText(await fetchCaptionFromUrl(normalizedUrl, sourcePlatform));
        }
        catch {
            cleanCaption = '';
        }
    }
    if (!cleanCaption) {
        return {
            sourceUrl: normalizedUrl,
            sourcePlatform,
            sourceCaption: '',
            status: '尚未去過',
            isImportedFromSocial: true,
            normalizedUrl,
            aiSummary: '',
            aiConfidence: 0.18,
            missingFields: ['店家名稱', '城市', '區域', '至少一個標籤分類'],
        };
    }
    const address = extractAddress(cleanCaption);
    const area = extractArea(cleanCaption, address);
    const signatureFoods = extractSignatureFoods(cleanCaption);
    const inferredDailyMeals = inferDailyMeals(cleanCaption);
    const inferredCuisines = inferCuisineTags(cleanCaption);
    const tags = extractTags(cleanCaption, inferredDailyMeals, inferredCuisines);
    const name = extractRestaurantName(cleanCaption);
    const result = {
        name,
        city: area.city,
        district: area.district,
        address,
        signatureFood: signatureFoods.join('、'),
        tags,
        status: '尚未去過',
        sourceUrl: normalizedUrl,
        sourcePlatform,
        sourceCaption: cleanCaption,
        aiSummary: buildSummary({ name, address, signatureFoods, dailyMeals: inferredDailyMeals, cuisines: inferredCuisines }),
        aiExtractedTags: tags,
        aiDailyMealTags: inferredDailyMeals,
        aiCuisineTags: inferredCuisines,
        aiConfidence: 0.72,
        isImportedFromSocial: true,
    };
    const missingFields = buildMissingFields(result);
    return {
        ...result,
        normalizedUrl,
        missingFields,
        aiConfidence: missingFields.length ? 0.5 : 0.88,
    };
}
