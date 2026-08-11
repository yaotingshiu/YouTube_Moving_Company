const isSidePanelMode = window.location.search.includes('view=sidepanel');
const isPopupMode = !isSidePanelMode;

if (isSidePanelMode) {
  const sendHeartbeat = () => {
    chrome.storage.session.set({ sidePanelLastActive: Date.now() });
  };
  sendHeartbeat();
  const heartbeatTimer = setInterval(sendHeartbeat, 800);

  const stopHeartbeat = () => {
    clearInterval(heartbeatTimer);
    chrome.storage.session.set({ sidePanelLastActive: 0 });
  };
  window.addEventListener('beforeunload', stopHeartbeat);
  window.addEventListener('pagehide', stopHeartbeat);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'session' && changes.cmdCloseSidePanel && changes.cmdCloseSidePanel.newValue) {
      stopHeartbeat();
      window.close(); 
    }
  });
}

let isRunning = false;
let isEnvOk = false;
let currentLang = 'zh';
let rawUserName = '';
let lastSuccess = 0; 
let lastFail = 0;
let executingTabId = null;

const i18n = {
  zh: {
    btn_panel: "側邊欄", nav_subs: "頻道訂閱", nav_playlists: "播放清單", nav_clean: "帳號清理", nav_about: "關於",
    card_subs_title: "備份與還原頻道訂閱", btn_backup_subs: "儲存頻道訂閱", btn_restore_subs_empty: "還原頻道訂閱 (無快取)", btn_restore_subs_fmt: "還原頻道訂閱 ({0})", btn_del_cache: "刪除",
    card_pl_title: "備份與還原播放清單", btn_backup_pl: "儲存播放清單", btn_restore_pl_empty: "還原播放清單 (無快取)", btn_restore_pl_fmt: "還原播放清單 ({0})",
    card_clean_title: "選擇要清理的項目", chk_clean_subs: "移除追蹤所有頻道", chk_clean_pls: "刪除所有播放清單", btn_start_clean: "開始執行清理任務",
    label_progress: "處理進度", label_success: "成功：", label_fail: "失敗：", btn_stop: "強制停止任務", label_donate: "請我喝咖啡",
    label_log: "即時執行紀錄", btn_clear_log: "清空",
    modal_title: "高風險操作驗證", modal_desc: "您即將執行清理作業，請輸入 DELETE 以確認執行：", modal_cancel: "取消", modal_confirm: "確定",
    status_checking: "正在檢測 YouTube 登入狀態...",
    status_not_yt: "切換至 www.youtube.com 即可開始使用",
    status_not_logged: "未登入 YouTube 帳號",
    status_user: "已登入：{0}",
    user_default: "已登入用戶",
    err_not_yt: "請先切換至 YouTube 網頁並按 F5 重新整理！", err_no_backup: "找不到頻道備份快取！", err_verify_fail: "[錯誤] 驗證失敗或取消操作。",
    conn_lost: "連線中斷！請切換至 YouTube 網頁按 F5 重新整理後再點擊發起！",
    msg_ready: "等待操作中...\n",
    log_ok: "[成功]", log_fail: "[失敗]", log_done: "[完成]", log_err: "[錯誤]", log_info: "[系統]",
    sp_notice_title: "側邊欄使用中",
    sp_notice_desc: "偵測到側邊欄已在右側開啟，是否關閉側邊欄？",
    btn_close_sp: "是，關閉側邊欄",
    btn_keep_sp: "否，繼續使用側邊欄",
    cross_tab_modal_title: "任務執行中",
    cross_tab_modal_desc: "【{0}】正在其他分頁執行中，是否跳轉至該分頁？",
    btn_jump_tab: "是，跳轉至該分頁",
    btn_close_window: "否，關閉視窗",
    act_backup_subs: "備份頻道訂閱",
    act_restore_subs: "還原頻道訂閱",
    act_backup_pls: "備份播放清單",
    act_restore_pls: "還原播放清單",
    act_clean: "帳號清理",
    info_backup_subs: "正在備份頻道訂閱...",
    info_restore_subs: "正在還原頻道訂閱...",
    info_backup_pls: "正在備份播放清單...",
    info_restore_pls: "正在還原播放清單...",
    info_clean: "開始執行帳號清理任務...",
    info_stop: "已強制中斷任務",
    title_del_cache: "刪除快取",
    title_theme_toggle: "切換主題",
    chk_human_mode: "擬人追蹤",
    info_title_human: "關於「擬人追蹤」",
    info_desc_human: "開啟此功能時，程式會模擬真人的操作頻率（隨機延遲 1.5~2.5 秒）並獲取完整授權。<br><br>這樣做能確保頻道訂閱後，通知鈴鐺不會被 YouTube 系統強制停用。<br><br>※ 搬運速度會較慢。關閉則恢復極速模式。",
    btn_understood: "了解",
    logo_joke: "我沒有任何作用!!!",
    toast_running_warn: "任務執行中，請勿關閉或重整網頁！",
    info_title_subs: "頻道訂閱指南",
    info_desc_subs: "【備份】將目前登入帳號的「所有訂閱頻道」儲存下來。<br><br>【還原】將儲存好的頻道，訂閱到目前登入的新帳號。<br><br>💡 <b>使用步驟：</b>在舊帳號點擊「備份」 ➔ 切換成新帳號 ➔ 點擊「還原」。",
    info_title_pls: "播放清單指南",
    info_desc_pls: "【備份】儲存所有自訂播放清單的「影片」與「名稱」。<br><br>【還原】在新帳號中，重新建立這些清單並放入影片。<br><br>⚠️ <b>注意：</b>為防 YouTube 結構阻擋，程式若抓不到原本的名稱，會自動改用亂碼顯示。如果還原後名字不對，請手動改回真實名稱即可。",
    info_title_clean: "帳號清理警告",
    info_desc_clean: "此功能會「大規模」刪除帳號內的所有訂閱或歌單。<br><br>⚠️ <b>極度重要：</b>執行前，請務必往上看「登入狀態」確認帳號名稱！確定你要清空的是目前這個帳號再執行，以免誤刪主帳號資料！",
    about_html: `
      <strong>軟體名稱：</strong>YouTube Moving Company<br>
      <strong>版本：</strong>v1.0.1<br>
      <strong>聯絡信箱：</strong>speed132454@gmail.com<br>
      <strong>原始碼：</strong><a href="https://github.com/yaotingshiu/YouTube_Moving_Company" target="_blank" style="color:var(--text-primary);">github.com/.../YouTube_Moving_Company</a><br>
      <strong>開發者：</strong>許耀庭
    `
  },
  en: {
    btn_panel: "Panel", nav_subs: "Subscriptions", nav_playlists: "Playlists", nav_clean: "Clean Up", nav_about: "About",
    card_subs_title: "Backup & Restore Subscriptions", btn_backup_subs: "Backup Subscriptions", btn_restore_subs_empty: "Restore Subs (Empty)", btn_restore_subs_fmt: "Restore Subs ({0})", btn_del_cache: "Del",
    card_pl_title: "Backup & Restore Playlists", btn_backup_pl: "Backup Playlists", btn_restore_pl_empty: "Restore Playlists (Empty)", btn_restore_pl_fmt: "Restore Playlists ({0})",
    card_clean_title: "Select items to clean", chk_clean_subs: "Unsubscribe all channels", chk_clean_pls: "Delete all custom playlists", btn_start_clean: "Start Cleanup Task",
    label_progress: "Progress", label_success: "Success: ", label_fail: "Fail: ", btn_stop: "Stop Task", label_donate: "Donate",
    label_log: "Live Execution Log", btn_clear_log: "Clear",
    modal_title: "High Risk Operation", modal_desc: "You are about to perform a cleanup. Type DELETE to confirm:", modal_cancel: "Cancel", modal_confirm: "Confirm",
    status_checking: "Checking YouTube login status...",
    status_not_yt: "Switch to www.youtube.com to start",
    status_not_logged: "Not logged in to YouTube",
    status_user: "Logged in: {0}",
    user_default: "Logged in User",
    err_not_yt: "Please switch to YouTube and refresh (F5)!", err_no_backup: "Backup cache not found!", err_verify_fail: "[ERROR] Verification failed.",
    conn_lost: "Connection lost! Please switch to YouTube tab and refresh (F5) before retrying!",
    msg_ready: "Waiting for operation...\n",
    log_ok: "[OK]", log_fail: "[FAIL]", log_done: "[DONE]", log_err: "[ERROR]", log_info: "[SYS]",
    sp_notice_title: "Side Panel Active",
    sp_notice_desc: "Side Panel is open on the right. Would you like to close it?",
    btn_close_sp: "Yes, Close Side Panel",
    btn_keep_sp: "No, Keep Side Panel",
    cross_tab_modal_title: "Task Running",
    cross_tab_modal_desc: "【{0}】is currently running on another tab. Switch to that tab?",
    btn_jump_tab: "Yes, Switch to Tab",
    btn_close_window: "No, Close Window",
    act_backup_subs: "Backup Subscriptions",
    act_restore_subs: "Restore Subscriptions",
    act_backup_pls: "Backup Playlists",
    act_restore_pls: "Restore Playlists",
    act_clean: "Account Cleanup",
    info_backup_subs: "Backing up subscriptions...",
    info_restore_subs: "Restoring subscriptions...",
    info_backup_pls: "Backing up playlists...",
    info_restore_pls: "Restoring playlists...",
    info_clean: "Starting cleanup task...",
    info_stop: "Task force stopped.",
    title_del_cache: "Delete Cache",
    title_theme_toggle: "Toggle Theme",
    chk_human_mode: "Human-like Tracking",
    info_title_human: "About Human-like Tracking",
    info_desc_human: "When enabled, the program simulates human behavior with random delays (1.5s - 2.5s) to obtain full authorization.<br><br>This ensures the notification bell is not forcibly disabled by YouTube after subscribing.<br><br>*Processing speed will be slower. Disable for fast mode.",
    btn_understood: "Got it",
    logo_joke: "I have no function!!!",
    toast_running_warn: "Task running! Do NOT close or refresh the page!",
    info_title_subs: "Subscriptions Guide",
    info_desc_subs: "[Backup] Saves all subscribed channels from the current account.<br><br>[Restore] Subscribes to the saved channels on your new account.<br><br>💡 <b>Steps:</b> Click Backup on old account ➔ Switch to new account ➔ Click Restore.",
    info_title_pls: "Playlists Guide",
    info_desc_pls: "[Backup] Saves all videos and names of your custom playlists.<br><br>[Restore] Creates these playlists in the new account and adds videos.<br><br>⚠️ <b>Note:</b> If the program cannot catch the original name due to YouTube protections, it uses a random code instead. Please rename them manually after restoring.",
    info_title_clean: "Cleanup Warning",
    info_desc_clean: "This function MASS DELETES all data in the account.<br><br>⚠️ <b>CRITICAL:</b> Before executing, look at the Login Status above! Ensure you are clearing the correct account to avoid deleting your main account's data!",
    about_html: `
      <strong>App name：</strong>YouTube Moving Company<br>
      <strong>Version：</strong>v1.0.1<br>
      <strong>Email：</strong>speed132454@gmail.com<br>
      <strong>Source code：</strong><a href="https://github.com/yaotingshiu/YouTube_Moving_Company" target="_blank" style="color:var(--text-primary);">github.com/.../YouTube_Moving_Company</a><br>
      <strong>Developer：</strong>HsuYaoTing
    `
  }
};

