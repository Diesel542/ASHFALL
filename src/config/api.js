// ASHFALL - API Configuration
// Handles Anthropic API key management

/**
 * Initialize the API configuration
 * Checks various sources for the API key
 */
export const initializeAPI = () => {
  // Check for API key in various locations
  const key =
    window.ASHFALL_CONFIG?.apiKey ||
    localStorage.getItem('anthropic_api_key') ||
    null;

  if (!key) {
    console.warn(
      'No Anthropic API key found. Dynamic dialogue will use fallbacks.'
    );
    // Don't auto-prompt - let the game handle it gracefully
  }

  return key;
};

/**
 * Show a prompt for the user to enter their API key
 * Called when the user tries to use dynamic dialogue without a key
 */
export const promptForAPIKey = () => {
  // Create a simple modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'api-key-modal';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    font-family: 'Courier New', monospace;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: #1a1a1a;
    border: 2px solid #c4a77d;
    padding: 30px;
    max-width: 500px;
    text-align: center;
  `;

  modal.innerHTML = `
    <h2 style="color: #c4a77d; margin-bottom: 20px;">Dynamic NPC Dialogue</h2>
    <p style="color: #888; margin-bottom: 20px;">
      Enter your Anthropic API key to enable LLM-driven conversations with NPCs.
      Your key is stored locally and never sent anywhere except Anthropic's API.
    </p>
    <input type="password" id="api-key-input" placeholder="sk-ant-..." style="
      width: 100%;
      padding: 10px;
      background: #2a2a2a;
      border: 1px solid #444;
      color: #fff;
      font-family: 'Courier New', monospace;
      margin-bottom: 20px;
    " />
    <div style="display: flex; gap: 10px; justify-content: center;">
      <button id="api-key-submit" style="
        padding: 10px 20px;
        background: #c4a77d;
        border: none;
        color: #1a1a1a;
        cursor: pointer;
        font-family: 'Courier New', monospace;
      ">Enable Dynamic Dialogue</button>
      <button id="api-key-skip" style="
        padding: 10px 20px;
        background: transparent;
        border: 1px solid #444;
        color: #888;
        cursor: pointer;
        font-family: 'Courier New', monospace;
      ">Use Static Dialogue</button>
    </div>
    <p style="color: #666; font-size: 12px; margin-top: 20px;">
      Without an API key, NPCs will use pre-written dialogue trees instead.
    </p>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  return new Promise((resolve) => {
    const input = document.getElementById('api-key-input');
    const submitBtn = document.getElementById('api-key-submit');
    const skipBtn = document.getElementById('api-key-skip');

    submitBtn.addEventListener('click', () => {
      const key = input.value.trim();
      if (key) {
        setAPIKey(key);
        overlay.remove();
        resolve(true);
      }
    });

    skipBtn.addEventListener('click', () => {
      overlay.remove();
      resolve(false);
    });

    // Handle enter key
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        submitBtn.click();
      }
    });

    // Focus the input
    input.focus();
  });
};

/**
 * Set the API key in localStorage
 */
export const setAPIKey = (key) => {
  localStorage.setItem('anthropic_api_key', key);
  console.log('API key saved to localStorage');
};

/**
 * Get the current API key
 */
export const getAPIKey = () => {
  return (
    window.ASHFALL_CONFIG?.apiKey ||
    localStorage.getItem('anthropic_api_key') ||
    null
  );
};

/**
 * Check if an API key is configured
 */
export const hasAPIKey = () => {
  return !!getAPIKey();
};

/**
 * Clear the stored API key
 */
export const clearAPIKey = () => {
  localStorage.removeItem('anthropic_api_key');
  console.log('API key cleared from localStorage');
};

/**
 * Validate an API key by making a minimal request
 * Returns true if valid, false otherwise
 */
export const validateAPIKey = async (key) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      })
    });

    return response.ok;
  } catch (error) {
    console.error('API key validation failed:', error);
    return false;
  }
};
