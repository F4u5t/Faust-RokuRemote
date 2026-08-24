const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

class RokuEcpClient {
  constructor() {
    this.iconCache = new Map();
  }

  /**
   * Helper to construct Roku base URL
   */
  getBaseUrl(ip) {
    if (!ip) throw new Error('Roku IP address is required');
    const cleanIp = ip.replace(/^http:\/\//, '').replace(/:8060.*$/, '').trim();
    return `http://${cleanIp}:8060`;
  }

  /**
   * Helper to handle and format ECP errors (e.g. 403 ECP Limited mode)
   */
  handleEcpError(err, operation) {
    if (err.response && err.response.status === 403) {
      throw new Error(
        `Roku blocked the command (HTTP 403 Forbidden). Your Roku TV's Control by Mobile Apps setting is currently set to "Limited". Please go to your TV: Settings > System > Advanced system settings > Control by mobile apps > Network access, and change it to "Permissive" (or "Default").`
      );
    }
    throw new Error(`Failed to ${operation}: ${err.message}`);
  }

  /**
   * Sends a keypress command to Roku (POST /keypress/:key)
   */
  async keypress(ip, key) {
    const baseUrl = this.getBaseUrl(ip);
    const url = `${baseUrl}/keypress/${encodeURIComponent(key)}`;
    try {
      const response = await axios.post(url, '', {
        headers: { 'Content-Length': '0' },
        timeout: 3000
      });
      return { success: true, status: response.status };
    } catch (err) {
      this.handleEcpError(err, `send keypress '${key}'`);
    }
  }

  /**
   * Sends a keydown command (hold button)
   */
  async keydown(ip, key) {
    const baseUrl = this.getBaseUrl(ip);
    const url = `${baseUrl}/keydown/${encodeURIComponent(key)}`;
    try {
      const response = await axios.post(url, '', {
        headers: { 'Content-Length': '0' },
        timeout: 3000
      });
      return { success: true, status: response.status };
    } catch (err) {
      this.handleEcpError(err, `send keydown '${key}'`);
    }
  }

  /**
   * Sends a keyup command (release button)
   */
  async keyup(ip, key) {
    const baseUrl = this.getBaseUrl(ip);
    const url = `${baseUrl}/keyup/${encodeURIComponent(key)}`;
    try {
      const response = await axios.post(url, '', {
        headers: { 'Content-Length': '0' },
        timeout: 3000
      });
      return { success: true, status: response.status };
    } catch (err) {
      this.handleEcpError(err, `send keyup '${key}'`);
    }
  }

  /**
   * Types arbitrary text into Roku by sending /keypress/Lit_<char> sequentially
   */
  async sendText(ip, text) {
    const baseUrl = this.getBaseUrl(ip);
    for (const char of text) {
      const encodedChar = encodeURIComponent(char);
      const url = `${baseUrl}/keypress/Lit_${encodedChar}`;
      try {
        await axios.post(url, '', {
          headers: { 'Content-Length': '0' },
          timeout: 2000
        });
      } catch (err) {
        this.handleEcpError(err, `send character '${char}'`);
      }
      await new Promise(r => setTimeout(r, 60));
    }
    return { success: true, length: text.length };
  }

  /**
   * Queries installed apps (GET /query/apps)
   */
  async getApps(ip) {
    const baseUrl = this.getBaseUrl(ip);
    const url = `${baseUrl}/query/apps`;
    const response = await axios.get(url, { timeout: 4000 });
    const parsed = parser.parse(response.data);

    let rawApps = parsed.apps?.app;
    if (!rawApps) return [];
    if (!Array.isArray(rawApps)) {
      rawApps = [rawApps];
    }

    return rawApps.map(app => {
      const id = String(app['@_id'] || app.id || '');
      const name = typeof app === 'object' && app['#text'] ? app['#text'] : (typeof app === 'string' ? app : String(app.name || 'Unknown App'));
      const type = app['@_type'] || 'appl';
      const version = app['@_version'] || '';
      return {
        id,
        name,
        type,
        version,
        iconUrl: `/api/roku/icon?ip=${encodeURIComponent(ip)}&appId=${encodeURIComponent(id)}`
      };
    });
  }

  /**
   * Queries the currently active app (GET /query/active-app)
   */
  async getActiveApp(ip) {
    const baseUrl = this.getBaseUrl(ip);
    const url = `${baseUrl}/query/active-app`;
    try {
      const response = await axios.get(url, { timeout: 3000 });
      const parsed = parser.parse(response.data);

      const activeApp = parsed['active-app']?.app;
      if (!activeApp) return null;

      const id = String(activeApp['@_id'] || '');
      const name = activeApp['#text'] || activeApp.name || 'Home';
      return {
        id,
        name,
        iconUrl: id ? `/api/roku/icon?ip=${encodeURIComponent(ip)}&appId=${encodeURIComponent(id)}` : null
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Queries detailed device information (GET /query/device-info)
   */
  async getDeviceInfo(ip) {
    const baseUrl = this.getBaseUrl(ip);
    const url = `${baseUrl}/query/device-info`;
    const response = await axios.get(url, { timeout: 3000 });
    const parsed = parser.parse(response.data);
    const info = parsed['device-info'] || {};
    return {
      name: info['user-device-name'] || info['friendly-device-name'] || info['model-name'] || 'Roku Device',
      modelName: info['model-name'] || '',
      modelNumber: info['model-number'] || '',
      serialNumber: info['serial-number'] || '',
      softwareVersion: info['software-version'] || '',
      isTv: info['is-tv'] === 'true' || info['is-tv'] === true,
      powerMode: info['power-mode'] || 'PowerOn',
      ecpMode: info['ecp-setting-mode'] || 'permissive',
      networkType: info['network-type'] || '',
      wifiMac: info['wifi-mac'] || '',
      ethernetMac: info['ethernet-mac'] || '',
      headphonesConnected: info['headphones-connected'] === 'true'
    };
  }

  /**
   * Fetches the app icon from Roku and returns binary buffer and content-type
   */
  async getAppIcon(ip, appId) {
    const cacheKey = `${ip}:${appId}`;
    const cached = this.iconCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < 3600000)) {
      return cached;
    }

    const baseUrl = this.getBaseUrl(ip);
    const url = `${baseUrl}/query/icon/${encodeURIComponent(appId)}`;
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 4000
    });

    const iconData = {
      data: Buffer.from(response.data),
      contentType: response.headers['content-type'] || 'image/jpeg',
      timestamp: Date.now()
    };
    this.iconCache.set(cacheKey, iconData);
    return iconData;
  }