const themeToggleBtn = document.getElementById('themeToggleBtn');
const langToggleBtn = document.getElementById('langToggleBtn');
const popoutBtn = document.getElementById('popoutBtn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContainer = document.getElementById('tabContainer');
const activeIndicator = document.getElementById('activeIndicator');
const aboutContent = document.getElementById('aboutContent');
const brandLogo = document.getElementById('brandLogo');

const statusDot = document.getElementById('statusDot');
const accountInfoText = document.getElementById('accountInfoText');

const backupSubsBtn = document.getElementById('backupSubsBtn');
const restoreStoredSubsBtn = document.getElementById('restoreStoredSubsBtn');
const clearSubBackupBtn = document.getElementById('clearSubBackupBtn');
const backupPlaylistsBtn = document.getElementById('backupPlaylistsBtn');
const restoreStoredPlaylistsBtn = document.getElementById('restoreStoredPlaylistsBtn');
const clearPlBackupBtn = document.getElementById('clearPlBackupBtn');
const chkCleanSubs = document.getElementById('chkCleanSubs');
const chkHumanMode = document.getElementById('chkHumanMode');
const chkCleanPls = document.getElementById('chkCleanPls');
const startCleanBtn = document.getElementById('startCleanBtn');

const progressBar = document.getElementById('progressBar');
const processedText = document.getElementById('processedText');
const successText = document.getElementById('successText');
const failText = document.getElementById('failText');
const stopBtn = document.getElementById('stopBtn');
const clearLogBtn = document.getElementById('clearLogBtn');
const logBox = document.getElementById('logBox');
const logWrapper = document.getElementById('logWrapper');
const logTrigger = document.getElementById('logTrigger');

const sidePanelNoticeOverlay = document.getElementById('sidePanelNoticeOverlay');
const closeSidePanelBtn = document.getElementById('closeSidePanelBtn');
const keepSidePanelBtn = document.getElementById('keepSidePanelBtn');

const crossTabNoticeOverlay = document.getElementById('crossTabNoticeOverlay');
const crossTabModalTitle = document.getElementById('crossTabModalTitle');
const crossTabModalDesc = document.getElementById('crossTabModalDesc');
const jumpToTaskTabBtn = document.getElementById('jumpToTaskTabBtn');
const closeCrossTabNoticeBtn = document.getElementById('closeCrossTabNoticeBtn');
const humanModeInfoBtn = document.getElementById('humanModeInfoBtn');

const subsInfoBtn = document.getElementById('subsInfoBtn');
const plInfoBtn = document.getElementById('plInfoBtn');
const cleanInfoBtn = document.getElementById('cleanInfoBtn');
const toastNotification = document.getElementById('toastNotification');

const infoModal = document.getElementById('infoModal');
const infoModalTitle = document.getElementById('infoModalTitle');
const infoModalText = document.getElementById('infoModalText');
const infoModalCloseBtn = document.getElementById('infoModalCloseBtn');


const bindInfoModal = (btn, titleKey, descKey) => {
  if (btn) {
    btn.onclick = () => {
      infoModalTitle.textContent = i18n[currentLang][titleKey];
      infoModalText.innerHTML = i18n[currentLang][descKey];
      infoModal.classList.add('active');
    };
    btn.onmouseover = () => btn.style.color = 'var(--text-primary)';
    btn.onmouseout = () => btn.style.color = 'var(--text-secondary)';
  }
};


bindInfoModal(humanModeInfoBtn, 'info_title_human', 'info_desc_human');
bindInfoModal(subsInfoBtn, 'info_title_subs', 'info_desc_subs');
bindInfoModal(plInfoBtn, 'info_title_pls', 'info_desc_pls');
bindInfoModal(cleanInfoBtn, 'info_title_clean', 'info_desc_clean');

if (infoModalCloseBtn) {
  infoModalCloseBtn.onclick = () => infoModal.classList.remove('active');
}

function adjustWindowHeight() {
  setTimeout(() => {
    const activeTab = document.querySelector('.tab-btn.active');
    const index = activeTab ? parseInt(activeTab.getAttribute('data-tab')) : 0;
    const activePane = document.getElementById(`pane${index}`);
    
    if (activePane) {
      const headerH = document.querySelector('.header').offsetHeight;
      const tabsH = document.querySelector('.tabs').offsetHeight;
      const paneH = activePane.offsetHeight;
      const progressH = document.querySelector('.progress-section').offsetHeight;
      const logH = document.querySelector('.log-wrapper').offsetHeight;
      const footerH = document.querySelector('.footer').offsetHeight;

      const totalH = headerH + tabsH + paneH + progressH + logH + footerH + 18;
      document.body.style.height = `${Math.min(totalH, 540)}px`;
    }
  }, 50);
}

function updateTabIndicator(index) {
  if (activeIndicator) {
    activeIndicator.style.transform = `translateX(${index * 100}%)`;
  }
}

function animateValue(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    element.innerHTML = Math.floor(easeOut * (end - start) + start);
    if (progress < 1) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
}

function buildLogString(logItem) {
  if (!logItem) return '';
  const p = logItem;
  const dict = i18n[currentLang] || i18n['zh'];
  let prefix = "";
  
  if (logItem.type === 'PROGRESS') {
    prefix = `[${p.index || 0}/${p.total || '-'}] ${p.isOk ? dict.log_ok : dict.log_fail} `;
  } else if (logItem.type === 'ERROR') {
    prefix = `${dict.log_err} `;
  } else if (['COMPLETE', 'BACKUP_DONE', 'PLAYLISTS_BACKUP_DONE'].includes(logItem.type)) {
    prefix = `${dict.log_done} `;
  } else {
    prefix = `${dict.log_info} `;
  }

  let text = p.info || '';
  if (logItem.type === 'COMPLETE' && p.success !== undefined) {
    text = currentLang === 'zh' ? `任務完成！成功: ${p.success}, 失敗: ${p.fail}` : `Task Complete! Success: ${p.success}, Fail: ${p.fail}`;
  } else if (['BACKUP_DONE', 'PLAYLISTS_BACKUP_DONE'].includes(logItem.type) && p.count !== undefined) {
    text = currentLang === 'zh' ? `已備份 ${p.count} 筆資料至快取！` : `Cached ${p.count} items!`;
  }

  return prefix + text;
}

function appendLogLine(logItem) {
  const text = buildLogString(logItem);
  if (!text) return;
  const div = document.createElement('div');
  div.textContent = text;
  logBox.appendChild(div);
  logBox.scrollTop = logBox.scrollHeight;
}

function renderAllLogs() {
  chrome.storage.local.get(['log_history'], (store) => {
    logBox.innerHTML = '';
    if (!store || !store.log_history || store.log_history.length === 0) {
      logBox.textContent = i18n[currentLang].msg_ready;
      return;
    }
    store.log_history.forEach(item => appendLogLine(item));
  });
}

function renderLang() {
  const dict = i18n[currentLang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (dict[key]) el.setAttribute('title', dict[key]);
  });
  langToggleBtn.textContent = currentLang === 'zh' ? 'EN' : '中';
  aboutContent.innerHTML = dict.about_html;
  checkStoredBackup();
  checkEnvironment();
  renderAllLogs();
  adjustWindowHeight();
}

