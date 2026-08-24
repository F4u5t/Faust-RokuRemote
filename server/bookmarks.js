const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const BOOKMARKS_FILE = path.join(DATA_DIR, 'bookmarks.json');

const DEFAULT_BOOKMARKS = [
  {
    id: 'bookmark-1',
    title: 'Home Assistant Dashboard',
    url: 'http://homeassistant.local:8123',
    icon: 'layout-dashboard',
    strategy: 'dev_channel',
    description: 'Smart home control and monitoring dashboard'
  },
  {
    id: 'bookmark-2',
    title: 'Custom TV Dashboard',
    url: 'https://weather.com',
    icon: 'globe',
    strategy: 'dev_channel',
    description: 'Weather and live status widgets'
  },
  {
    id: 'bookmark-3',
    title: 'Media Stream / Web Video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    icon: 'video',
    strategy: 'play_on_roku',
    description: 'Direct video/stream player on Roku (Channel 15985)'
  }
];

class BookmarksManager {
  constructor() {
    this.ensureFileExists();
  }

  ensureFileExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BOOKMARKS_FILE)) {
      fs.writeFileSync(BOOKMARKS_FILE, JSON.stringify(DEFAULT_BOOKMARKS, null, 2), 'utf-8');
    }
  }

  getAll() {
    try {
      this.ensureFileExists();
      const content = fs.readFileSync(BOOKMARKS_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      return DEFAULT_BOOKMARKS;
    }
  }

  saveAll(bookmarks) {
    this.ensureFileExists();
    fs.writeFileSync(BOOKMARKS_FILE, JSON.stringify(bookmarks, null, 2), 'utf-8');
  }

  add(bookmark) {
    const list = this.getAll();
    const newBookmark = {
      id: `bookmark-${Date.now()}`,
      title: bookmark.title || 'Untitled Web App',
      url: bookmark.url || '',
      icon: bookmark.icon || 'globe',
      strategy: bookmark.strategy || 'dev_channel',
      customAppId: bookmark.customAppId || '',
      description: bookmark.description || ''
    };
    list.push(newBookmark);
    this.saveAll(list);
    return newBookmark;
  }

  delete(id) {
    const list = this.getAll();
    const filtered = list.filter(b => b.id !== id);
    this.saveAll(filtered);
    return true;
  }

  update(id, updatedFields) {
    const list = this.getAll();
    const index = list.findIndex(b => b.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedFields };
      this.saveAll(list);
      return list[index];
    }
    return null;
  }
}

module.exports = new BookmarksManager();