  /**
   * Launches an installed app with optional query parameters (POST /launch/:appId)
   */
  async launchApp(ip, appId, params = {}) {
    const baseUrl = this.getBaseUrl(ip);
    let url = `${baseUrl}/launch/${encodeURIComponent(appId)}`;

    const queryParams = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null) {
        queryParams.append(key, val);
      }
    }
    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    try {
      const response = await axios.post(url, '', {
        headers: { 'Content-Length': '0' },
        timeout: 4000
      });
      return { success: true, status: response.status };
    } catch (err) {
      this.handleEcpError(err, `launch app '${appId}'`);
    }
  }

  /**
   * Launches a web URL onto the Roku
   */
  async launchWebUrl(ip, targetUrl, strategy = 'dev_channel', customAppId = '') {
    const baseUrl = this.getBaseUrl(ip);
    let launchUrl;

    switch (strategy) {
      case 'browser_app': {
        const browserId = customAppId || '580456';
        launchUrl = `${baseUrl}/launch/${browserId}?url=${encodeURIComponent(targetUrl)}`;
        break;
      }
      case 'play_on_roku': {
        launchUrl = `${baseUrl}/input/15985?url=${encodeURIComponent(targetUrl)}`;
        break;
      }
      case 'dev_channel':
      default: {
        launchUrl = `${baseUrl}/launch/dev?url=${encodeURIComponent(targetUrl)}&contentId=${encodeURIComponent(targetUrl)}`;
        break;
      }
    }

    try {
      const response = await axios.post(launchUrl, '', {
        headers: { 'Content-Length': '0' },
        timeout: 4000
      });
      return { success: true, status: response.status, launchedVia: strategy };
    } catch (err) {
      this.handleEcpError(err, `launch web URL via ${strategy}`);
    }
  }
}

module.exports = new RokuEcpClient();