function checkEnvironment() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (chrome.runtime.lastError || !tabs || !tabs.length) return;
    const tab = tabs[0];
    
    const isYouTube = tab && tab.url && tab.url.includes('www.youtube.com');

    if (!isYouTube) {
      updateGuardUI(false, i18n[currentLang].status_not_yt, 'danger');
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: 'CHECK_STATUS' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        updateGuardUI(true, i18n[currentLang].status_user.replace('{0}', i18n[currentLang].user_default), 'success');
        return;
      }

      if (!response.isLoggedIn) {
        updateGuardUI(false, i18n[currentLang].status_not_logged, 'danger');
      } else {
        rawUserName = response.user;
        const displayUser = (rawUserName && rawUserName !== '已登入用戶') ? rawUserName : i18n[currentLang].user_default;
        const text = i18n[currentLang].status_user.replace('{0}', displayUser);
        updateGuardUI(true, text, 'success');
      }
    });
  });
}

function updateGuardUI(isOk, text, statusType = 'warning') {
  isEnvOk = isOk;

  if (accountInfoText.textContent !== text) {
    accountInfoText.style.opacity = '0';
    accountInfoText.style.transform = 'translateY(-2px)';
    
    setTimeout(() => {
      accountInfoText.textContent = text;
      accountInfoText.style.opacity = '1';
      accountInfoText.style.transform = 'translateY(0)';
    }, 120);
  }

  if (statusType === 'success') {
    statusDot.className = 'dot dot-success';
  } else if (statusType === 'danger') {
    statusDot.className = 'dot dot-danger';
  } else {
    statusDot.className = 'dot dot-warning';
  }

  if (isOk) {
    if (!isRunning) {
      backupSubsBtn.disabled = false;
      backupPlaylistsBtn.disabled = false;
      updateCleanBtnState();
    }
  } else {
    backupSubsBtn.disabled = true;
    backupPlaylistsBtn.disabled = true;
    restoreStoredSubsBtn.disabled = true;
    restoreStoredPlaylistsBtn.disabled = true;
    startCleanBtn.disabled = true;
  }

  checkStoredBackup();
}

