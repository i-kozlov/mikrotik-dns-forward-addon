let currentDomain = null;
let config = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Load config from storage
  config = await loadConfig();
  
  // Check if config is valid
  const validation = validateConfig(config);
  if (!validation.valid) {
    showConfigMissing();
    return;
  }
  
  // Get current tab and extract domain
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) {
    showStatus('error', 'Cannot get current tab URL');
    return;
  }
  
  currentDomain = getBaseDomain(tab.url);
  if (!currentDomain) {
    showStatus('error', 'Cannot extract domain from URL');
    return;
  }
  
  // Show main content
  document.getElementById('main-content').style.display = 'block';
  document.getElementById('domain-input').value = currentDomain;
  
  // Setup button handlers
  document.getElementById('add-button').addEventListener('click', handleAddDomain);
});

// Open settings button handler
document.getElementById('open-settings').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

async function loadConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['config'], (result) => {
      resolve(result.config || null);
    });
  });
}

function showConfigMissing() {
  document.getElementById('config-missing').style.display = 'block';
}

async function handleAddDomain() {
  const button = document.getElementById('add-button');
  const domainInput = document.getElementById('domain-input');
  const domain = domainInput.value.trim();
  
  if (!domain) {
    showStatus('error', 'Domain cannot be empty');
    return;
  }
  
  button.disabled = true;
  button.textContent = 'Adding...';
  
  try {
    // Send message to background script
    const result = await chrome.runtime.sendMessage({
      action: 'addDnsForward',
      domain: domain,
      config: config
    });
    
    if (result.success) {
      showStatus('success', `✅ ${result.message}`);
      
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '../icons/icon48.png',
        title: 'DNS Forward Added',
        message: `Domain ${domain} added to MikroTik`
      });
      
      // Close popup after 2 seconds
      setTimeout(() => window.close(), 2000);
    } else {
      if (result.code === 'ALREADY_EXISTS') {
        showStatus('warning', `ℹ️ ${result.message}`);
      } else {
        showStatus('error', `❌ ${result.message}`);
      }
      button.disabled = false;
      button.textContent = 'Add to MikroTik';
    }
  } catch (error) {
    showStatus('error', `Error: ${error.message}`);
    button.disabled = false;
    button.textContent = 'Add to MikroTik';
  }
}

function showStatus(type, message) {
  const status = document.getElementById('status');
  status.className = `status show ${type}`;
  status.textContent = message;
}
