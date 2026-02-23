// Firefox uses 'browser', Chrome uses 'chrome'
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const FETCH_TIMEOUT = 5000; // 5 seconds
const MAX_TIMEOUT_INTERVAL = 10000; // 10 seconds - max interval for service worker safety

// Schedule window close with periodic checks (workaround for service worker sleep)
function scheduleWindowClose(windowId, durationMs) {
  const targetTime = Date.now() + durationMs;
  const startTime = Date.now();
  let checkCount = 0;

  function checkAndClose() {
    checkCount++;
    const elapsed = Date.now() - startTime;
    const remaining = targetTime - Date.now();

    console.log(`[MikroTik DNS] Check #${checkCount} for window ${windowId}: elapsed=${Math.round(elapsed/1000)}s, remaining=${Math.round(remaining/1000)}s`);

    if (remaining <= 0) {
      // Time's up, close the window
      console.log(`[MikroTik DNS] Time's up! Closing window ${windowId} after ${Math.round(elapsed/1000)}s (target was ${Math.round(durationMs/1000)}s)`);
      browserAPI.windows.remove(windowId).then(() => {
        console.log(`[MikroTik DNS] ✅ Window ${windowId} closed successfully`);
      }).catch((error) => {
        console.error(`[MikroTik DNS] ❌ Failed to close window ${windowId}:`, error);
      });
    } else {
      // More time needed, schedule next check
      const nextCheckIn = Math.min(remaining, MAX_TIMEOUT_INTERVAL);
      console.log(`[MikroTik DNS] ⏰ Scheduling check #${checkCount + 1} for window ${windowId} in ${Math.round(nextCheckIn/1000)}s`);
      setTimeout(checkAndClose, nextCheckIn);
    }
  }

  // Start the check chain
  const initialDelay = Math.min(durationMs, MAX_TIMEOUT_INTERVAL);
  console.log(`[MikroTik DNS] 🚀 Starting close schedule for window ${windowId}: total=${Math.round(durationMs/1000)}s, first check in ${Math.round(initialDelay/1000)}s`);
  setTimeout(checkAndClose, initialDelay);
}

// Handle messages from popup/options
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'addDnsForward') {
    addDnsForward(request.domain, request.config, request.matchSubdomain)
      .then(result => {
        sendResponse(result);
        // Open incognito window on success OR if domain already exists
        const shouldOpenIncognito = (result.success || result.code === 'ALREADY_EXISTS') &&
                                    request.currentUrl &&
                                    request.config.afterAdd?.reopenInIncognito;
        if (shouldOpenIncognito) {
          const duration = (request.config.afterAdd?.reopenDuration ?? 0) * 1000;
          setTimeout(() => {
            browserAPI.windows.create({ incognito: true, url: request.currentUrl }).then((window) => {
              if (!window) {
                console.error('[MikroTik DNS] Failed to create incognito window: window is null. Enable "Allow in Incognito" in extension settings.');
                return;
              }
              console.log('[MikroTik DNS] Incognito window opened:', window.id);
              if (duration > 0) {
                scheduleWindowClose(window.id, duration);
              } else {
                console.log('[MikroTik DNS] Window will stay open (duration=0)');
              }
            }).catch((error) => {
              console.error('[MikroTik DNS] Failed to create incognito window:', error);
            });
          }, 3000);
        }
      })
      .catch(error => sendResponse({
        success: false,
        message: error.message,
        code: 'EXCEPTION'
      }));
    return true;
  }
  if (request.action === 'testConnection') {
    testConnection(request.config)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({
        success: false,
        message: error.message,
        code: 'EXCEPTION'
      }));
    return true;
  }
});

async function testConnection(config) {
  const url = `${config.mikrotik.url}/rest/system/identity`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'Authorization': 'Basic ' + btoa(`${config.mikrotik.username}:${config.mikrotik.password}`)
      }
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        identity: data.name || browserAPI.i18n.getMessage('unknownRouter')
      };
    } else if (response.status === 401) {
      return { success: false, message: browserAPI.i18n.getMessage('authFailed'), code: 'AUTH_ERROR' };
    } else if (response.status === 403) {
      return { success: false, message: browserAPI.i18n.getMessage('accessDenied'), code: 'FORBIDDEN' };
    } else {
      return { success: false, message: browserAPI.i18n.getMessage('connectionFailed', [response.status.toString()]), code: 'HTTP_ERROR' };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return { success: false, message: browserAPI.i18n.getMessage('connectionTimeout'), code: 'TIMEOUT' };
    }
    return { success: false, message: browserAPI.i18n.getMessage('cannotConnect', [error.message]), code: 'NETWORK_ERROR' };
  }
}

async function addDnsForward(domain, config, matchSubdomain = true) {
  const url = `${config.mikrotik.url}/rest/ip/dns/static/add`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  const body = {
    name: domain,
    'forward-to': config.dns.forwardTo
  };
  if (config.dns.comment) {
    body.comment = config.dns.comment;
  }
  if (config.dns.addressList) {
    body['address-list'] = config.dns.addressList;
  }
  if (matchSubdomain) {
    body['match-subdomain'] = 'true';
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${config.mikrotik.username}:${config.mikrotik.password}`)
      },
      body: JSON.stringify(body)
    });
    clearTimeout(timeoutId);

    const data = await response.json();

    // Success - returned ID
    if (response.ok && data.ret) {
      const result = {
        success: true,
        message: browserAPI.i18n.getMessage('domainAddedSuccess', [domain]),
        id: data.ret
      };

      // Flush DNS cache if enabled in config
      if (config.dns.flushCache) {
        const flushResult = await flushDnsCache(config);
        result.flushResult = flushResult;
      }

      return result;
    }

    // Error - already exists
    if (data.error === 400 && data.detail?.includes('already exists')) {
      const result = {
        success: false,
        message: browserAPI.i18n.getMessage('domainAlreadyExists', [domain]),
        code: 'ALREADY_EXISTS'
      };

      // Flush DNS cache if enabled in config (even if domain already exists)
      if (config.dns.flushCache) {
        const flushResult = await flushDnsCache(config);
        result.flushResult = flushResult;
      }

      return result;
    }

    // Other errors
    return {
      success: false,
      message: data.message || data.detail || browserAPI.i18n.getMessage('unknownMikrotikError'),
      code: 'ERROR',
      details: data
    };

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return { success: false, message: browserAPI.i18n.getMessage('connectionTimeout'), code: 'TIMEOUT' };
    }
    return {
      success: false,
      message: browserAPI.i18n.getMessage('failedToConnect', [error.message]),
      code: 'NETWORK_ERROR'
    };
  }
}

async function flushDnsCache(config) {
  const url = `${config.mikrotik.url}/rest/system/script/run`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  const body = {
    '.id': 'flush_dns'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${config.mikrotik.username}:${config.mikrotik.password}`)
      },
      body: JSON.stringify(body)
    });
    clearTimeout(timeoutId);

    const data = await response.json();

    if (response.ok) {
      return { success: true };
    } else {
      // Parse error response from MikroTik
      const errorMsg = data.detail || data.message || `HTTP ${response.status}`;
      return { success: false, message: errorMsg };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return { success: false, message: 'Timeout flushing DNS cache' };
    }
    return { success: false, message: `Failed to flush DNS cache: ${error.message}` };
  }
}