langToggleBtn.onclick = () => {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  chrome.storage.local.set({ lang: currentLang });
  renderLang();
};

themeToggleBtn.onclick = () => {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  chrome.storage.local.set({ theme: isLight ? 'light' : 'dark' });
};

if (brandLogo) {
  brandLogo.onclick = () => {
    brandLogo.classList.remove('slime-active');
    void brandLogo.offsetWidth; 
    brandLogo.classList.add('slime-active');
  };
}

popoutBtn.onclick = () => {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    if (chrome.runtime.lastError) return;
    if (tabs && tabs.length > 0) {
      if (chrome.sidePanel && typeof chrome.sidePanel.open === 'function') {
        chrome.sidePanel.open({ windowId: tabs[0].windowId }).then(() => {
          window.close();
        }).catch(() => {
          chrome.sidePanel.setOptions({ path: 'popup.html?view=sidepanel', enabled: true });
        });
      } else {
        alert("Side Panel API not supported.");
      }
    }
  });
};

tabBtns.forEach(btn => {
  btn.onclick = () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const index = parseInt(btn.getAttribute('data-tab'));
    tabContainer.style.transform = `translateX(-${index * 25}%)`;
    
    updateTabIndicator(index);
    adjustWindowHeight();

    chrome.storage.local.set({ active_tab_idx: index });
  };
});

