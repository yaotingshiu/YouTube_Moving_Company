# <img width="40" height="40" alt="icon" src="https://github.com/user-attachments/assets/a785551b-de90-44ba-8ca5-d495c1cbee8e" />  YouTube Moving Company ; YouTube 搬家公司

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Published-brightgreen?style=for-the-badge&logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/youtube-moving-company/cmgadokilonjjigdjafidjdggacbcmdm)

![Version](https://img.shields.io/badge/Version-1.0.1-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Chrome%20%7C%20Edge%20%7C%20Brave-lightgrey.svg)
![Manifest](https://img.shields.io/badge/Manifest-V3-orange.svg)
![UI Language](https://img.shields.io/badge/UI_Language-繁體中文_%7C_English-9cf.svg)<br>
![Language](https://img.shields.io/badge/Language-JavaScript%20%7C%20CSS3%20%7C%20HTML-f7df1e.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Status](https://img.shields.io/badge/Status-Active-success.svg)
[![Users](https://img.shields.io/chrome-web-store/users/cmgadokilonjjigdjafidjdggacbcmdm?style=flat-square&label=Users)](https://chromewebstore.google.com/detail/youtube-moving-company/cmgadokilonjjigdjafidjdggacbcmdm)
[![Rating](https://img.shields.io/chrome-web-store/stars/cmgadokilonjjigdjafidjdggacbcmdm?style=flat-square&label=Rating)](https://chromewebstore.google.com/detail/youtube-moving-company/cmgadokilonjjigdjafidjdggacbcmdm)

<p align="center">
  <a href="https://chromewebstore.google.com/detail/youtube-moving-company/cmgadokilonjjigdjafidjdggacbcmdm" target="_blank">
    <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_128x128.png" width="54" alt="Chrome Logo"><br>
    <b>點此前往 Chrome Web Store 免費安裝 YouTube Moving Company<br><br>Click here to install YouTube Moving Company from Chrome Web Store</b>
  </a>
</p>

---

## 核心功能 (Core Features)
* 多國語言支援：完整支援繁體中文與英文介面。
* Multi-language Support: Fully supports Traditional Chinese and English interfaces.<br><br>
* 頻道訂閱備份與還原：一鍵匯出當前帳號的訂閱清單，並自動移植至新帳號。
* Subscription Backup & Restore: Export channel subscriptions with one click and restore them to a new account.<br><br>
* 播放清單備份與還原：完整備份自訂歌單與影片，在新帳號中自動重建。
* Playlist Backup & Restore: Back up custom playlists and videos, recreating them automatically in the target account.<br><br>
* 帳號資料清理：提供批次取消訂閱與刪除歌單功能，並設有防誤觸機制。
* Account Data Cleanup: Batch unsubscribe from channels and delete playlists with built-in safety confirmation.<br><br>
* 操作簡單直覺：介面清晰零門檻，人人都能輕鬆上手。
* Simple & Intuitive: Clean interface with zero learning curve, easy for anyone to use.

---

### 軟體介面截圖 / Screenshots
<details>
  <summary>點擊展開介面截圖 / Click to expand screenshots</summary>
  <br>
  <img width="183" height="248" alt="s1" src="https://github.com/user-attachments/assets/7362997b-da92-4aad-85d4-5af115e19338" />
  <img width="183" height="248" alt="s2" src="https://github.com/user-attachments/assets/cef6358e-31b8-4c64-9d64-1107e3b90cf2" />
  <br><br>
  <img width="183" height="248" alt="s3" src="https://github.com/user-attachments/assets/ca8153fe-e5aa-4ec3-af45-713b7f1e2a95" />
  <img width="182" height="289" alt="s4" src="https://github.com/user-attachments/assets/45382b2d-b5d1-4ff9-a5e4-23159114d964" />
  <br><br>
  <img width="182" height="289" alt="s5" src="https://github.com/user-attachments/assets/72d4277f-142b-42b6-984a-3d4a201664fe" />
  <img width="182" height="290" alt="s6" src="https://github.com/user-attachments/assets/2c7a1430-ef6a-414a-9f9d-d9b9accc661a" />
  <br><br>
  <img width="420" height="168" alt="S7" src="https://github.com/user-attachments/assets/e105699c-a9c0-4c29-8cfb-0ff93a116574" />

</details>

---

### 繁體中文 (Traditional Chinese)
<details>
 <summary>點擊展開介紹 / Click to expand introduction</summary><br>
YouTube Moving Company 是一款專為 YouTube 使用者設計的瀏覽器擴充功能（基於 Manifest V3 架構）。透過深度封裝與調用 YouTube 內部的 InnerTube API，本程式能夠實現跨帳號一鍵無損備份與還原「頻道訂閱」及「自訂播放清單」，同時具備完善的狀態防護與高風險帳號清理功能。
<br><br>
【支援瀏覽器：Chrome、Edge、Brave】

## 🌟 主要功能

### 1. 頻道訂閱備份與還原
*   **全自動分頁掃描**：透過 API 自動解析分頁，完整擷取當前帳號所訂閱的所有頻道列表與 ID。
*   **獨家「擬人追蹤」模式 (Human-like Tracking)**：在還原訂閱時，自動於背景獲取該頻道專屬的授權通行證 (`params`)，並加入 1.5秒~2.5秒 的隨機抖動延遲。這能完美騙過 YouTube 的機器人偵測機制，**確保訂閱後的「通知鈴鐺」不會被官方強制停用（打斜線）**。
*   **極速模式雙切換**：若不需要解鎖鈴鐺，可隨時關閉擬人開關，切換回 600ms 極速無腦搬運模式。

### 2. 播放清單備份與還原
*   **深層歌單結構解析**：自動檢測帳號內所有自訂播放清單，並深度擷取清單內每一支影片的 ID。
*   **智慧重建與批次填入**：於目標帳號自動創建同名播放清單，並採用智慧分批處理（每批 50 支影片）自動填入內容，避免觸發 API 限流 (Rate Limit)。

### 3. 帳號清理任務
*   **批量退追蹤**：一鍵快速取消訂閱當前帳號下的所有已追蹤頻道。
*   **批量刪除歌單**：一鍵清空當前帳號下的所有自訂播放清單。
*   **防呆安全機制**：執行高風險的清理任務前，系統會強制彈出對話框，要求使用者輸入 `DELETE` 進行二次確認，徹底防止誤觸。

### 4. 進階防護與使用者體驗
*   **雙模式 UI 支援**：支援傳統頂部彈窗（Popup）與現代化的 Chrome 側邊欄（Side Panel）模式，並能智慧偵測防止重複開啟。
*   **跨分頁狀態鎖定 (Cross-Tab Protection)**：任務執行期間，程式會自動鎖定介面並記錄執行分頁 ID。若使用者關閉分頁或跳離 YouTube，系統將自動中斷任務並解除死鎖狀態。
*   **即時日誌與視覺化進度**：具備高質感的動態 UI、視覺化進度條、成功/失敗計數晶片與可展開的即時執行紀錄區塊。
*   **環境檢測與多語系主題**：自動識別 `www.youtube.com` 頁面與登入狀態，非正確環境會自動上鎖按鈕。內建繁中/英文介面，以及平滑過渡的深色 (Dark) / 淺色 (Light) 玻璃質感主題。

---

## ⚙️ 技術架構

*   **擴充功能規範**: Manifest V3
*   **核心技術**: JavaScript (ES6+), HTML5, CSS3 (Flexbox, CSS Variables, 擬態玻璃 UI)
*   **API 交互與授權**: 直接與 YouTube InnerTube API 進行安全通訊，透過 `SAPISIDHASH` 即時生成驗證請求標頭，完全依賴本地端 Session，**無需額外申請或授權第三方 Google OAuth 權限**。
*   **權限需求**:
    *   `storage`: 用於本地儲存備份快取、語言、主題狀態及日誌紀錄。
    *   `tabs`: 用於檢測當前分頁網址、確保任務在正確分頁執行，以及 Side Panel 狀態同步。
    *   `scripting` & `host_permissions`: 用於在 YouTube 頁面安全地注入與執行自動化搬家腳本。
    *   `sidePanel`: 支援 Chrome 側邊欄面板模式。

---

## 📥 安裝說明

### 方式 A：透過 Chrome 線上應用程式商店安裝（推薦）
點擊下方連結直達商店頁面免費安裝：
👉 **[下載 YouTube Moving Company](https://chromewebstore.google.com/detail/youtube-moving-company/cmgadokilonjjigdjafidjdggacbcmdm)**

---

### 方式 B：透過開發者模式載入（原始碼測試）

1.  下載或 Clone 本專案原始碼至本地電腦：
    ```bash
    git clone [https://github.com/yaotingshiu/YouTube_Moving_Company.git](https://github.com/yaotingshiu/YouTube_Moving_Company.git)
    ```
2.  打開 Google Chrome 瀏覽器，於網址列輸入 `chrome://extensions/` 並按下 Enter。
3.  開啟右上角 **「開發者模式」 (Developer mode)** 開關。
4.  點擊左上角 **「載入未打包擴充功能」 (Load unpacked)**。
5.  選取本專案的根目錄資料夾即可完成安裝。

---

## 📖 操作指南

### 帳號資料搬家流程（舊帳號 → 新帳號）

1.  **備份舊帳號資料**：
    *   登入舊 YouTube 帳號並保持網頁開啟。
    *   打開本擴充功能，於「頻道訂閱」分頁點擊 **「儲存頻道訂閱」**。
    *   切換至「播放清單」分頁，點擊 **「儲存播放清單」**。
    *   系統將自動抓取並把資料安全儲存於您的瀏覽器本地快取中。
2.  **還原至新帳號**：
    *   於同一個瀏覽器切換登入至新 YouTube 帳號，並**重新整理 (F5)** YouTube 頁面。
    *   打開本擴充功能，點擊 **「還原頻道訂閱」**（建議開啟擬人追蹤模式）或 **「還原播放清單」**。
    *   系統即開始自動發起批量還原任務，您可以透過下方的日誌區塊觀看即時進度。

---

## ⚠️ 免責聲明與安全說明

*   **絕對的隱私安全**：本擴充功能的所有 API 交互均於使用者的本地端瀏覽器完成。**我們絕不收集、傳輸、上傳或出售任何使用者的個人資料、Cookie 或 Token 至任何外部伺服器**。
*   **操作不可逆警告**：執行「帳號清理任務」中的退追蹤與刪除歌單屬不可逆之操作，請務必於執行前確認是否已確實備份重要資料。

</details>

---

### English
<details>
 <summary>Click to expand introduction</summary><br>
YouTube Moving Company is a powerful browser extension (based on Manifest V3) specifically designed for YouTube users. By encapsulating and utilizing YouTube's internal InnerTube API, this extension enables seamless, one-click cross-account backing up and restoring of "Channel Subscriptions" and "Custom Playlists", along with offering high-risk account cleanup functionalities.
<br><br>
【Supported Browsers: Chrome, Edge, Brave】

## 🌟 Key Features

### 1. Subscription Backup & Restore
*   **Automated Pagination Scanning**: Automatically parses and fetches the complete list of subscribed channel IDs from the current account via API.
*   **Exclusive "Human-like Tracking" Mode**: During restoration, it fetches channel-specific authorization tokens (`params`) in the background and applies a random jitter delay (1.5s - 2.5s). This perfectly simulates human behavior to bypass bot detection, **ensuring the notification bell is NOT forcibly disabled by YouTube**.
*   **Fast Mode Toggle**: Users can toggle off the human-like mode for a pure ID-based, lightning-fast execution (600ms per channel).

### 2. Playlist Backup & Restore
*   **Deep Playlist Parsing**: Automatically detects all custom playlists in the account and meticulously extracts every single video ID within them.
*   **Smart Reconstruction & Batch Filling**: Creates identically named playlists in the target account and intelligently chunks video additions (50 videos per batch) to prevent triggering API rate limits.

### 3. Account Cleanup Tasks
*   **Batch Unsubscribe**: One-click action to unsubscribe from all currently followed channels.
*   **Batch Playlist Deletion**: One-click action to delete all custom playlists under the current account.
*   **Failsafe Mechanism**: Before executing high-risk cleanup operations, a mandatory modal requires the user to manually type `DELETE` to confirm, effectively preventing accidental data loss.

### 4. Advanced Protection & UX
*   **Dual UI Modes**: Supports both traditional Popup mode and the modern Chrome Side Panel mode, with smart detection to prevent overlapping usage.
*   **Cross-Tab State Protection**: The UI locks safely while a task is running. If the executing tab is closed or navigated away from YouTube, the system automatically aborts the task and releases the UI lock to prevent deadlocks.
*   **Live Logs & Visual Progress**: Features dynamic UI updates, visual progress bars, success/fail counters, and an expandable real-time execution log.
*   **Environment Detection & Localization**: Automatically verifies the `www.youtube.com` domain and login status, locking action buttons in invalid environments. Includes bilingual support (En/Zh) and a smooth Dark/Light glassmorphism theme toggle.

---

## ⚙️ Technical Architecture

*   **Extension Spec**: Manifest V3
*   **Core Tech Stack**: JavaScript (ES6+), HTML5, CSS3 (Flexbox, CSS Variables, Glassmorphism UI)
*   **API Interaction**: Communicates securely and directly with the YouTube InnerTube API. It generates `SAPISIDHASH` headers dynamically based on local session cookies, **requiring NO third-party Google OAuth permissions**.
*   **Required Permissions**:
    *   `storage`: For storing backup cache, language, theme preferences, and local logs.
    *   `tabs`: To verify tab URLs, monitor running tab states, and handle Side Panel synchronization.
    *   `scripting` & `host_permissions`: To safely inject and execute the migration scripts directly on the YouTube web page.
    *   `sidePanel`: To support Chrome's native Side Panel feature.

---

## 📥 Installation

### Method A: Install via Chrome Web Store (Recommended)
Get it directly from the Chrome Web Store:
👉 **[Download YouTube Moving Company](https://chromewebstore.google.com/detail/youtube-moving-company/cmgadokilonjjigdjafidjdggacbcmdm)**

---

### Method B: Load Unpacked Extension (Developer Testing)

1.  Download or clone the source code to your local machine:
    ```bash
    git clone [https://github.com/yaotingshiu/YouTube_Moving_Company.git](https://github.com/yaotingshiu/YouTube_Moving_Company.git)
    ```
2.  Open Google Chrome, navigate to `chrome://extensions/` in the address bar, and press Enter.
3.  Enable **"Developer mode"** in the top right corner.
4.  Click the **"Load unpacked"** button in the top left.
5.  Select the project's root folder to complete the installation.

---

## 📖 User Guide

### Account Migration Workflow (Old Account → New Account)

1.  **Backup Data from the Old Account**:
    *   Log in to your old YouTube account and keep the tab open.
    *   Open the extension, go to the "Subscriptions" tab, and click **"Backup Subscriptions"**.
    *   Switch to the "Playlists" tab and click **"Backup Playlists"**.
    *   The system will extract and securely store your data in the browser's local cache.
2.  **Restore Data to the New Account**:
    *   Switch to your new YouTube account in the same browser and **Refresh (F5)** the YouTube page.
    *   Open the extension and click **"Restore Subscriptions"** (Human-like mode recommended) or **"Restore Playlists"**.
    *   The system will initiate the batch restoration process. You can monitor the real-time progress in the log section below.

---

## ⚠️ Disclaimer & Privacy Safety

*   **Absolute Privacy**: All API interactions are executed entirely on your local browser. **We NEVER collect, transmit, upload, or sell your personal data, cookies, or tokens to any external servers**.
*   **Irreversible Actions**: The account cleanup tasks (unsubscribing and deleting playlists) are irreversible. Please ensure your important data is fully backed up before executing.

</details>

---

## ☕ 贊助與專案資訊(Support the Developer & Info)

如果您覺得這款軟體為您節省了大量時間，歡迎請開發者喝杯咖啡！您的支持是我們持續更新與優化工具的最大動力。 <br><br>
If this tool has saved you time, consider buying the developer a coffee! Your support is the greatest motivation for continuous updates and bug fixes.

💳 **贊助連結(Donation Link)**：[點此透過 PayPal 贊助我 (Donate via PayPal)](https://www.paypal.com/ncp/payment/D7GSCCJEHTSFN)

### 專案資訊(Project Information)：
*   **專案名稱(Project Name)**：YouTube Moving Company
*   **版本(Version)**：v1.0.1
*   **開發者(Developer)**：許耀庭 (HsuYaoTing)
*   **聯絡信箱(Email)**：speed132454@gmail.com
*   **Chrome 商店網址(Chrome Web Store)**：[YouTube Moving Company](https://chromewebstore.google.com/detail/youtube-moving-company/cmgadokilonjjigdjafidjdggacbcmdm)
*   **GitHub**：[https://github.com/yaotingshiu/YouTube_Moving_Company](https://github.com/yaotingshiu/YouTube_Moving_Company)

---
