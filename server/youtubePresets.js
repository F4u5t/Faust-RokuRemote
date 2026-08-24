const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PRESETS_FILE = path.join(DATA_DIR, 'youtube_presets.json');

const DEFAULT_POPULAR_PRESETS = [
  { id: 'espn', title: 'ESPN', slug: 'espn', category: 'Sports', color: 'from-red-600 to-red-800' },
  { id: 'espn2', title: 'ESPN 2', slug: 'espn-2', category: 'Sports', color: 'from-red-700 to-red-900' },
  { id: 'fs1', title: 'FOX Sports 1', slug: 'fox-sports-1', category: 'Sports', color: 'from-blue-600 to-blue-800' },
  { id: 'fs2', title: 'FOX Sports 2', slug: 'fox-sports-2', category: 'Sports', color: 'from-blue-700 to-blue-900' },
  { id: 'nfl', title: 'NFL Network', slug: 'nfl-network', category: 'Sports', color: 'from-blue-900 to-slate-900' },
  { id: 'golf', title: 'Golf Channel', slug: 'golf-channel', category: 'Sports', color: 'from-emerald-700 to-emerald-900' },
  { id: 'tnt', title: 'TNT', slug: 'tnt', category: 'Entertainment', color: 'from-amber-600 to-amber-800' },
  { id: 'tbs', title: 'TBS', slug: 'tbs', category: 'Entertainment', color: 'from-cyan-600 to-cyan-800' },
  { id: 'usa', title: 'USA Network', slug: 'usa-network', category: 'Entertainment', color: 'from-indigo-600 to-blue-800' },
  { id: 'hgtv', title: 'HGTV', slug: 'hgtv', category: 'Lifestyle', color: 'from-teal-600 to-emerald-800' },
  { id: 'food', title: 'Food Network', slug: 'food-network', category: 'Lifestyle', color: 'from-orange-600 to-red-700' },
  { id: 'bravo', title: 'Bravo', slug: 'bravo', category: 'Entertainment', color: 'from-sky-600 to-blue-700' },
  { id: 'fx', title: 'FX', slug: 'fx', category: 'Entertainment', color: 'from-amber-700 to-yellow-800' },
  { id: 'discovery', title: 'Discovery', slug: 'discovery-channel', category: 'Doc', color: 'from-blue-700 to-sky-900' },
  { id: 'history', title: 'History', slug: 'history', category: 'Doc', color: 'from-amber-800 to-stone-900' },
  { id: 'cnn', title: 'CNN', slug: 'cnn', category: 'News', color: 'from-red-600 to-red-900' },
  { id: 'foxnews', title: 'Fox News', slug: 'fox-news-channel', category: 'News', color: 'from-blue-800 to-red-800' },
  { id: 'msnbc', title: 'MSNBC', slug: 'msnbc', category: 'News', color: 'from-blue-600 to-purple-800' },
  { id: 'weather', title: 'Weather Channel', slug: 'the-weather-channel', category: 'News', color: 'from-sky-700 to-blue-900' },
  { id: 'disney', title: 'Disney Channel', slug: 'disney-channel', category: 'Kids', color: 'from-blue-500 to-indigo-700' }
];

class YouTubePresetsManager {
  constructor() {
    this.ensureDataDir();
    this.loadPresets();
  }

  ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  loadPresets() {
    try {
      if (fs.existsSync(PRESETS_FILE)) {
        const raw = fs.readFileSync(PRESETS_FILE, 'utf8');
        this.presets = JSON.parse(raw);
      } else {
        // Initial setup with popular favorites
        this.presets = DEFAULT_POPULAR_PRESETS.slice(0, 10);
        this.savePresets();
      }
    } catch (e) {
      console.error('Error loading YouTube TV presets:', e);
      this.presets = DEFAULT_POPULAR_PRESETS.slice(0, 10);
    }
  }

  savePresets() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(PRESETS_FILE, JSON.stringify(this.presets, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving YouTube TV presets:', e);
    }
  }

  getAll() {
    return this.presets;
  }

  getLibrary() {
    return DEFAULT_POPULAR_PRESETS;
  }

  add(preset) {
    let cleanSlug = (preset.slug || preset.title || '').trim();
    // Clean URL if pasted (e.g. tv.youtube.com/live/espn -> espn)
    if (cleanSlug.includes('tv.youtube.com/live/')) {
      cleanSlug = cleanSlug.split('tv.youtube.com/live/')[1].split('?')[0].replace(/\/$/, '');
    } else if (cleanSlug.includes('tv.youtube.com/watch/')) {
      cleanSlug = cleanSlug.split('tv.youtube.com/watch/')[1].split('?')[0].replace(/\/$/, '');
    }

    const newPreset = {
      id: preset.id || `custom_${Date.now()}`,
      title: preset.title || 'Custom Channel',
      slug: cleanSlug,
      category: preset.category || 'General',
      color: preset.color || 'from-purple-700 to-indigo-900'
    };

    // Prevent duplicates by slug/id
    this.presets = this.presets.filter(p => p.id !== newPreset.id && p.slug !== newPreset.slug);
    this.presets.push(newPreset);
    this.savePresets();
    return newPreset;
  }

  delete(id) {
    this.presets = this.presets.filter(p => p.id !== id);
    this.savePresets();
    return true;
  }

  reorder(orderedIds) {
    if (!Array.isArray(orderedIds)) return this.presets;
    const map = new Map(this.presets.map(p => [p.id, p]));
    const reordered = [];
    for (const id of orderedIds) {
      if (map.has(id)) {
        reordered.push(map.get(id));
        map.delete(id);
      }
    }
    // Append any leftover
    for (const remaining of map.values()) {
      reordered.push(remaining);
    }
    this.presets = reordered;
    this.savePresets();
    return this.presets;
  }
}

module.exports = new YouTubePresetsManager();
