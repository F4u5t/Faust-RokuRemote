const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SOUNDBOARD_FILE = path.join(DATA_DIR, 'soundboard_presets.json');

const DEFAULT_PRESETS = [
  {
    id: 'rickroll',
    title: 'Rick Roll 🕺',
    subtitle: 'Never Gonna Give You Up',
    videoId: 'dQw4w9WgXcQ',
    color: 'from-amber-500 to-rose-600',
    border: 'border-amber-500/40',
    badge: 'Classic'
  },
  {
    id: 'vitas',
    title: 'Weird Singing Guy 👽',
    subtitle: 'Vitas - The 7th Element',
    videoId: 'tVj0ZTS4WF4',
    color: 'from-purple-600 to-pink-600',
    border: 'border-purple-500/40',
    badge: 'Legend'
  },
  {
    id: 'airhorn',
    title: 'MLG Airhorn 🚨',
    subtitle: 'Loud Alert SFX',
    videoId: '2Z4m4lnjxkY',
    color: 'from-red-600 to-orange-600',
    border: 'border-red-500/40',
    badge: 'Loud'
  },
  {
    id: 'ghost',
    title: 'Spooky Screams 👻',
    subtitle: 'Haunted Ambience',
    videoId: 'qZwtD2PqA_E',
    color: 'from-purple-900 to-indigo-950',
    border: 'border-purple-500/40',
    badge: 'House Sitter'
  },
  {
    id: 'curb',
    title: 'Curb Theme 🎺',
    subtitle: 'Awkward Moments',
    videoId: 'Ag1o3ko3jWA',
    color: 'from-emerald-600 to-teal-800',
    border: 'border-emerald-500/40',
    badge: 'Meme'
  },
  {
    id: 'sax',
    title: 'Epic Sax Guy 🎷',
    subtitle: 'Endless Grooves',
    videoId: '8ZcmTl_1ER8',
    color: 'from-pink-500 to-fuchsia-700',
    border: 'border-pink-500/40',
    badge: '10 Hours'
  },
  {
    id: 'cena',
    title: 'John Cena 💥',
    subtitle: 'AND HIS NAME IS...',
    videoId: '-cZ7ndjhhzk',
    color: 'from-blue-600 to-cyan-600',
    border: 'border-blue-500/40',
    badge: 'Banger'
  },
  {
    id: 'dramatic',
    title: 'Dramatic Look 🍿',
    subtitle: 'Dramatic Chipmunk',
    videoId: 'a1Y73sPHKxw',
    color: 'from-amber-600 to-yellow-700',
    border: 'border-amber-500/40',
    badge: 'Shock'
  }
];

class SoundboardManager {
  constructor() {
    this.ensureDataDir();
    this.loadPresets();
  }

  ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  extractVideoId(input) {
    if (!input) return '';
    let str = input.trim();
    if (str.includes('v=')) {
      str = str.split('v=')[1].split('&')[0];
    } else if (str.includes('youtu.be/')) {
      str = str.split('youtu.be/')[1].split('?')[0];
    } else if (str.includes('shorts/')) {
      str = str.split('shorts/')[1].split('?')[0];
    }
    return str;
  }

  loadPresets() {
    try {
      if (fs.existsSync(SOUNDBOARD_FILE)) {
        const raw = fs.readFileSync(SOUNDBOARD_FILE, 'utf8');
        this.presets = JSON.parse(raw);
      } else {
        this.presets = DEFAULT_PRESETS;
        this.savePresets();
      }
    } catch (e) {
      console.error('Error loading soundboard presets:', e);
      this.presets = DEFAULT_PRESETS;
    }
  }

  savePresets() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(SOUNDBOARD_FILE, JSON.stringify(this.presets, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving soundboard presets:', e);
    }
  }

  getAll() {
    return this.presets;
  }

  add(preset) {
    const videoId = this.extractVideoId(preset.videoId || preset.url);
    const newPreset = {
      id: preset.id || `sb_${Date.now()}`,
      title: preset.title || 'Custom Video',
      subtitle: preset.subtitle || 'Custom Preset',
      videoId: videoId,
      color: preset.color || 'from-purple-600 to-indigo-700',
      border: preset.border || 'border-purple-500/40',
      badge: preset.badge || 'Custom'
    };

    this.presets.push(newPreset);
    this.savePresets();
    return newPreset;
  }

  update(id, updatedData) {
    const idx = this.presets.findIndex(p => p.id === id);
    if (idx === -1) return null;

    if (updatedData.videoId || updatedData.url) {
      updatedData.videoId = this.extractVideoId(updatedData.videoId || updatedData.url);
    }

    this.presets[idx] = {
      ...this.presets[idx],
      ...updatedData
    };
    this.savePresets();
    return this.presets[idx];
  }

  delete(id) {
    this.presets = this.presets.filter(p => p.id !== id);
    this.savePresets();
    return true;
  }

  reset() {
    this.presets = DEFAULT_PRESETS;
    this.savePresets();
    return this.presets;
  }
}

module.exports = new SoundboardManager();
