// Load saved config on page load
document.addEventListener('DOMContentLoaded', () => {
  loadSavedConfig();
  document.getElementById('app-version').textContent = chrome.runtime.getManifest().version;
});

// Button handlers
document.getElementById('save-button').addEventListener('click', saveConfig);
document.getElementById('test-button').addEventListener('click', testConnection);

async function loadSavedConfig() {
  chrome.storage.local.get(['config'], (result) => {
    if (result.config) {
      const { mikrotik, dns } = result.config;

      document.getElementById('mikrotik-url').value = mikrotik?.url || '';
      document.getElementById('mikrotik-username').value = mikrotik?.username || '';
      document.getElementById('mikrotik-password').value = mikrotik?.password || '';
      document.getElementById('dns-forward-to').value = dns?.forwardTo || '';
      document.getElementById('dns-comment').value = dns?.comment || '';
    }
  });
}

async function saveConfig() {
  const config = {
    mikrotik: {
      url: document.getElementById('mikrotik-url').value.trim(),
      username: document.getElementById('mikrotik-username').value.trim(),
      password: document.getElementById('mikrotik-password').value
    },
    dns: {
      forwardTo: document.getElementById('dns-forward-to').value.trim(),
      comment: document.getElementById('dns-comment').value.trim()
    }
  };

  // Validate config
  const validation = validateConfig(config);
  if (!validation.valid) {
    showStatus('error', `❌ ${validation.error}`);
    return;
  }

  // Save to storage
  chrome.storage.local.set({ config }, () => {
    showStatus('success', `✅ ${chrome.i18n.getMessage('settingsSaved')}`);
  });
}

async function testConnection() {
  const button = document.getElementById('test-button');
  button.disabled = true;
  button.textContent = chrome.i18n.getMessage('testingButton');

  const config = {
    mikrotik: {
      url: document.getElementById('mikrotik-url').value.trim(),
      username: document.getElementById('mikrotik-username').value.trim(),
      password: document.getElementById('mikrotik-password').value
    }
  };

  if (!config.mikrotik.url || !config.mikrotik.username || !config.mikrotik.password) {
    showStatus('error', `❌ ${chrome.i18n.getMessage('fillAllFields')}`);
    button.disabled = false;
    button.textContent = chrome.i18n.getMessage('testButton');
    return;
  }

  try {
    const response = await fetch(`${config.mikrotik.url}/rest/system/identity`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Authorization': 'Basic ' + btoa(`${config.mikrotik.username}:${config.mikrotik.password}`)
      }
    });

    if (response.ok) {
      const data = await response.json();
      const identity = data.name || chrome.i18n.getMessage('unknownRouter');
      showStatus('success', `✅ ${chrome.i18n.getMessage('connectionSuccess', [identity])}`);
    } else if (response.status === 401) {
      showStatus('error', `❌ ${chrome.i18n.getMessage('authFailed')}`);
    } else if (response.status === 403) {
      showStatus('error', `❌ ${chrome.i18n.getMessage('accessDenied')}`);
    } else {
      showStatus('error', `❌ ${chrome.i18n.getMessage('connectionFailed', [response.status.toString()])}`);
    }
  } catch (error) {
    showStatus('error', `❌ ${chrome.i18n.getMessage('cannotConnect', [error.message])}`);
  } finally {
    button.disabled = false;
    button.textContent = chrome.i18n.getMessage('testButton');
  }
}

function showStatus(type, message) {
  const status = document.getElementById('status');
  status.className = `status show ${type}`;
  status.textContent = message;

  // Auto-hide after 5 seconds
  setTimeout(() => {
    status.classList.remove('show');
  }, 5000);
}
