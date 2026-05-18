# Pocket Palette

React Native + Expo + TypeScript 美食地圖 App 原型。

## 功能

- Bottom Tab Navigation：Home、List、Map、Add、Profile
- 本地 mock data 與 AsyncStorage 儲存餐廳資料
- Home 搜尋與 Recently Added
- List 口袋清單篩選
- Restaurant Detail 更新狀態、評分、評論與開啟 Google Maps
- Map 請求定位、顯示目前位置、依距離顯示附近收藏餐廳
- Add 手動新增與社群連結匯入 mock AI 流程
- Profile 探店統計

## 安裝

```powershell
npm.cmd install
```

PowerShell 可能會擋 `npm.ps1`，建議使用 `npm.cmd`。

## Google Maps iOS API Key

不要把 API Key 寫進元件。請建立本機 `.env`：

```text
GOOGLE_MAPS_IOS_API_KEY=你的 Google Maps SDK for iOS API Key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=你的 Google Maps Platform API Key
```

`app.config.ts` 會讀取 `GOOGLE_MAPS_IOS_API_KEY` 並寫入 Expo iOS config：

```ts
ios.config.googleMapsApiKey
```

`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` 會給 App runtime 使用，用於 Map 頁的 Google Places Text Search 精準解析餐廳 POI 座標與營業狀態。因為這個 key 會進入前端 bundle，請在 Google Cloud Console 對 key 設定 iOS bundle identifier、API 限制與配額限制。

`.env` 已加入 `.gitignore`，不會提交到版本控制。可以參考 `.env.example`。

注意：iOS Google Maps SDK key 屬於原生設定，若要在 iPhone 上完整驗證 Google provider，通常需要 development build 或正式 build；Expo Go 可能不會套用你本機的原生 SDK key。

## 啟動

```powershell
npm.cmd run start
```

目前 start script 使用 port `8082`：

```text
exp://<電腦區網 IP>:8082
```

## 驗證

```powershell
npm.cmd run typecheck
npx.cmd expo export --platform ios --output-dir .tooling\expo-export-test --clear
```

## 專案結構

```text
src/
  components/
  context/
  data/
  screens/
  types/
  utils/
```

社群匯入 mock AI 入口：

```text
src/utils/socialImport.ts
```

## OpenRouter AI 匯入後端

Pocket Palette 的 Add > 連結匯入可串接 `server/` 內的小型 Node/Express 後端。後端會抓取公開貼文 metadata，呼叫 OpenRouter 模型 `qwen/qwen3-next-80b-a3b-instruct:free`，再回傳 App 目前使用的餐廳草稿格式。

Render 部署建議：

1. 在 Render 建立 Web Service，root directory 設為 `server`。
2. Build command：`npm install && npm run build`
3. Start command：`npm start`
4. Health check path：`/health`
5. 設定 Render 環境變數：
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL=qwen/qwen3-next-80b-a3b-instruct:free`
   - `APP_TITLE=Pocket Palette`
   - `APP_REFERER=https://your-render-service.onrender.com`
6. 在 App 的 `.env` 設定：

```text
EXPO_PUBLIC_IMPORT_ANALYSIS_URL=https://your-render-service.onrender.com/import/analyze
```

OpenRouter API key 只放 Render 後台，不要放進 Expo app。
