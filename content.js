function injectScript() {
  if (document.getElementById('yt-relocator-injected')) return;
  const script = document.createElement('script');
  script.id = 'yt-relocator-injected';
  script.src = chrome.runtime.getURL('injected.js');
  (document.head || document.documentElement).appendChild(script);
}

injectScript();
document.addEventListener('DOMContentLoaded', injectScript);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'CHECK_STATUS') {
    const handleStatus = (event) => {
      if (event.data && event.data.type === 'YT_STATUS_RESPONSE') {
        window.removeEventListener('message', handleStatus);
        sendResponse(event.data);
      }
    };
    window.addEventListener('message', handleStatus);
    window.postMessage({ type: 'YT_CHECK_STATUS' }, '*');
    return true;
  }
  
  window.postMessage({ type: 'YT_RELOCATOR_CMD', data: request }, '*');
  sendResponse({ status: 'ACK' });
  return true;
});

window.addEventListener('message', (event) => {
  if (event.data && event.data.type && event.data.type.startsWith('RELOCATOR_')) {
    const rawType = event.data.type.replace('RELOCATOR_', '');
    const payload = event.data.payload || {};

    chrome.runtime.sendMessage({ type: rawType, ...payload }, () => {
      void chrome.runtime.lastError; 
    });
  }
});