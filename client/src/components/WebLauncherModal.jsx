import React, { useState } from 'react';
import {
  Globe,
  ExternalLink,
  Plus,
  Trash2,
  Tv,
  HelpCircle,
  PlayCircle,
  LayoutDashboard,
  Video,
  MonitorPlay,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Volume2,
  Sparkles,
  Radio
} from 'lucide-react';

const PRANK_PRESETS = [
  {
    id: 'rickroll',
    title: 'Rick Roll 🕺',
    subtitle: 'Never Gonna Give You Up',
    videoId: 'dQw4w9WgXcQ',
    gradient: 'from-amber-500 to-rose-600',
    border: 'border-amber-500/40',
    badge: 'Classic'
  },
  {
    id: 'ghost',
    title: 'Spooky Screams 👻',
    subtitle: 'Haunted Ambience',
    videoId: 'qZwtD2PqA_E',
    gradient: 'from-purple-600 to-indigo-900',
    border: 'border-purple-500/40',
    badge: 'House Sitter'
  },
  {
    id: 'curb',
    title: 'Curb Theme 🎺',
    subtitle: 'Awkward Timing',
    videoId: 'Ag1o3ko3jWA',
    gradient: 'from-emerald-600 to-teal-800',
    border: 'border-emerald-500/40',
    badge: 'Meme'
  },
  {
    id: 'sax',
    title: 'Epic Sax Guy 🎷',
    subtitle: 'Endless Grooves',
    videoId: '8ZcmTl_1ER8',
    gradient: 'from-pink-500 to-fuchsia-700',
    border: 'border-pink-500/40',
    badge: '10 Hours'
  },
  {
    id: 'airhorn',
    title: 'MLG Airhorn 🚨',
    subtitle: 'Loud Alert',
    videoId: '2Z4m4lnjxkY',
    gradient: 'from-red-600 to-orange-600',
    border: 'border-red-500/40',
    badge: 'Loud'
  },
  {
    id: 'cena',
    title: 'John Cena 💥',
    subtitle: 'AND HIS NAME IS...',
    videoId: '-cZ7ndjhhzk',
    gradient: 'from-blue-600 to-cyan-600',
    border: 'border-blue-500/40',
    badge: 'Banger'
  },
  {
    id: 'dramatic',
    title: 'Dramatic Look 🍿',
    subtitle: 'Dramatic Chipmunk',
    videoId: 'a1Y73sPHKxw',
    gradient: 'from-amber-600 to-yellow-700',
    border: 'border-amber-500/40',
    badge: 'Shock'
  },
  {
    id: 'careless',
    title: 'Careless Whisper 🎷',
    subtitle: 'Smooth Sax Solo',
    videoId: 'GaoLU6zKaws',
    gradient: 'from-rose-600 to-purple-800',
    border: 'border-rose-500/40',
    badge: 'Romance'
  }
];