logTrigger.onclick = (e) => {
  if (e.target === clearLogBtn) return;
  logWrapper.classList.toggle('expanded');
  adjustWindowHeight();
};

function showCustomModal(titleKey, textKey) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('customModal');
    const input = document.getElementById('modalInput');
    document.getElementById('modalTitle').textContent = i18n[currentLang][titleKey];
    document.getElementById('modalText').textContent = i18n[currentLang][textKey];
    input.value = '';
    overlay.classList.add('active');
    input.focus();

    const cleanup = () => {
      overlay.classList.remove('active');
      document.getElementById('modalConfirmBtn').onclick = null;
      document.getElementById('modalCancelBtn').onclick = null;
    };
    document.getElementById('modalConfirmBtn').onclick = () => { cleanup(); resolve(input.value); };
    document.getElementById('modalCancelBtn').onclick = () => { cleanup(); resolve(null); };
  });
}

function addLogObject(type, payload) {
  const item = { type, ...payload };
  chrome.storage.local.get(['log_history'], (store) => {
    let logs = store.log_history || [];
    logs.push(item);
    if (logs.length > 100) logs = logs.slice(-100);
    chrome.storage.local.set({ log_history: logs });
  });
}

function checkCrossTabAndState() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (chrome.runtime.lastError || !tabs || !tabs.length) return;
    const currentTabId = tabs[0].id;

    chrome.storage.local.get(['task_state'], (res) => {
      const state = res.task_state || {};
      isRunning = state.isRunning || false;
      executingTabId = state.executingTabId || null;

      if (isRunning && executingTabId) {
        chrome.tabs.get(executingTabId, (targetTab) => {
          if (chrome.runtime.lastError || !targetTab) {
            chrome.storage.local.set({ task_state: { isRunning: false, executingTabId: null } });
            setLockState(false);
            if (crossTabNoticeOverlay.classList.contains('active')) {
              crossTabNoticeOverlay.classList.remove('active');
              setTimeout(() => crossTabNoticeOverlay.classList.add('hidden'), 300);
            }
            return;
          }

          if (currentTabId !== executingTabId) {
            const actionKey = state.actionKey || 'act_clean';
            const taskName = i18n[currentLang][actionKey] || state.actionName || 'Task';
            crossTabModalTitle.textContent = i18n[currentLang].cross_tab_modal_title;
            crossTabModalDesc.textContent = i18n[currentLang].cross_tab_modal_desc.replace('{0}', taskName);
            
            if (!crossTabNoticeOverlay.classList.contains('active')) {
              crossTabNoticeOverlay.classList.remove('hidden');
              void crossTabNoticeOverlay.offsetWidth;
              crossTabNoticeOverlay.classList.add('active');
            }
          } else {
            if (crossTabNoticeOverlay.classList.contains('active')) {
              crossTabNoticeOverlay.classList.remove('active');
              setTimeout(() => crossTabNoticeOverlay.classList.add('hidden'), 300);
            }
          }
        });
      } else {
        if (crossTabNoticeOverlay.classList.contains('active')) {
          crossTabNoticeOverlay.classList.remove('active');
          setTimeout(() => crossTabNoticeOverlay.classList.add('hidden'), 300);
        }
      }

      setLockState(isRunning);
      if (state.index !== undefined && state.total !== undefined) {
        processedText.textContent = `${state.index} / ${state.total}`;
        const percent = Math.round((state.index / state.total) * 100) || 0;
        progressBar.style.width = `${percent}%`;
      }
      if (state.success !== undefined) {
        successText.textContent = state.success;
        lastSuccess = state.success;
      }
      if (state.fail !== undefined) {
        failText.textContent = state.fail;
        lastFail = state.fail;
      }
    });
  });

  checkEnvironment();
}

