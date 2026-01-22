// Firefox uses 'browser', Chrome uses 'chrome'
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const FETCH_TIMEOUT = 5000; // 5 seconds

// Handle messages from popup/options
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'addDnsForward') {
    addDnsForward(request.domain, request.config)
      .then(result => sendResponse(result))
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

async function addDnsForward(domain, config) {
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
      return {
        success: true,
        message: browserAPI.i18n.getMessage('domainAddedSuccess', [domain]),
        id: data.ret
      };
    }

    // Error - already exists
    if (data.error === 400 && data.detail?.includes('already exists')) {
      return {
        success: false,
        message: browserAPI.i18n.getMessage('domainAlreadyExists', [domain]),
        code: 'ALREADY_EXISTS'
      };
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
