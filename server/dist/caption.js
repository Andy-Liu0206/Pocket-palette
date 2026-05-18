const METADATA_TIMEOUT_MS = 12000;
export function extractUrlFromSharedText(value) {
    const match = value.match(/https?:\/\/[^\s<>"'，。)）]+/i);
    return match?.[0] ?? value.trim();
}
function shouldPreserveSearchParams(parsed) {
    const host = parsed.hostname.toLowerCase();
    return host.includes('google.') || host.includes('goo.gl') || host.includes('maps.app.goo.gl');
}
export function normalizeSocialUrl(value) {
    const trimmed = extractUrlFromSharedText(value);
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
export function detectSourcePlatform(url) {
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
export function extractCaptionFromSharedText(value) {
    return value
        .replace(/https?:\/\/[^\s<>"'，。)）]+/gi, '')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !/^分享|^傳送|^看這|^watch\b/i.test(line))
        .join('\n')
        .trim();
}
export function decodeHtml(value) {
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
export function extractCaptionFromMetadata(html, platform) {
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
    return stripHtml([description, title].filter(Boolean).join('\n'));
}
export async function fetchCaptionFromUrl(url, platform) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), METADATA_TIMEOUT_MS);
    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; PocketPaletteBot/0.1; +https://pocket-palette-ai.onrender.com)',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
        });
        if (!response.ok)
            throw new Error(`Metadata fetch failed: ${response.status}`);
        const html = await response.text();
        return extractCaptionFromMetadata(html, platform);
    }
    finally {
        clearTimeout(timeout);
    }
}
