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
   * Queries audio device status including live volume and mute (GET /query/audio-device)
   */
  async getAudioDevice(ip) {
    const baseUrl = this.getBaseUrl(ip);
    const url = `${baseUrl}/query/audio-device`;
    try {
      const response = await axios.get(url, { timeout: 3000 });
      const parsed = parser.parse(response.data);
      const audio = parsed['audio-device'] || {};
      const global = audio.global || {};
      const isMuted = global.muted === 'true' || global.muted === true;
      const volume = typeof global.volume === 'number' ? global.volume : parseInt(global.volume || '0', 10);

      return {
        success: true,
        volume: isNaN(volume) ? 0 : volume,
        muted: isMuted,
        destinations: global['destination-list'] || 'speakers'
      };
    } catch (err) {
      return { success: false, error: err.message, volume: null, muted: null };
    }
  }

  /**
   * Adjusts volume to target level by computing delta and sending VolumeUp / VolumeDown keypresses
   */
  async setVolume(ip, targetVolume) {
    const current = await this.getAudioDevice(ip);
    if (!current.success || current.volume === null) {
      throw new Error('Unable to read current TV volume');
    }
    const currentVol = current.volume;
    const diff = Math.round(targetVolume) - currentVol;
    if (diff === 0) return current;

    const key = diff > 0 ? 'VolumeUp' : 'VolumeDown';
    const count = Math.min(Math.abs(diff), 30); // cap batch

    for (let i = 0; i < count; i++) {
      await this.keypress(ip, key);
      await new Promise(r => setTimeout(r, 45));
    }
    return await this.getAudioDevice(ip);
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

  /**
   * Deep links into YouTube TV (App ID 195316) or launches cleanly
   */
  async launchYouTubeTvChannel(ip, rawContentId, query = '') {
    const baseUrl = this.getBaseUrl(ip);
    let launchUrl = `${baseUrl}/launch/195316`;
    const params = new URLSearchParams();

    let cleanId = (rawContentId || '').trim();
    // Extract 11-char YouTube ID if URL passed
    if (cleanId.includes('v=')) {
      cleanId = cleanId.split('v=')[1].split('&')[0];
    } else if (cleanId.includes('youtu.be/')) {
      cleanId = cleanId.split('youtu.be/')[1].split('?')[0];
    }

    // Only pass contentId if it's a valid 11-character YouTube video / live ID
    // Passing slugs like "espn" causes YouTube TV to error "This Video is not available"
    const isValidYouTubeId = /^[a-zA-Z0-9_-]{11}$/.test(cleanId);

    if (isValidYouTubeId) {
      params.append('contentId', cleanId);
      params.append('mediaType', 'live');
    }

    if (query) {
      params.append('query', query);
    }

    const qs = params.toString();
    if (qs) {
      launchUrl += `?${qs}`;
    }

    try {
      const response = await axios.post(launchUrl, '', {
        headers: { 'Content-Length': '0' },
        timeout: 4000
      });
      return { success: true, status: response.status, contentId: isValidYouTubeId ? cleanId : null, launchedUrl: launchUrl };
    } catch (err) {
      this.handleEcpError(err, `tune YouTube TV`);
    }
  }

  /**
   * Plays any YouTube video directly on standard YouTube (App ID 837)
   */
  async playYouTubeVideo(ip, videoInput, volumeBoost = false) {
    let videoId = (videoInput || '').trim();
    if (videoId.includes('v=')) {
      videoId = videoId.split('v=')[1].split('&')[0];
    } else if (videoId.includes('youtu.be/')) {
      videoId = videoId.split('youtu.be/')[1].split('?')[0];
    } else if (videoId.includes('shorts/')) {
      videoId = videoId.split('shorts/')[1].split('?')[0];
    }

    if (volumeBoost) {
      try {
        // Set volume to 28 so it's clearly audible
        await this.setVolume(ip, 28);
      } catch (e) {
        // ignore volume error
      }
    }

    // Launch YouTube App ID 837 with contentID
    const baseUrl = this.getBaseUrl(ip);
    const launchUrl = `${baseUrl}/launch/837?contentID=${encodeURIComponent(videoId)}&mediaType=live`;

    try {
      const response = await axios.post(launchUrl, '', {
        headers: { 'Content-Length': '0' },
        timeout: 4000
      });
      return { success: true, videoId, status: response.status };
    } catch (err) {
      this.handleEcpError(err, `play YouTube video ${videoId}`);
    }
  }
}

module.exports = new RokuEcpClient();
