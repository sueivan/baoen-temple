# 報恩寺 · 手機簡易版

一座為手機觸控設計的 3D 虛擬寺院。沿著石徑穿過山門，上石階後靠近大殿，門會自動開啟。

**版本：2.0.3**。以手機使用為主，沒有另外設計電腦版操作介面。這是可加入手機主畫面的網頁 App（PWA），不是 APK 或 App Store 安裝包。

## 手機怎麼操作

1. 點「開始漫步」。
2. 按住左下圓盤，往想去的方向拖曳；放開就停止。
3. 點底部「合掌／禮拜／木魚／念珠」互動。動作結束後可繼續行走。
4. 點右下「回山門」回到起點。

視角自動跟隨，不需調整鏡頭。聲音預設關閉；右上可開啟音效，選單內可選環境音、語言與省電模式。環境音是合成低音，不是人聲誦經。繁體中文為預設，另提供簡體中文及英文。

## 放上 GitHub Pages

1. 在 GitHub 建立一個公開倉庫，例如 `baoen-temple`。
2. 解壓縮本套件，使用 **Add file → Upload files**，把裡面的檔案及 `assets` 等資料夾一起上傳到倉庫根目錄。首頁名稱必須是 **`index.html`**。
3. 開啟 **Settings → Pages**。
4. Source 選 **Deploy from a branch**；Branch 選 **main**，資料夾選 **/(root)**，再按 **Save**。
5. 等候部署完成，用手機開啟 GitHub 顯示的網站網址。

不要只上傳 ZIP，也不要只上傳 `index.html`；網頁需要整個 `assets` 資料夾。所有路徑均使用相對路徑，適用於 GitHub Pages 的倉庫子目錄。

[GitHub 官方發布設定說明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## 加入手機主畫面

- **iPhone：** 用 Safari 開啟網站 → 分享 → 加入主畫面。
- **Android：** 用 Chrome 開啟網站 → 瀏覽器選單 → 安裝應用程式／加到主畫面。名稱依瀏覽器版本而異。

首次開啟需要連線。主要檔案成功快取後可離線使用；瀏覽器清除網站資料或回收快取後，需要再次連線。手機主畫面模式由手機瀏覽器決定，不保證每台裝置顯示相同的安裝提示。

## 檔案與維護

| 路徑 | 用途 |
| --- | --- |
| `index.html` | 手機介面入口 |
| `assets/css/style.css` | 手機版面、橫向版面、系統明暗外觀 |
| `assets/js/world.js` | 寺院、佛像、人物與門扇 |
| `assets/js/app.js` | 主流程、動畫與按鈕 |
| `assets/js/input.js` | 手機搖桿與放開即停 |
| `assets/js/navigation.js` | 牆面、石階、大殿入口的行走邊界 |
| `assets/js/i18n.js` | 繁中、簡中、英文文字 |
| `assets/vendor/` | 隨專案附上的 Three.js 與 MIT 授權 |
| `manifest.webmanifest`、`sw.js` | 主畫面圖示與離線快取 |
| `tests/`、`docs/VERIFICATION.md` | 程式測試與驗證範圍 |

無需 Node.js 或建置工具即可部署；開發者測試使用 Node.js 18 以上，在專案根目錄執行：

```sh
node --test tests/*.test.cjs
```

更新程式時，同步調整 `sw.js` 的快取版本名稱，以及介面中的版本號。

## 相容性與驗證範圍

需要支援 WebGL 的現代手機瀏覽器。已完成 **17 項程式測試**，包含移動邊界、開門、觸控釋放／取消、多指操作、儲存限制與資源完整性。

本次測試環境無法建立 WebGL 繪圖內容，已確認會顯示重新載入提示；**尚未完成真實 iPhone／Android 的 3D 畫面、音效、安裝、離線及流暢度測試**。首次放上 GitHub 後，請用手機實際走到大殿，再測試四個互動。

## 內容與授權

場景是在提供的原始程式上修改的想像創作，不代表任何實體同名寺院的官方服務。程式沒有帳號、聊天、玩家連線或功德計分。

Three.js 保留原版使用的 **r128**，已隨套件附上，不需從外部 CDN 下載。此為相容性選擇，不代表最新版本。第三方授權見 `THIRD_PARTY_NOTICES.md`；原創部分未另行指定開源授權。