jumpToTaskTabBtn.onclick = () => {
  if (executingTabId) {
    chrome.tabs.update(executingTabId, { active: true }, (tab) => {
      if (tab && tab.windowId) {
        chrome.windows.update(tab.windowId, { focused: true });
      }
    });
  }
};

closeCrossTabNoticeBtn.onclick = () => {
  window.close();
};

function checkSidePanelOverlay() {
  if (!isPopupMode) return;
  
  chrome.storage.session.get(['sidePanelLastActive'], (res) => {
    const lastActive = res ? (res.sidePanelLastActive || 0) : 0;
    const sidePanelOpen = (Date.now() - lastActive) < 2200;

    if (sidePanelOpen) {
      if (!sidePanelNoticeOverlay.classList.contains('active')) {
        sidePanelNoticeOverlay.classList.remove('hidden');
        void sidePanelNoticeOverlay.offsetWidth;
        sidePanelNoticeOverlay.classList.add('active');
      }
    } else {
      if (sidePanelNoticeOverlay.classList.contains('active')) {
        sidePanelNoticeOverlay.classList.remove('active');
        setTimeout(() => sidePanelNoticeOverlay.classList.add('hidden'), 350);
      }
    }
  });
}

closeSidePanelBtn.onclick = () => {
  chrome.storage.session.set({ cmdCloseSidePanel: Date.now(), sidePanelLastActive: 0 });
  sidePanelNoticeOverlay.classList.remove('active');
  setTimeout(() => sidePanelNoticeOverlay.classList.add('hidden'), 350);
};

