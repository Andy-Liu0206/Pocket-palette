# Social Share Import

這個 prototype 的 `share/code.html` 模擬使用者從 Instagram 貼文、Reels 或 Threads 分享到 Pocket Palette 後，APP 開啟的匯入確認流程。

## 目標流程

1. 使用者在 Instagram 或 Threads 點選分享。
2. 選擇 Pocket Palette。
3. APP 接收分享 payload：`url`、`text`、可選的 `title`。
4. 解析器擷取來源平台、貼文連結、可能店名、料理類型、地區與 Google Maps 搜尋關鍵字。
5. 使用者在確認頁修正欄位。
6. 儲存成一筆狀態為「想去」的店家，並保留原始貼文連結。

## Payload Contract

```json
{
  "source": "instagram_post | instagram_reel | threads | unknown",
  "url": "https://www.instagram.com/reel/...",
  "text": "貼文標題或分享文字",
  "title": "可選標題",
  "receivedAt": "2026-05-11T00:00:00.000Z"
}
```

## Parser Output

```json
{
  "restaurantName": "Osteria Bianca",
  "category": "義式料理",
  "area": "台北",
  "mapsQuery": "Osteria Bianca 台北",
  "notes": "來源、推薦菜色、原始連結",
  "confidence": "high | needs_review"
}
```

## Native Integration Notes

iOS 可用 Share Extension 接收 `public.url` 與 `public.plain-text`，再透過 App Group 或 deep link 交給主 APP 的匯入頁。

Android 可在 `AndroidManifest.xml` 設定 `ACTION_SEND` / `ACTION_SEND_MULTIPLE` intent filter，支援 `text/plain`，從 `Intent.EXTRA_TEXT` 取得貼文連結與文字。

若先做 PWA，可在 manifest 加上 Web Share Target，將 `title`、`text`、`url` 送到 `/share`，目前 prototype 已支援用 query string 測試：

```text
share/code.html?text=Osteria%20Bianca%20台北&url=https%3A%2F%2Fwww.instagram.com%2Freel%2FC8FoodieMap%2F
```
