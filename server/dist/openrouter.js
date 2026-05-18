import { allTags, cuisineTags, dailyMealTags } from './restaurantSchema.js';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_TIMEOUT_MS = 25000;
function getOpenRouterKey() {
    return process.env.OPENROUTER_API_KEY?.trim() ?? '';
}
function getModel() {
    return process.env.OPENROUTER_MODEL?.trim() || 'qwen/qwen3-next-80b-a3b-instruct:free';
}
function getAppReferer() {
    return process.env.APP_REFERER?.trim() || 'https://pocket-palette-ai.onrender.com';
}
function getAppTitle() {
    return process.env.APP_TITLE?.trim() || 'Pocket Palette';
}
function extractJsonObject(content) {
    const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const body = fenced?.[1] ?? content;
    const start = body.indexOf('{');
    const end = body.lastIndexOf('}');
    if (start < 0 || end < start)
        throw new Error('Model did not return a JSON object');
    return JSON.parse(body.slice(start, end + 1));
}
export async function analyzeRestaurantWithOpenRouter({ caption, url, platform, }) {
    const apiKey = getOpenRouterKey();
    if (!apiKey) {
        throw new Error('OpenRouter API key is not configured');
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);
    try {
        const response = await fetch(OPENROUTER_URL, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': getAppReferer(),
                'X-OpenRouter-Title': getAppTitle(),
            },
            body: JSON.stringify({
                model: getModel(),
                temperature: 0.1,
                max_tokens: 900,
                messages: [
                    {
                        role: 'system',
                        content: '你是 Pocket Palette 的台灣美食貼文解析器。只根據使用者提供的文案與連結輸出 JSON，不要編造缺少的資訊。所有輸出使用繁體中文。若欄位無法判斷，使用空字串或空陣列，並在 warnings 說明。',
                    },
                    {
                        role: 'user',
                        content: JSON.stringify({
                            task: '從社群美食貼文解析餐廳資訊。只回傳一個 JSON object，不要 markdown。',
                            url,
                            platform,
                            allowedTags: allTags,
                            allowedDailyMealTags: dailyMealTags,
                            allowedCuisineTags: cuisineTags,
                            requiredShape: {
                                name: '店家名稱，無法判斷則空字串',
                                city: '台灣縣市，必須是台北市/新北市/台南市等正式名稱，無法判斷則空字串',
                                district: '行政區，無法判斷則空字串',
                                address: '完整地址或位置文字，無法判斷則空字串',
                                signatureFood: '招牌或推薦食物，以頓號串接，無法判斷則空字串',
                                tags: '只能從 allowedTags 選，字串陣列',
                                aiDailyMealTags: '只能從 allowedDailyMealTags 選，字串陣列',
                                aiCuisineTags: '只能從 allowedCuisineTags 選，字串陣列',
                                aiSummary: '短摘要，列出店名/地址/招牌/適合餐食/料理種類',
                                aiConfidence: '0 到 1 的數字',
                                warnings: '無法判斷或需人工確認的地方，字串陣列',
                            },
                            caption,
                        }),
                    },
                ],
            }),
        });
        const payload = (await response.json());
        if (!response.ok) {
            console.error('OpenRouter request failed', response.status, payload.error?.message);
            throw new Error(payload.error?.message || `OpenRouter request failed: ${response.status}`);
        }
        const content = payload.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error(payload.choices?.[0]?.error?.message || 'OpenRouter returned an empty response');
        }
        return extractJsonObject(content);
    }
    finally {
        clearTimeout(timeout);
    }
}