keepSidePanelBtn.onclick = () => {
  window.close();
};

function initializeSettings() {
  chrome.storage.local.get(['theme', 'lang', 'active_tab_idx'], (res) => {
    if (res.theme === 'light') document.body.classList.add('light-theme');
    if (res.lang) currentLang = res.lang;
    renderLang();
    if (res.active_tab_idx !== undefined) {
      tabBtns[res.active_tab_idx].click();
    } else {
      updateTabIndicator(0);
      adjustWindowHeight();
    }

    checkCrossTabAndState();
  });

  if (isPopupMode) {
    checkSidePanelOverlay();
    setInterval(checkSidePanelOverlay, 300);
  }
}

function checkStoredBackup() {
  chrome.storage.local.get(['backup_subs', 'backup_playlists'], (res) => {
    const dict = i18n[currentLang];
    if (res.backup_subs && res.backup_subs.length > 0) {
      restoreStoredSubsBtn.disabled = !isEnvOk || isRunning;
      restoreStoredSubsBtn.textContent = dict.btn_restore_subs_fmt.replace('{0}', res.backup_subs.length);
      clearSubBackupBtn.classList.remove('hidden');
    } else {
      restoreStoredSubsBtn.disabled = true;
      restoreStoredSubsBtn.textContent = dict.btn_restore_subs_empty;
      clearSubBackupBtn.classList.add('hidden');
    }
    if (res.backup_playlists && res.backup_playlists.length > 0) {
      restoreStoredPlaylistsBtn.disabled = !isEnvOk || isRunning;
      restoreStoredPlaylistsBtn.textContent = dict.btn_restore_pl_fmt.replace('{0}', res.backup_playlists.length);
      clearPlBackupBtn.classList.remove('hidden');
    } else {
      restoreStoredPlaylistsBtn.disabled = true;
      restoreStoredPlaylistsBtn.textContent = dict.btn_restore_pl_empty;
      clearPlBackupBtn.classList.add('hidden');
    }
    adjustWindowHeight();
  });
}

function updateCleanBtnState() {
  startCleanBtn.disabled = !isEnvOk || isRunning || !(chkCleanSubs.checked || chkCleanPls.checked);
}
chkCleanSubs.onchange = updateCleanBtnState;
chkCleanPls.onchange = updateCleanBtnState;

clearSubBackupBtn.onclick = () => { chrome.storage.local.remove(['backup_subs'], checkStoredBackup); };
clearPlBackupBtn.onclick = () => { chrome.storage.local.remove(['backup_playlists'], checkStoredBackup); };
clearLogBtn.onclick = () => { logBox.textContent = i18n[currentLang].msg_ready; chrome.storage.local.remove(['log_history']); };

backupSubsBtn.onclick = () => { startTaskWithTab('BACKUP_SUBS', 'act_backup_subs', i18n[currentLang].info_backup_subs); };
restoreStoredSubsBtn.onclick = () => { 
  chrome.storage.local.get(['backup_subs'], (res) => { 
    if (res && res.backup_subs) {
      const isHuman = chkHumanMode ? chkHumanMode.checked : true;
      startTaskWithTab('START_RESTORE_SUBS', 'act_restore_subs', i18n[currentLang].info_restore_subs, { channelIds: res.backup_subs, isHumanMode: isHuman }); 
    }
  }); 
};
backupPlaylistsBtn.onclick = () => { startTaskWithTab('BACKUP_PLAYLISTS', 'act_backup_pls', i18n[currentLang].info_backup_pls); };
restoreStoredPlaylistsBtn.onclick = () => { 
  chrome.storage.local.get(['backup_playlists'], (res) => { 
    if (res && res.backup_playlists) {
      startTaskWithTab('START_RESTORE_ALL_PLAYLISTS', 'act_restore_pls', i18n[currentLang].info_restore_pls, { playlists: res.backup_playlists }); 
    }
  }); 
};

startCleanBtn.onclick = async () => {
  const cleanSubs = chkCleanSubs.checked;
  const cleanPls = chkCleanPls.checked;
  if (!cleanSubs && !cleanPls) return;
  const input = await showCustomModal('modal_title', 'modal_desc');
  if (!input || input.trim().toUpperCase() !== 'DELETE') {
    addLogObject('ERROR', { info: i18n[currentLang].err_verify_fail });
    return;
  }
  startTaskWithTab('START_CLEAN_TASK', 'act_clean', i18n[currentLang].info_clean, { cleanSubs, cleanPls });
};

stopBtn.onclick = () => {
  sendToActiveTab({ action: 'STOP_PROCESS' });
  chrome.storage.local.set({ task_state: { isRunning: false, executingTabId: null } });
  addLogObject('SYS', { info: i18n[currentLang].info_stop });
  setLockState(false);
};

