const express = require('express');
const cors = require('cors');
const path = require('path');
const discovery = require('./discovery');
const ecp = require('./ecpClient');
const bookmarks = require('./bookmarks');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-memory devices store
let knownDevices = new Map();

// --- Device Discovery & Management Endpoints ---

/**
 * Scan network for Roku devices via SSDP
 */
app.get('/api/devices', async (req, res) => {
  try {
    const devices = await discovery.discover(2500);
    devices.forEach(d => knownDevices.set(d.ip, d));
    res.json({
      success: true,
      devices: Array.from(knownDevices.values())
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Verify and add a manually entered Roku IP address
 */
app.post('/api/devices/verify', async (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ success: false, error: 'IP is required' });

  try {
    const info = await ecp.getDeviceInfo(ip);
    const device = {
      ip,
      location: `http://${ip}:8060/`,
      name: info.name || `Roku (${ip})`,
      model: info.modelName || 'Roku Device',
      modelNumber: info.modelNumber || '',
      serialNumber: info.serialNumber || '',
      isTv: info.isTv,
      powerMode: info.powerMode || 'PowerOn',
      active: true,
      lastSeen: Date.now()
    };
    knownDevices.set(ip, device);
    res.json({ success: true, device });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: `Could not connect to Roku at ${ip}:8060. Check if the IP is correct and the TV is powered on.`
    });
  }
});

// --- Remote Control Endpoints ---

/**
 * Send a keypress (tap)
 */
app.post('/api/roku/keypress', async (req, res) => {
  const { ip, key } = req.body;
  if (!ip || !key) return res.status(400).json({ success: false, error: 'ip and key are required' });

  try {
    const result = await ecp.keypress(ip, key);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Send keydown (hold button)
 */
app.post('/api/roku/keydown', async (req, res) => {
  const { ip, key } = req.body;
  if (!ip || !key) return res.status(400).json({ success: false, error: 'ip and key are required' });

  try {
    const result = await ecp.keydown(ip, key);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Send keyup (release button)
 */
app.post('/api/roku/keyup', async (req, res) => {
  const { ip, key } = req.body;
  if (!ip || !key) return res.status(400).json({ success: false, error: 'ip and key are required' });

  try {
    const result = await ecp.keyup(ip, key);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Send text string via sequential Lit_ character presses
 */
app.post('/api/roku/text', async (req, res) => {
  const { ip, text } = req.body;
  if (!ip || text === undefined) return res.status(400).json({ success: false, error: 'ip and text are required' });

  try {
    const result = await ecp.sendText(ip, String(text));
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- App Query & Icon Endpoints ---

/**
 * Get all installed apps for a Roku device
 */
app.get('/api/roku/apps', async (req, res) => {
  const { ip } = req.query;
  if (!ip) return res.status(400).json({ success: false, error: 'ip query param is required' });

  try {
    const apps = await ecp.getApps(ip);
    res.json({ success: true, apps });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get active running app
 */
app.get('/api/roku/active-app', async (req, res) => {
  const { ip } = req.query;
  if (!ip) return res.status(400).json({ success: false, error: 'ip query param is required' });

  try {
    const active = await ecp.getActiveApp(ip);
    res.json({ success: true, activeApp: active });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get device info
 */
app.get('/api/roku/device-info', async (req, res) => {
  const { ip } = req.query;
  if (!ip) return res.status(400).json({ success: false, error: 'ip query param is required' });

  try {
    const info = await ecp.getDeviceInfo(ip);
    res.json({ success: true, deviceInfo: info });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get live audio and volume status
 */
app.get('/api/roku/audio-device', async (req, res) => {
  const { ip } = req.query;
  if (!ip) return res.status(400).json({ success: false, error: 'ip query param is required' });

  try {
    const audio = await ecp.getAudioDevice(ip);
    res.json(audio);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Set target volume level (delta stepped)
 */
app.post('/api/roku/volume', async (req, res) => {
  const { ip, volume } = req.body;
  if (!ip || volume === undefined) return res.status(400).json({ success: false, error: 'ip and volume are required' });

  try {
    const result = await ecp.setVolume(ip, Number(volume));
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Proxy app icon
 */
app.get('/api/roku/icon', async (req, res) => {
  const { ip, appId } = req.query;
  if (!ip || !appId) return res.status(400).send('ip and appId are required');

  try {
    const icon = await ecp.getAppIcon(ip, appId);
    res.set('Content-Type', icon.contentType);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.send(icon.data);
  } catch (err) {
    res.status(404).send('Icon not found');
  }
});

/**
 * Launch an installed channel
 */
app.post('/api/roku/launch', async (req, res) => {
  const { ip, appId, params } = req.body;
  if (!ip || !appId) return res.status(400).json({ success: false, error: 'ip and appId are required' });

  try {
    const result = await ecp.launchApp(ip, appId, params || {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Launch a custom web app URL onto Roku
 */
app.post('/api/roku/launch-web', async (req, res) => {
  const { ip, url, launchType, customAppId } = req.body;
  if (!ip || !url) return res.status(400).json({ success: false, error: 'ip and url are required' });

  try {
    const result = await ecp.launchWebUrl(ip, url, launchType, customAppId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Play a YouTube video or instant prank directly on Roku
 */
app.post('/api/roku/play-video', async (req, res) => {
  const { ip, videoId, volumeBoost } = req.body;
  if (!ip || !videoId) return res.status(400).json({ success: false, error: 'ip and videoId are required' });

  try {
    const result = await ecp.playYouTubeVideo(ip, videoId, volumeBoost);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Custom Web App Bookmarks Endpoints ---

app.get('/api/bookmarks', (req, res) => {
  res.json({ success: true, bookmarks: bookmarks.getAll() });
});

app.post('/api/bookmarks', (req, res) => {
  const created = bookmarks.add(req.body);
  res.json({ success: true, bookmark: created });
});

app.delete('/api/bookmarks/:id', (req, res) => {
  bookmarks.delete(req.params.id);
  res.json({ success: true });
});

// --- Soundboard & Instant Video Presets Endpoints ---

const soundboard = require('./soundboard');

app.get('/api/soundboard', (req, res) => {
  res.json({ success: true, presets: soundboard.getAll() });
});

app.post('/api/soundboard', (req, res) => {
  const created = soundboard.add(req.body);
  res.json({ success: true, preset: created, presets: soundboard.getAll() });
});

app.put('/api/soundboard/:id', (req, res) => {
  const updated = soundboard.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Preset not found' });
  res.json({ success: true, preset: updated, presets: soundboard.getAll() });
});

app.delete('/api/soundboard/:id', (req, res) => {
  soundboard.delete(req.params.id);
  res.json({ success: true, presets: soundboard.getAll() });
});

app.post('/api/soundboard/reset', (req, res) => {
  const resetList = soundboard.reset();
  res.json({ success: true, presets: resetList });
});

// --- YouTube TV Presets Endpoints ---

const youtubePresets = require('./youtubePresets');

app.get('/api/youtubetv/presets', (req, res) => {
  res.json({
    success: true,
    presets: youtubePresets.getAll(),
    library: youtubePresets.getLibrary()
  });
});

app.post('/api/youtubetv/presets', (req, res) => {
  const newPreset = youtubePresets.add(req.body);
  res.json({ success: true, preset: newPreset, presets: youtubePresets.getAll() });
});

app.delete('/api/youtubetv/presets/:id', (req, res) => {
  youtubePresets.delete(req.params.id);
  res.json({ success: true, presets: youtubePresets.getAll() });
});

app.post('/api/youtubetv/reorder', (req, res) => {
  const { orderedIds } = req.body;
  const reordered = youtubePresets.reorder(orderedIds);
  res.json({ success: true, presets: reordered });
});

app.post('/api/youtubetv/launch', async (req, res) => {
  const { ip, contentId, query } = req.body;
  if (!ip) return res.status(400).json({ success: false, error: 'ip is required' });

  try {
    const result = await ecp.launchYouTubeTvChannel(ip, contentId, query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Static Frontend in Production ---
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Roku TV Web Remote Server Running!`);
  console.log(` Local:   http://localhost:${PORT}`);
  console.log(` API:     http://localhost:${PORT}/api/devices`);
  console.log(`=========================================`);
});
