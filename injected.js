(() => {
  let stopRequested = false;
  let currentLang = 'zh';

  const i18n_inj = {
    zh: {
      target_channel: "標的頻道: {0}",
      main_account: "母帳號 (主頻道)",
      brand_account: "子頻道/品牌帳號 [ID: {0}]",
      scan_pl_start: "開始掃描歌單... (標的: {0})",
      backup_pl_success: "備份成功:【{0}】({1} 支影片)",
      backup_pl_err: "歌單備份異常: {0}",
      no_pl_found: "未找到任何可備份的自訂播放清單。",
      no_pl_cache: "找不到可還原的播放清單快取資料！",
      restore_pl_start: "開始還原歌單... (標的: {0})",
      skip_empty_pl: "跳過空歌單:【{0}】",
      restore_pl_success: "成功建立:【{0}】({1} 支影片) ➔ {2}",
      restore_pl_fail: "還原失敗:【{0}】({1})",
      unsub_start: "開始退追頻道... (標的: {0})",
      unsub_item: "退追頻道: {0}",
      clean_pl_start: "開始掃描刪除歌單... (標的: {0})",
      clean_pl_none: "未找到任何可刪除的播放清單。",
      delete_pl_item: "刪除歌單:【{0}】",
      delete_pl_fail: "刪除歌單失敗:【{0}】({1})",
      page_scan: "第 {0} 頁，累積掃描到 {1} 個頻道...",
      backup_sub_fail: "備份失敗：未抓取到任何頻道 ID。",
      net_err: "網路請求異常: {0}",
      no_api_key: "無法存取 YouTube API 金鑰，請重新整理頁面後再試！",
      restore_sub_item: "還原訂閱頻道: {0}",
      retry_msg: "連線不穩定或伺服器忙碌，正在進行第 {0} 次重試..."
    },
    en: {
      target_channel: "Target Channel: {0}",
      main_account: "Main Account",
      brand_account: "Brand Account [ID: {0}]",
      scan_pl_start: "Scanning playlists... (Target: {0})",
      backup_pl_success: "Backup success:【{0}】({1} videos)",
      backup_pl_err: "Playlist backup error: {0}",
      no_pl_found: "No custom playlists found to back up.",
      no_pl_cache: "No cached playlist data found to restore!",
      restore_pl_start: "Restoring playlists... (Target: {0})",
      skip_empty_pl: "Skipped empty playlist:【{0}】",
      restore_pl_success: "Created:【{0}】({1} videos) ➔ {2}",
      restore_pl_fail: "Restore failed:【{0}】({1})",
      unsub_start: "Unsubscribing channels... (Target: {0})",
      unsub_item: "Unsubscribed channel: {0}",
      clean_pl_start: "Scanning playlists to delete... (Target: {0})",
      clean_pl_none: "No playlists found to delete.",
      delete_pl_item: "Deleted playlist:【{0}】",
      delete_pl_fail: "Failed to delete playlist:【{0}】({1})",
      page_scan: "Page {0}, accumulated {1} channels...",
      backup_sub_fail: "Backup failed: No channel IDs found.",
      net_err: "Network request error: {0}",
      no_api_key: "Cannot access YouTube API key. Please refresh the page!",
      restore_sub_item: "Restored subscription: {0}",
      retry_msg: "Network unstable or server busy. Retrying ({0})..."
    }
  };

  function t(key, ...args) {
    const langDict = i18n_inj[currentLang] || i18n_inj['zh'];
    let str = langDict[key] || i18n_inj['zh'][key] || '';
    args.forEach((val, idx) => {
      str = str.replace(`{${idx}}`, val);
    });
    return str;
  }

  async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  }

  async function fetchWithRetry(url, options = {}, maxRetries = 3, initialDelay = 1000) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      if (stopRequested) throw new Error("USER_STOPPED");

      try {
        const response = await fetchWithTimeout(url, options, 15000);
        
        if ([429, 500, 502, 503, 504].includes(response.status)) {
          throw new Error(`HTTP_${response.status}`);
        }

        const json = await response.json();
        
        if (json && json.error && [500, 503, 429].includes(json.error.code)) {
          throw new Error(`API_ERR_${json.error.code}`);
        }

        return json; 
      } catch (err) {
        lastError = err;
        if (err.message === "USER_STOPPED") throw err;

        if (attempt < maxRetries) {
          const jitter = Math.random() * 300;
          const delay = initialDelay * Math.pow(2, attempt - 1) + jitter;
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    throw lastError || new Error("FETCH_FAILED_AFTER_RETRIES");
  }

  function getYtcfg(key) {
    try {
      if (window.ytcfg && typeof window.ytcfg.get === 'function') {
        return window.ytcfg.get(key);
      }
      if (window.ytcfg && window.ytcfg.data_ && window.ytcfg.data_[key] !== undefined) {
        return window.ytcfg.data_[key];
      }
    } catch (e) {}
    return null;
  }

  function getApiKey() {
    let key = getYtcfg('INNERTUBE_API_KEY');
    if (key) return key;
    if (window.yt && window.yt.config_ && window.yt.config_.INNERTUBE_API_KEY) {
      return window.yt.config_.INNERTUBE_API_KEY;
    }
    return null;
  }

  function getContext() {
    let rawCtx = getYtcfg('INNERTUBE_CONTEXT');
    let ctx = rawCtx ? JSON.parse(JSON.stringify(rawCtx)) : {};

    if (!ctx.client) {
      ctx.client = {
        clientName: 'WEB',
        clientVersion: getYtcfg('INNERTUBE_CLIENT_VERSION') || '2.20240101.00.00',
        hl: 'zh-TW',
        gl: 'TW'
      };
    }

    const delegatedId = getYtcfg('DELEGATED_SESSION_ID');
    if (delegatedId) {
      ctx.user = ctx.user || {};
      ctx.user.onBehalfOfUser = delegatedId;
    }

    return ctx;
  }

  const getCookie = name => (document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)')) || [])[2] || '';

  async function makeHeaders() {
    const sapisid = getCookie('SAPISID') || getCookie('__Secure-3PAPISID') || getCookie('__Secure-1PAPISID');
    const encoder = new TextEncoder();
    const curTime = Math.floor(Date.now() / 1000);
    const curBuf = await crypto.subtle.digest('SHA-1', encoder.encode(`${curTime} ${sapisid} https://www.youtube.com`));
    const curHash = `${curTime}_${Array.from(new Uint8Array(curBuf)).map(b => b.toString(16).padStart(2, '0')).join('')}`;

    const clientVersion = getYtcfg('INNERTUBE_CLIENT_VERSION') || '2.20240101.00.00';
    const sessionIndex = getYtcfg('SESSION_INDEX') || '0';
    const delegatedId = getYtcfg('DELEGATED_SESSION_ID');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `SAPISIDHASH ${curHash}`,
      'X-Origin': 'https://www.youtube.com',
      'X-YouTube-Client-Name': '1',
      'X-YouTube-Client-Version': String(clientVersion),
      'X-Goog-AuthUser': String(sessionIndex)
    };

    if (delegatedId) {
      headers['X-YouTube-Delegated-Session-Id'] = delegatedId;
    }

    return headers;
  }

  function getChannelLabel() {
    const delegatedId = getYtcfg('DELEGATED_SESSION_ID');
    return delegatedId ? t('brand_account', delegatedId) : t('main_account');
  }

  function extractErrorText(obj) {
    let texts = [];
    function recurse(o) {
      if (!o) return;
      if (typeof o === 'string') return;
      if (o.text && typeof o.text === 'string') texts.push(o.text);
      if (o.message && typeof o.message === 'string') texts.push(o.message);
      if (Array.isArray(o)) o.forEach(recurse);
      else if (typeof o === 'object') Object.values(o).forEach(recurse);
    }
    recurse(obj);
    return texts.join(' | ') || JSON.stringify(obj);
  }

  function isValidPlaylistId(id) {
    if (!id || typeof id !== 'string') return false;
    if (id.startsWith('VLPL')) id = id.substring(2);
    if (!id.startsWith('PL')) return false;
    if (id.length < 13 || id.length > 50) return false;
    if (!/^PL[a-zA-Z0-9_-]+$/.test(id)) return false;

    const upper = id.toUpperCase();
    if (upper.startsWith('PLAYLIST') || upper.startsWith('PLAY_') || upper.startsWith('PL_')) return false;

    const blacklist = [
      'PLAYLIST', 'PLAY_TYPE', 'PLAYLISTS', 'LIBRARY', 'CONTEXT',
      'DROP_DOWN', 'UNSPECIFIED', 'RENDERER', 'ENDPOINT', 'ACTION',
      'NAVIGATION', 'HEADER', 'BUTTON', 'TITLE', 'RESPONSE', 'SEARCH',
      'SECTION', 'ITEM', 'GRID', 'TAB'
    ];

    for (const word of blacklist) {
      if (upper.includes(word)) return false;
    }
    return true;
  }

  function extractTitleFromObj(o) {
    if (!o || typeof o !== 'object') return '';
    if (o.title) {
      if (typeof o.title === 'string') return o.title;
      if (o.title.simpleText) return o.title.simpleText;
      if (o.title.runs && o.title.runs[0] && o.title.runs[0].text) return o.title.runs[0].text;
    }
    if (o.formattedTitle) {
      if (typeof o.formattedTitle === 'string') return o.formattedTitle;
      if (o.formattedTitle.simpleText) return o.formattedTitle.simpleText;
      if (o.formattedTitle.runs && o.formattedTitle.runs[0] && o.formattedTitle.runs[0].text) return o.formattedTitle.runs[0].text;
    }
    return '';
  }

  function extractPlaylistsWithMeta(jsonObj) {
    const resultMap = new Map();

    function traverse(o) {
      if (!o || typeof o !== 'object') return;

      if (typeof o.playlistId === 'string') {
        let pid = o.playlistId.startsWith('VLPL') ? o.playlistId.substring(2) : o.playlistId;
        if (isValidPlaylistId(pid)) {
          let title = extractTitleFromObj(o);
          if (!resultMap.has(pid) || (!resultMap.get(pid) && title)) {
            resultMap.set(pid, title);
          }
        }
      }

      if (o.navigationEndpoint && o.navigationEndpoint.browseEndpoint && typeof o.navigationEndpoint.browseEndpoint.browseId === 'string') {
        let bid = o.navigationEndpoint.browseEndpoint.browseId;
        if (bid.startsWith('VLPL')) bid = bid.substring(2);
        if (isValidPlaylistId(bid)) {
          let title = extractTitleFromObj(o);
          if (!resultMap.has(bid) || (!resultMap.get(bid) && title)) {
            resultMap.set(bid, title);
          }
        }
      }

      if (Array.isArray(o)) o.forEach(traverse);
      else Object.values(o).forEach(traverse);
    }

    traverse(jsonObj);
    return resultMap;
  }

  async function scanUserPlaylists() {
    const apiKey = getApiKey();
    const context = getContext();
    const resultMap = new Map();
    const headers = await makeHeaders();

    const targets = [
      { url: `/youtubei/v1/guide?key=${apiKey}`, body: { context } },
      { url: `/youtubei/v1/browse?key=${apiKey}`, body: { context, browseId: 'FEplaylist_aggregation' } },
      { url: `/youtubei/v1/browse?key=${apiKey}`, body: { context, browseId: 'FElibrary' } }
    ];

    for (const target of targets) {
      if (stopRequested) break;
      try {
        const json = await fetchWithRetry(target.url, { method: 'POST', headers, body: JSON.stringify(target.body) }, 3, 1000);
        const extracted = extractPlaylistsWithMeta(json);
        extracted.forEach((title, id) => {
          if (!resultMap.has(id) || (!resultMap.get(id) && title)) {
            resultMap.set(id, title);
          }
        });

        let token = findContinuationToken(json);
        let pCount = 0;
        while (token && pCount < 25 && !stopRequested) {
          pCount++;
          const contJson = await fetchWithRetry(`/youtubei/v1/browse?key=${apiKey}`, {
            method: 'POST', headers, body: JSON.stringify({ context, continuation: token })
          }, 3, 800);
          
          const contExtracted = extractPlaylistsWithMeta(contJson);
          contExtracted.forEach((title, id) => {
            if (!resultMap.has(id) || (!resultMap.get(id) && title)) {
              resultMap.set(id, title);
            }
          });
          token = findContinuationToken(contJson);
          await new Promise(r => setTimeout(r, 250));
        }
      } catch (e) {}
    }

    const result = [];
    resultMap.forEach((title, id) => {
      result.push({ id, title: title || `Playlist (${id.slice(-4)})` });
    });
    return result;
  }

  function extractPlaylistVideoIds(jsonObj) {
    const ids = new Set();
    function traverse(o) {
      if (!o || typeof o !== 'object') return;

      if (o.playlistVideoRenderer && o.playlistVideoRenderer.videoId) {
        ids.add(o.playlistVideoRenderer.videoId);
      } else if (o.gridVideoRenderer && o.gridVideoRenderer.videoId) {
        ids.add(o.gridVideoRenderer.videoId);
      } else if (o.playlistPanelVideoRenderer && o.playlistPanelVideoRenderer.videoId) {
        ids.add(o.playlistPanelVideoRenderer.videoId);
      } else if (o.videoId && typeof o.videoId === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(o.videoId)) {
        ids.add(o.videoId);
      }

      if (Array.isArray(o)) o.forEach(traverse);
      else Object.values(o).forEach(traverse);
    }

    traverse(jsonObj);
    return Array.from(ids);
  }

  function extractPlaylistTitle(jsonObj, fallback) {
    try {
      if (jsonObj?.microformat?.microformatDataRenderer?.title) return jsonObj.microformat.microformatDataRenderer.title;
      if (jsonObj?.metadata?.playlistMetadataRenderer?.title) return jsonObj.metadata.playlistMetadataRenderer.title;
      if (jsonObj?.header?.playlistHeaderRenderer?.title?.simpleText) return jsonObj.header.playlistHeaderRenderer.title.simpleText;
      if (jsonObj?.header?.playlistHeaderRenderer?.title?.runs?.[0]?.text) return jsonObj.header.playlistHeaderRenderer.title.runs[0].text;
      const sidebarItems = jsonObj?.sidebar?.playlistSidebarRenderer?.items;
      if (sidebarItems) {
        for (const item of sidebarItems) {
          const primaryInfo = item?.playlistSidebarPrimaryInfoRenderer;
          if (primaryInfo?.title?.runs?.[0]?.text) return primaryInfo.title.runs[0].text;
          if (primaryInfo?.title?.simpleText) return primaryInfo.title.simpleText;
        }
      }

      const str = JSON.stringify(jsonObj);
      const match = str.match(/"microformatDataRenderer":\{"urlCanonical":"[^"]+","title":"([^"]+)"/) || str.match(/"title":\{"simpleText":"([^"]+)"\}/);
      if (match && match[1] && !match[1].includes('YouTube')) return match[1];
    } catch (e) {}
    return fallback;
  }

  function findContinuationToken(obj) {
    if (!obj || typeof obj !== 'object') return null;
    if (obj.continuationCommand && obj.continuationCommand.token) {
      return obj.continuationCommand.token;
    }
    if (obj.continuationEndpoint && obj.continuationEndpoint.continuationCommand && obj.continuationEndpoint.continuationCommand.token) {
      return obj.continuationEndpoint.continuationCommand.token;
    }
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const token = findContinuationToken(item);
        if (token) return token;
      }
    } else {
      for (const key of Object.keys(obj)) {
        if (key === 'searchEndpoint') continue;
        const token = findContinuationToken(obj[key]);
        if (token) return token;
      }
    }
    return null;
  }

  window.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'YT_CHECK_STATUS') {
      const isLoggedIn = getYtcfg('LOGGED_IN') === true;
      let userName = '已登入用戶';

      if (isLoggedIn) {
        try {
          const accountNameEl = document.querySelector('#account-name');
          if (accountNameEl && accountNameEl.textContent) {
            userName = accountNameEl.textContent.trim();
          }

          if (userName === '已登入用戶') {
            const avatarBtn = document.querySelector('#avatar-btn') || document.querySelector('ytd-topbar-menu-button-renderer button');
            if (avatarBtn) {
              const label = avatarBtn.getAttribute('aria-label') || avatarBtn.getAttribute('title') || '';
              const match = label.match(/(?:帳戶：|帳戶:|Account:\s*)(.+?)(?:\n|\s*\()/i);
              if (match && match[1]) userName = match[1].trim();
            }
          }

          if (userName === '已登入用戶') {
            const apiKey = getApiKey();
            const context = getContext();
            if (apiKey && context) {
              const json = await fetchWithRetry(`/youtubei/v1/account/account_menu?key=${apiKey}`, {
                method: 'POST', headers: await makeHeaders(), body: JSON.stringify({ context })
              }, 2, 500);
              
              const header = json?.actions?.[0]?.openPopupAction?.popup?.multiPageMenuRenderer?.header?.activeAccountHeaderRenderer;
              if (header && header.accountName) {
                 userName = header.accountName.simpleText || (header.accountName.runs && header.accountName.runs[0].text) || userName;
              }
            }
          }
        } catch (e) {}
      }

      const authUser = getYtcfg('SESSION_INDEX') || 0;
      window.postMessage({ type: 'YT_STATUS_RESPONSE', isLoggedIn, user: userName, authUser }, '*');
    }
  });

  window.addEventListener('message', async (event) => {
    if (!event.data || event.data.type !== 'YT_RELOCATOR_CMD') return;
    const cmd = event.data.data;
    stopRequested = false;
    currentLang = cmd.lang || 'zh';

    if (cmd.action === 'STOP_PROCESS') stopRequested = true;
    else if (cmd.action === 'BACKUP_SUBS') await backupSubscriptions();
    else if (cmd.action === 'START_RESTORE_SUBS') await restoreSubscriptions(cmd.channelIds, cmd.isHumanMode);
    else if (cmd.action === 'BACKUP_PLAYLISTS') await backupAllPlaylists();
    else if (cmd.action === 'START_RESTORE_ALL_PLAYLISTS') await restoreAllPlaylists(cmd.playlists);
    else if (cmd.action === 'START_CLEAN_TASK') await runCleanTask(cmd.cleanSubs, cmd.cleanPls);
  });


  function extractChannelsWithMeta(jsonObj) {
    const map = new Map();
    function traverse(o) {
      if (!o || typeof o !== 'object') return;
      const renderer = o.channelRenderer || o.gridChannelRenderer;
      if (renderer && renderer.channelId) {
        let title = '';
        if (renderer.title?.simpleText) title = renderer.title.simpleText;
        else if (renderer.title?.runs?.[0]?.text) title = renderer.title.runs[0].text;
        if (!title) title = extractTitleFromObj(renderer);
        map.set(renderer.channelId, title || renderer.channelId);
      }
      if (Array.isArray(o)) o.forEach(traverse);
      else Object.values(o).forEach(traverse);
    }
    traverse(jsonObj);
    
    /*
    
    const str = JSON.stringify(jsonObj);
     (str.match(/UC[\w-]{22}/g) || []).forEach(id => {
       if (!map.has(id)) map.set(id, id);
     });
     
     */
    return map;
  }

  async function backupSubscriptions() {
    const apiKey = getApiKey();
    const context = getContext();
    if (!apiKey) {
      postMsg('ERROR', { info: t('no_api_key') });
      return;
    }

    postMsg('PROGRESS', { index: 0, total: '-', isOk: true, info: t('target_channel', getChannelLabel()), success: 0, fail: 0 });

    const allChannelsMap = new Map();
    let continuationToken = null, pageCount = 0;

    try {
      do {
        pageCount++;
        const json = await fetchWithRetry(`/youtubei/v1/browse?key=${apiKey}`, {
          method: 'POST', headers: await makeHeaders(),
          body: JSON.stringify(continuationToken ? { context, continuation: continuationToken } : { context, browseId: 'FEchannels' })
        }, 4, 1000);


        const extracted = extractChannelsWithMeta(json);
        extracted.forEach((title, id) => allChannelsMap.set(id, title));
        continuationToken = findContinuationToken(json);

        postMsg('PROGRESS', { index: allChannelsMap.size, total: '-', isOk: true, info: t('page_scan', pageCount, allChannelsMap.size), success: allChannelsMap.size, fail: 0 });
        if (pageCount > 50 || stopRequested) break;
        if (continuationToken) await new Promise(r => setTimeout(r, 300));
      } while (continuationToken);


      const finalData = Array.from(allChannelsMap.entries()).map(([id, title]) => ({ id, title }));
      if (finalData.length) postMsg('BACKUP_DONE', { count: finalData.length, data: finalData });
      else postMsg('ERROR', { info: t('backup_sub_fail') });
    } catch (e) {
      if (e.message !== "USER_STOPPED") postMsg('ERROR', { info: t('net_err', e.message) }); 
    }
  }


  async function restoreSubscriptions(channelIds, isHumanMode) {
    const apiKey = getApiKey();
    const context = getContext();
    let success = 0, fail = 0;

    postMsg('PROGRESS', { index: 0, total: channelIds.length, isOk: true, info: t('target_channel', getChannelLabel()), success: 0, fail: 0 });

    for (let i = 0; i < channelIds.length; i++) {
      if (stopRequested) break;

      const item = channelIds[i];
      const id = typeof item === 'string' ? item : item.id;
      const title = typeof item === 'string' ? id : item.title;
      let isOk = false;

      if (isHumanMode) {

        let subscribeParams = null;
        try {
          const browseJson = await fetchWithRetry(`/youtubei/v1/browse?key=${apiKey}`, {
            method: 'POST',
            headers: await makeHeaders(),
            body: JSON.stringify({ context, browseId: id })
          }, 3, 1000);

          const browseStr = JSON.stringify(browseJson);
          const match = browseStr.match(new RegExp(`"subscribeEndpoint":\\{"channelIds":\\["${id}"\\],"params":"([^"]+)"`));
          
          if (match && match[1]) {
            subscribeParams = match[1];
          } else {
            const fallbackMatch = browseStr.match(/"subscribeEndpoint":\{[^}]*"params":"([^"]+)"/);
            if (fallbackMatch && fallbackMatch[1]) {
              subscribeParams = fallbackMatch[1];
            }
          }

          const subBody = { context, channelIds: [id] };
          if (subscribeParams) subBody.params = subscribeParams;

          const json = await fetchWithRetry(`/youtubei/v1/subscription/subscribe?key=${apiKey}`, {
            method: 'POST', headers: await makeHeaders(), body: JSON.stringify(subBody)
          }, 3, 1000);

          if (!json.error) { isOk = true; success++; } else fail++;
        } catch (e) {
          if (e.message === "USER_STOPPED") break;
          fail++;
        }
        
        postMsg('PROGRESS', { index: i + 1, total: channelIds.length, isOk, info: t('restore_sub_item', title), success, fail });
        
        const jitter = Math.floor(Math.random() * 1000);
        await new Promise(r => setTimeout(r, 1500 + jitter));

      } else {

        try {
          const json = await fetchWithRetry(`/youtubei/v1/subscription/subscribe?key=${apiKey}`, {
            method: 'POST', headers: await makeHeaders(), body: JSON.stringify({ context, channelIds: [id] })
          }, 3, 1000);

          if (!json.error) { isOk = true; success++; } else fail++;
        } catch (e) {
          if (e.message === "USER_STOPPED") break;
          fail++;
        }
        
        postMsg('PROGRESS', { index: i + 1, total: channelIds.length, isOk, info: t('restore_sub_item', title), success, fail });
        await new Promise(r => setTimeout(r, 600));
      }
    }
    postMsg('COMPLETE', { success, fail });
  }

  async function backupAllPlaylists() {
    const apiKey = getApiKey();
    const context = getContext();
    if (!apiKey) {
      postMsg('ERROR', { info: t('no_api_key') });
      return;
    }

    try {
      postMsg('PROGRESS', { index: 0, total: '-', isOk: true, info: t('scan_pl_start', getChannelLabel()), success: 0, fail: 0 });

      const playlists = await scanUserPlaylists();

      if (!playlists.length) {
        postMsg('ERROR', { info: t('no_pl_found') });
        return;
      }

      const playlistsData = [];

      for (let i = 0; i < playlists.length; i++) {
        if (stopRequested) break;
        const item = playlists[i];
        const plId = item.id;
        let plTitle = item.title || `Playlist ${i + 1}`;
        let plCont = null, plPage = 0;
        const allVideoIds = new Set();

        do {
          plPage++;
          const browseId = plId.startsWith('VL') ? plId : `VL${plId}`;
          const plJson = await fetchWithRetry(`/youtubei/v1/browse?key=${apiKey}`, {
            method: 'POST',
            headers: await makeHeaders(),
            body: JSON.stringify(plCont ? { context, continuation: plCont } : { context, browseId })
          }, 3, 800);

          if (!plJson || plJson.error) break;

          const betterTitle = extractPlaylistTitle(plJson, '');
          if (betterTitle) plTitle = betterTitle;

          const vIds = extractPlaylistVideoIds(plJson);
          vIds.forEach(v => allVideoIds.add(v));

          plCont = findContinuationToken(plJson);

          if (plPage > 30 || stopRequested) break;
          if (plCont) await new Promise(r => setTimeout(r, 250));
        } while (plCont);

        const finalVIds = Array.from(allVideoIds);
        playlistsData.push({ title: plTitle, videoIds: finalVIds });
        postMsg('PROGRESS', {
          index: i + 1,
          total: playlists.length,
          isOk: true,
          info: t('backup_pl_success', plTitle, finalVIds.length),
          success: i + 1,
          fail: 0
        });
        await new Promise(r => setTimeout(r, 300));
      }

      postMsg('PLAYLISTS_BACKUP_DONE', { count: playlistsData.length, data: playlistsData });
    } catch (e) {
      if (e.message !== "USER_STOPPED") postMsg('ERROR', { info: t('backup_pl_err', e.message) });
    }
  }

  async function restoreAllPlaylists(playlists) {
    if (!playlists || !Array.isArray(playlists) || playlists.length === 0) {
      postMsg('ERROR', { info: t('no_pl_cache') });
      return;
    }

    postMsg('PROGRESS', { index: 0, total: playlists.length, isOk: true, info: t('restore_pl_start', getChannelLabel()), success: 0, fail: 0 });

    let totalSuccess = 0, totalFail = 0;
    for (let i = 0; i < playlists.length; i++) {
      if (stopRequested) break;
      const pl = playlists[i];
      if (!pl.videoIds || pl.videoIds.length === 0) {
        totalFail++;
        postMsg('PROGRESS', {
          index: i + 1,
          total: playlists.length,
          isOk: false,
          info: t('skip_empty_pl', pl.title),
          success: totalSuccess,
          fail: totalFail
        });
        continue;
      }

      const res = await createAndFillPlaylist(pl.title, pl.videoIds);

      if (res.playlistCreated && res.success > 0) {
        totalSuccess++;
        postMsg('PROGRESS', {
          index: i + 1,
          total: playlists.length,
          isOk: true,
          info: t('restore_pl_success', pl.title, res.success, res.playlistUrl),
          success: totalSuccess,
          fail: totalFail
        });
      } else {
        totalFail++;
        postMsg('PROGRESS', {
          index: i + 1,
          total: playlists.length,
          isOk: false,
          info: t('restore_pl_fail', pl.title, res.error || 'Error'),
          success: totalSuccess,
          fail: totalFail
        });
      }
      await new Promise(r => setTimeout(r, 600));
    }
    postMsg('COMPLETE', { success: totalSuccess, fail: totalFail });
  }

  async function createAndFillPlaylist(playlistName, videoIds) {
    const apiKey = getApiKey();
    const context = getContext();
    let playlistId = '';
    let lastErrorMsg = '';

    // 以私人 (PRIVATE) 狀態建立
    const privacyStatuses = ['PRIVATE'];
    for (let privacy of privacyStatuses) {
      try {
        const createJson = await fetchWithRetry(`/youtubei/v1/playlist/create?key=${apiKey}`, {
          method: 'POST',
          headers: await makeHeaders(),
          body: JSON.stringify({ context, title: playlistName, privacyStatus: privacy })
        }, 3, 1000);

        if (createJson.error) {
          lastErrorMsg = extractErrorText(createJson.error);
          continue;
        }

        playlistId = createJson.playlistId;
        if (!playlistId && createJson.actions) {
          const str = JSON.stringify(createJson.actions);
          const match = str.match(/(?:list=)(PL[\w-]+)/) || str.match(/(VLPL[\w-]+)/) || str.match(/(PL[\w-]+)/);
          if (match) playlistId = match[1].replace('VL', '');
        }

        if (playlistId) break;
        lastErrorMsg = extractErrorText(createJson.actions || createJson);
      } catch (e) {
        if (e.message === "USER_STOPPED") throw e;
        lastErrorMsg = e.message;
      }
    }

    if (!playlistId) {
      return { playlistCreated: false, success: 0, fail: videoIds.length, error: lastErrorMsg || 'Error' };
    }

    let success = 0, fail = 0;
    const chunkSize = 50;
    for (let i = 0; i < videoIds.length; i += chunkSize) {
      if (stopRequested) break;
      const chunk = videoIds.slice(i, i + chunkSize);
      const actions = chunk.map(vId => ({ action: 'ACTION_ADD_VIDEO', addedVideoId: vId }));

      let chunkOk = false;
      for (let endpoint of ['/youtubei/v1/browse/edit_playlist', '/youtubei/v1/playlist/edit']) {
        try {
          const editJson = await fetchWithRetry(`${endpoint}?key=${apiKey}`, {
            method: 'POST',
            headers: await makeHeaders(),
            body: JSON.stringify({ context, playlistId, actions })
          }, 3, 1000);

          if (editJson && !editJson.error && editJson.status !== 'STATUS_FAILED') {
            chunkOk = true;
            break;
          } else {
            lastErrorMsg = extractErrorText(editJson);
          }
        } catch (e) {
          if (e.message === "USER_STOPPED") throw e;
          lastErrorMsg = e.message;
        }
      }

      if (chunkOk) {
        success += chunk.length;
      } else {
        fail += chunk.length;
      }
      await new Promise(r => setTimeout(r, 600));
    }

    const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
    return { playlistCreated: true, playlistId, playlistUrl, success, fail, error: lastErrorMsg };
  }

  async function runCleanTask(cleanSubs, cleanPls) {
    const apiKey = getApiKey();
    const context = getContext();
    let totalSuccess = 0, totalFail = 0;

    try {
      if (cleanSubs) {
        postMsg('PROGRESS', { index: 0, total: '-', isOk: true, info: t('unsub_start', getChannelLabel()), success: 0, fail: 0 });
        const allChannelsMap = new Map();
        let token = null, pCount = 0;
        do {
          pCount++;
          const json = await fetchWithRetry(`/youtubei/v1/browse?key=${apiKey}`, {
            method: 'POST', headers: await makeHeaders(),
            body: JSON.stringify(token ? { context, continuation: token } : { context, browseId: 'FEchannels' })
          }, 3, 1000);

          const extracted = extractChannelsWithMeta(json);
          extracted.forEach((title, id) => allChannelsMap.set(id, title));
          
          token = findContinuationToken(json);
        } while (token && pCount < 50);

        const channelList = Array.from(allChannelsMap.entries()).map(([id, title]) => ({ id, title }));
        for (let i = 0; i < channelList.length; i++) {
          if (stopRequested) break;
          const cId = channelList[i].id;
          const cTitle = channelList[i].title;
          let isOk = false;
          try {
            const unsubJson = await fetchWithRetry(`/youtubei/v1/subscription/unsubscribe?key=${apiKey}`, {
              method: 'POST', headers: await makeHeaders(), body: JSON.stringify({ context, channelIds: [cId] })
            }, 3, 800);

            if (!unsubJson.error) { isOk = true; totalSuccess++; } else totalFail++;
          } catch (e) {
            if (e.message === "USER_STOPPED") break;
            totalFail++;
          }
          postMsg('PROGRESS', { index: i + 1, total: channelList.length, isOk, info: t('unsub_item', cTitle), success: totalSuccess, fail: totalFail });
          await new Promise(r => setTimeout(r, 600));
        }
      }

      if (cleanPls && !stopRequested) {
        postMsg('PROGRESS', { index: 0, total: '-', isOk: true, info: t('clean_pl_start', getChannelLabel()), success: totalSuccess, fail: totalFail });

        const playlists = await scanUserPlaylists();

        if (playlists.length === 0) {
          postMsg('PROGRESS', { index: 0, total: 0, isOk: true, info: t('clean_pl_none'), success: totalSuccess, fail: totalFail });
        } else {
          for (let i = 0; i < playlists.length; i++) {
            if (stopRequested) break;
            const item = playlists[i];
            const plId = item.id;
            let plTitle = item.title;

            if (!plTitle || plTitle.startsWith('Playlist (')) {
               try {
                 const plJson = await fetchWithRetry(`/youtubei/v1/browse?key=${apiKey}`, {
                   method: 'POST', headers: await makeHeaders(), body: JSON.stringify({ context, browseId: 'VL' + plId })
                 }, 1, 500);
                 const realTitle = extractPlaylistTitle(plJson, '');
                 if (realTitle) plTitle = realTitle;
               } catch(e) {}
            }

            let isOk = false, errMsg = '';
            try {
              const delJson = await fetchWithRetry(`/youtubei/v1/playlist/delete?key=${apiKey}`, {
                method: 'POST', headers: await makeHeaders(), body: JSON.stringify({ context, playlistId: plId })
              }, 3, 1000);

              if (!delJson.error && delJson.status !== 'STATUS_FAILED') { isOk = true; totalSuccess++; } else { totalFail++; errMsg = extractErrorText(delJson); }
            } catch (e) {
              if (e.message === "USER_STOPPED") break;
              totalFail++; errMsg = e.message;
            }
            const infoStr = isOk ? t('delete_pl_item', plTitle || plId) : t('delete_pl_fail', plTitle || plId, errMsg);
            postMsg('PROGRESS', { index: i + 1, total: playlists.length, isOk, info: infoStr, success: totalSuccess, fail: totalFail });
            await new Promise(r => setTimeout(r, 800));
          }
        }
      }
      postMsg('COMPLETE', { success: totalSuccess, fail: totalFail });
    } catch (e) {
      if (e.message !== "USER_STOPPED") postMsg('ERROR', { info: `Err: ${e.message}` });
    }
  }

  function postMsg(type, payload) { window.postMessage({ type: `RELOCATOR_${type}`, payload }, '*'); }
})();