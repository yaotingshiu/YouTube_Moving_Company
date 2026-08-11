chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.get(['task_state', 'lang'], (res) => {
    const state = res.task_state || {};
    const lang = res.lang || 'zh';

    if (state.isRunning && state.executingTabId === tabId) {
      chrome.storage.local.set({
        task_state: { isRunning: false, executingTabId: null }
      });

      chrome.storage.local.get(['log_history'], (store) => {
        let logs = store.log_history || [];
        const infoMsg = lang === 'en' 
          ? '[SYS] Execution tab closed. Task aborted.' 
          : '[系統] 執行分頁已關閉，任務已中斷。';
        
        logs.push({ type: 'ERROR', info: infoMsg });
        chrome.storage.local.set({ log_history: logs });
      });
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    chrome.storage.local.get(['task_state'], (res) => {
      const state = res.task_state || {};
      if (state.isRunning && state.executingTabId === tabId) {
        chrome.storage.local.set({
          task_state: { isRunning: false, executingTabId: null }
        });
      }
    });
  }
});