function startTaskWithTab(action, actionKey, infoStr, extraData = {}) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (chrome.runtime.lastError || !tabs || !tabs.length) {
      alert(i18n[currentLang].err_not_yt);
      return;
    }
    const tab = tabs[0];
    if (!tab.url || !tab.url.includes('www.youtube.com')) {
      alert(i18n[currentLang].err_not_yt);
      return;
    }

    logWrapper.classList.add('expanded');
    lastSuccess = 0;
    lastFail = 0;
    progressBar.style.width = '0%';
    processedText.textContent = '0 / 0';
    successText.textContent = '0';
    failText.textContent = '0';

    const newState = {
      isRunning: true,
      executingTabId: tab.id,
      actionKey: actionKey,
      index: 0,
      total: '-',
      success: 0,
      fail: 0
    };

    chrome.storage.local.set({ log_history: [], task_state: newState }, () => {
      logBox.innerHTML = '';
      addLogObject('SYS', { info: infoStr });
      setLockState(true);
      sendToActiveTab({ action, lang: currentLang, ...extraData });
      
      if (toastNotification) {
        toastNotification.classList.add('show');
        setTimeout(() => toastNotification.classList.remove('show'), 5000);
      }
    });
  });
}

function setLockState(locked) {
  isRunning = locked;
  backupSubsBtn.disabled = locked || !isEnvOk;
  backupPlaylistsBtn.disabled = locked || !isEnvOk;
  
  if (chkHumanMode) chkHumanMode.disabled = locked;
  if (chkCleanSubs) chkCleanSubs.disabled = locked;
  if (chkCleanPls) chkCleanPls.disabled = locked;

  updateCleanBtnState();
  checkStoredBackup();
  stopBtn.disabled = !locked; 
  stopBtn.classList.toggle('hidden', !locked);
  adjustWindowHeight();
}

function sendToActiveTab(message) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (chrome.runtime.lastError || !tabs || !tabs.length) {
      alert(i18n[currentLang].err_not_yt);
      setLockState(false);
      return;
    }

    const tab = tabs[0];
    chrome.tabs.sendMessage(tab.id, message, (response) => {
      if (chrome.runtime.lastError) {
        alert(i18n[currentLang].conn_lost);
        setLockState(false);
      }
    });
  });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes.task_state) {
      checkCrossTabAndState();
    }
    if (changes.log_history && changes.log_history.newValue) {
      const oldLogs = changes.log_history.oldValue || [];
      const newLogs = changes.log_history.newValue;
      if (newLogs.length > oldLogs.length) {
        const addedLogs = newLogs.slice(oldLogs.length);
        addedLogs.forEach(item => appendLogLine(item));
      } else if (newLogs.length < oldLogs.length || oldLogs.length === 0) {
        renderAllLogs();
      }
    }
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  chrome.storage.local.get(['task_state'], (res) => {
    let state = res.task_state || {};
    if (msg.type === 'PROGRESS') {
      state = { ...state, isRunning: true, index: msg.index, total: msg.total, success: msg.success, fail: msg.fail };
    } else {
      state.isRunning = false;
      state.executingTabId = null;
    }
    chrome.storage.local.set({ task_state: state });
  });

  if (msg.type === 'PROGRESS') {
    const percent = Math.round((msg.index / msg.total) * 100) || 0;
    progressBar.style.width = `${percent}%`;
    processedText.textContent = `${msg.index} / ${msg.total}`;
    if (msg.success > lastSuccess) animateValue(successText, lastSuccess, msg.success, 300);
    if (msg.fail > lastFail) animateValue(failText, lastFail, msg.fail, 300);
    lastSuccess = msg.success || 0; 
    lastFail = msg.fail || 0;
    addLogObject(msg.type, msg);

  } else if (msg.type === 'COMPLETE') {
    setLockState(false);
    addLogObject(msg.type, msg);
  } else if (msg.type === 'BACKUP_DONE' || msg.type === 'PLAYLISTS_BACKUP_DONE') {
    setLockState(false);
    const key = msg.type === 'BACKUP_DONE' ? 'backup_subs' : 'backup_playlists';
    addLogObject(msg.type, msg);
    chrome.storage.local.set({ [key]: msg.data }, checkStoredBackup);
  } else if (msg.type === 'ERROR') {
    setLockState(false);
    addLogObject(msg.type, msg);
  }
});

chrome.tabs.onActivated.addListener(() => {
  checkCrossTabAndState();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active) {
    checkCrossTabAndState();
  }
});

initializeSettings();