// Extract base domain from URL
function getBaseDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    
    // Remove www. prefix
    let domain = hostname.replace(/^www\./, '');
    
    // Extract base domain (remove subdomains)
    // e.g., api.github.com -> github.com
    const parts = domain.split('.');
    
    // Handle domains like co.uk, com.au, etc.
    if (parts.length > 2) {
      // Simple heuristic: take last 2 parts
      // For production, use a proper public suffix list
      domain = parts.slice(-2).join('.');
    }
    
    return domain;
  } catch (error) {
    console.error('Error parsing domain:', error);
    return null;
  }
}

// Validate MikroTik config
function validateConfig(config) {
  if (!config || !config.mikrotik || !config.dns) {
    return { valid: false, error: 'Configuration is incomplete' };
  }
  
  const { mikrotik, dns } = config;
  
  if (!mikrotik.url) {
    return { valid: false, error: 'MikroTik URL is required' };
  }
  
  // Check that URL starts with http:// or https://
  if (!mikrotik.url.match(/^https?:\/\/.+/)) {
    return { valid: false, error: 'MikroTik URL must start with http:// or https://' };
  }
  
  if (!mikrotik.username || !mikrotik.password) {
    return { valid: false, error: 'MikroTik username and password are required' };
  }
  
  if (!dns.forwardTo) {
    return { valid: false, error: 'DNS forward-to target is required' };
  }

  return { valid: true };
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getBaseDomain, validateConfig };
}
