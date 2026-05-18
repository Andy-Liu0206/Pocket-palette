# Pocket Palette Flutter Migration

本專案已加入 Flutter app 原始碼：

- `pubspec.yaml`
- `analysis_options.yaml`
- `lib/main.dart`

舊的 HTML prototype 仍保留在 `home/`、`add/`、`list/`、`map/`、`details/`、`share/`，可作為 UI 對照。

## 目前狀態

本專案已在 `.tooling/flutter` 安裝本機 Flutter SDK，版本為 Flutter `3.41.9` / Dart `3.11.5`。目前已產生 `web/` 平台目錄，可直接用 Flutter Web 在 iPhone Safari 測 UI。

本機 SDK 不需要加入全域 PATH。PowerShell 可用：

```powershell
.\scripts\start_flutter_web.ps1
```

目前測試伺服器使用：

```text
http://0.0.0.0:8080
```

iPhone 請改用電腦的區網 IP，例如：

```text
http://172.31.15.254:8080
```

若 IP 改變，可用：

```powershell
ipconfig
```

查看 Wi-Fi adapter 的 IPv4 Address。

這台電腦最初沒有全域 `flutter` / `dart` 指令；若日後要改成全域安裝，可另外把 `.tooling/flutter/bin` 加到使用者 PATH。

<!-- Previous fresh-install commands kept below for reference. -->

安裝 Flutter 後，在專案根目錄執行：

```powershell
flutter create --platforms=ios,android,web .
flutter pub get
flutter analyze
flutter run
```

若只想先產生 iOS 專案，請在 Mac 上執行：

```bash
flutter create --platforms=ios .
flutter pub get
```

## 在 iPhone 13 Pro 上實測

### 方案 A：Native iOS 實機測試

這是最接近正式 APP 的方式，但必須使用 macOS，因為 iOS app 需要 Xcode 編譯與簽章。

需求：

- Mac，建議安裝最新版 macOS 與 Xcode
- Flutter SDK
- iPhone 13 Pro
- Apple ID
- USB 連接線，第一次設定建議用有線連接

步驟：

```bash
flutter doctor
flutter create --platforms=ios .
flutter pub get
open ios/Runner.xcworkspace
```

在 Xcode：

1. 選擇 `Runner` target。
2. 到 `Signing & Capabilities`。
3. 勾選 `Automatically manage signing`。
4. 選擇你的 Apple ID / Team。
5. 確認 Bundle Identifier 是唯一的。

回到終端機：

```bash
flutter devices
flutter run -d <你的 iPhone device id>
```

修改 Dart UI 後：

- 終端機按 `r` 觸發 hot reload。
- VS Code / Android Studio 可設定存檔時 hot reload。
- 若修改 iOS 原生檔案、權限、Info.plist、Share Extension，通常需要完整重跑。

### 方案 B：Windows 上用 iPhone 快速看 Flutter Web

如果你暫時沒有 Mac，可以先用 iPhone Safari 測 Flutter Web 版本。這不是 native iOS app，但很適合快速看 UI、流程、表單和互動。

在 Windows 安裝 Flutter 後：

```powershell
flutter create --platforms=web .
flutter pub get
flutter run -d web-server --web-hostname 0.0.0.0 --web-port 8080
```

查詢 Windows 電腦的區網 IP：

```powershell
ipconfig
```

在 iPhone Safari 開啟：

```text
http://<你的電腦區網IP>:8080
```

手機與電腦必須在同一個 Wi-Fi。若無法開啟，檢查 Windows 防火牆是否允許 8080 port。

## Hot Reload 開發節奏

推薦 native iOS 開發節奏：

1. Mac 連 iPhone。
2. `flutter run -d <device id>`。
3. 修改 `lib/main.dart`。
4. 按 `r`，或使用 IDE 的 hot reload。
5. 大改 app 啟動流程、原生設定、分享 extension 時，停止後重新 `flutter run`。

推薦 Flutter Web 快速預覽節奏：

1. `flutter run -d web-server --web-hostname 0.0.0.0 --web-port 8080`。
2. iPhone Safari 開區網網址。
3. 修改 Dart 檔。
4. 使用 hot reload / hot restart，必要時手機重新整理頁面。

## 分享匯入功能的 Flutter 實作方向

目前 `lib/main.dart` 已有 `ShareImportPage`，模擬 IG / Threads 分享後的解析確認流程。

後續做 native 分享入口時：

- iOS：新增 Share Extension，接收 `public.url` 與 `public.plain-text`，把資料交給主 app。
- Android：新增 `ACTION_SEND` / `ACTION_SEND_MULTIPLE` intent filter，接收 `text/plain`。
- Flutter 層：將分享 payload 轉成 `ShareImportPage(initialText: payloadText)`。

建議資料模型：

```dart
class SharePayload {
  const SharePayload({
    required this.source,
    required this.text,
    this.url,
    this.title,
  });

  final String source;
  final String text;
  final String? url;
  final String? title;
}
```

## 下一步建議

1. 在這台 Windows 安裝 Flutter SDK，先跑 Flutter Web。
2. 若要 iPhone native 實機 hot reload，將專案放到 Mac。
3. 產生 iOS 平台檔後，再加入 iOS Share Extension。
4. 把目前 `ShareImportPage` 的 mock parser 拆成 service，之後可接後端或 AI parser。
