// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'addDnsForward') {
    addDnsForward(request.domain, request.config)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({
        success: false,
        message: error.message,
        code: 'EXCEPTION'
      }));
    return true; // Keep message channel open for async response
  }
});

async function addDnsForward(domain, config) {
  const url = `${config.mikrotik.url}/rest/ip/dns/static/add`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${config.mikrotik.username}:${config.mikrotik.password}`)
      },
      body: JSON.stringify({
        name: domain,
        'forward-to': config.dns.forwardTo,
        comment: config.dns.comment
      })
    });

    const data = await response.json();

    // Success - returned ID
    if (response.ok && data.ret) {
      return {
        success: true,
        message: `Domain ${domain} added successfully`,
        id: data.ret
      };
    }

    // Error - already exists
    if (data.error === 400 && data.detail?.includes('already exists')) {
      return {
        success: false,
        message: `Domain ${domain} already exists in DNS`,
        code: 'ALREADY_EXISTS'
      };
    }

    // Other errors
    return {
      success: false,
      message: data.message || data.detail || 'Unknown error from MikroTik',
      code: 'ERROR',
      details: data
    };
    
  } catch (error) {
    // Network or parsing errors
    return {
      success: false,
      message: `Failed to connect to MikroTik: ${error.message}`,
      code: 'NETWORK_ERROR'
    };
  }
}