export default function WebLauncherModal({
  bookmarks,
  onLaunchUrl,
  onPlayVideo,
  onAddBookmark,
  onDeleteBookmark,
  disabled
}) {
  const [targetUrl, setTargetUrl] = useState('');
  const [strategy, setStrategy] = useState('dev_channel');
  const [customAppId, setCustomAppId] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newStrategy, setNewStrategy] = useState('dev_channel');
  const [newDescription, setNewDescription] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  // Instant Video Launcher state
  const [customVideoInput, setCustomVideoInput] = useState('');
  const [boostVolume, setBoostVolume] = useState(true);
  const [isFiring, setIsFiring] = useState(false);

  const handleFireVideo = async (videoIdOrUrl, label = 'Video') => {
    if (disabled || !videoIdOrUrl) return;
    setIsFiring(true);
    setStatusMessage({ type: 'info', text: `Blasting "${label}" to Roku TV...` });
    try {
      if (onPlayVideo) {
        await onPlayVideo(videoIdOrUrl, boostVolume);
      }
      setStatusMessage({ type: 'success', text: `Playing "${label}" on TV!` });
      setTimeout(() => setStatusMessage(null), 4500);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to play video' });
    } finally {
      setIsFiring(false);
    }
  };

  const handleCustomVideoSubmit = (e) => {
    e.preventDefault();
    if (!customVideoInput.trim()) return;
    handleFireVideo(customVideoInput, 'Custom Video');
    setCustomVideoInput('');
  };

  const handleDirectLaunch = async (e) => {
    e.preventDefault();
    if (!targetUrl.trim() || disabled) return;

    setStatusMessage({ type: 'info', text: 'Launching web app on Roku...' });
    try {
      await onLaunchUrl(targetUrl, strategy, customAppId);
      setStatusMessage({ type: 'success', text: `Launched ${targetUrl} via ${strategy}!` });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to launch URL' });
    }
  };

  const handleBookmarkLaunch = async (bm) => {
    if (disabled) return;
    setStatusMessage({ type: 'info', text: `Launching ${bm.title}...` });
    try {
      await onLaunchUrl(bm.url, bm.strategy || 'dev_channel', bm.customAppId || '');
      setStatusMessage({ type: 'success', text: `Launched ${bm.title}!` });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to launch URL' });
    }
  };

  const handleCreateBookmark = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    await onAddBookmark({
      title: newTitle,
      url: newUrl,
      strategy: newStrategy,
      description: newDescription
    });

    setNewTitle('');
    setNewUrl('');
    setNewDescription('');
    setShowAddForm(false);
  };

  return (
    <div className="touch-scroll-panel max-h-[550px] xl:max-h-[575px] overflow-y-auto pr-1 w-full space-y-4">
      
      {/* 🎭 Instant Video & Prank Soundboard Banner */}
      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/30 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-400/30 shadow-inner">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100">Instant Video & Prank Soundboard 🎭</h2>
                <span className="px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 text-[10px] font-bold">1-Click Blast</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Instantly wake your TV and auto-play any YouTube video (Rick Roll, jump scares, memes, or custom URLs).
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs text-slate-300 hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={boostVolume}
              onChange={(e) => setBoostVolume(e.target.checked)}
              className="accent-purple-500 w-3.5 h-3.5 rounded"
            />
            <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] font-medium">Set Volume (15)</span>
          </label>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className={`p-2.5 mb-3 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' :
            statusMessage.type === 'error' ? 'bg-red-950/60 text-red-300 border border-red-500/40' :
            'bg-purple-950/60 text-purple-300 border border-purple-500/40'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4" />}
            <span className="truncate">{statusMessage.text}</span>
          </div>
        )}

        {/* 1-Click Prank Preset Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5">
          {PRANK_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleFireVideo(p.videoId, p.title)}
              disabled={disabled || isFiring}
              className={`group relative overflow-hidden text-left p-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 border ${p.border} hover:border-purple-400/60 transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-95 disabled:opacity-50`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-slate-200">
                  {p.badge}
                </span>
                <PlayCircle className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
              </div>
              <div className="font-bold text-xs text-slate-100 group-hover:text-amber-300 truncate transition-colors">
                {p.title}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {p.subtitle}
              </div>
            </button>
          ))}
        </div>

        {/* Custom YouTube URL or ID Launcher */}
        <form onSubmit={handleCustomVideoSubmit} className="mt-3 flex gap-2">
          <input
            type="text"
            value={customVideoInput}
            onChange={(e) => setCustomVideoInput(e.target.value)}
            placeholder="Paste any YouTube URL or Video ID (e.g. https://youtu.be/dQw4w9WgXcQ)"
            disabled={disabled || isFiring}
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!customVideoInput.trim() || disabled || isFiring}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-purple-900/30 transition-all disabled:opacity-40"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Blast on TV</span>
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Direct Launch Input Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 h-fit">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
            <span>Launch Web URL Instantly</span>
          </div>

          <form onSubmit={handleDirectLaunch} className="space-y-3">
            <div>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://my-custom-dashboard.com"
                disabled={disabled}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Launch Strategy</label>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="dev_channel">Sideloaded Dev Channel (dev)</option>
                  <option value="browser_app">Store Web Browser Channel</option>
                  <option value="play_on_roku">Play on Roku (Media/Stream 15985)</option>
                </select>
              </div>

              {strategy === 'browser_app' && (
                <div className="w-full sm:w-32">
                  <label className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Browser App ID</label>
                  <input
                    type="text"
                    value={customAppId}
                    onChange={(e) => setCustomAppId(e.target.value)}
                    placeholder="580456"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!targetUrl || disabled}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all disabled:opacity-40"
            >
              <MonitorPlay className="w-4 h-4" />
              <span>Launch on Roku TV</span>
            </button>
          </form>

          {/* Information Box on Roku Web Strategies */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3 text-xs text-slate-400 space-y-1.5 mt-3">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
              <span>Launch Modes Explained:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] leading-relaxed text-slate-400">
              <li><strong>Dev Channel:</strong> Sideloaded BrightScript SceneGraph web viewer channel.</li>
              <li><strong>Store Browser:</strong> Deep links into Store browsers (BrowseHere, Web Browser X).</li>
              <li><strong>Media Stream:</strong> Direct video playback URL via Roku Channel 15985.</li>
            </ul>
          </div>
        </div>

        {/* Saved Web App Bookmarks Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
              <span>Saved Web Apps & Dashboards</span>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel' : 'Add Web App'}</span>
            </button>
          </div>

          {/* Add Web App Bookmark Drawer */}
          {showAddForm && (
            <form onSubmit={handleCreateBookmark} className="bg-slate-900 border border-purple-500/40 rounded-2xl p-4 space-y-3 shadow-xl">
              <div className="text-xs font-bold text-purple-300">New Web App Bookmark</div>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="App Name (e.g., Home Dashboard)"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://your-web-app.com"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Short description (optional)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-medium text-xs hover:bg-purple-500 shadow-md shadow-purple-600/20"
                >
                  Save Bookmark
                </button>
              </div>
            </form>
          )}

          {/* Bookmarks List */}
          <div className="grid grid-cols-1 gap-2.5">
            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="group bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-3 flex items-center justify-between transition-all shadow-md"
              >
                <div
                  onClick={() => handleBookmarkLaunch(bm)}
                  className="flex items-center gap-3 cursor-pointer flex-1 overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform flex-shrink-0">
                    {bm.strategy === 'play_on_roku' ? <Video className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-sm font-semibold text-slate-100 group-hover:text-purple-300 transition-colors truncate">
                      {bm.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs font-mono">
                      {bm.url}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 pl-2">
                  <button
                    onClick={() => handleBookmarkLaunch(bm)}
                    disabled={disabled}
                    title="Launch on TV"
                    className="p-2 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white transition-colors"
                  >
                    <MonitorPlay className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteBookmark(bm.id)}
                    title="Delete bookmark"
                    className="p-2 rounded-lg hover:bg-red-950/40 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
