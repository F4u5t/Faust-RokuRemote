import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Edit2,
  RotateCcw,
  X
} from 'lucide-react';

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
  const [showAddBookmarkForm, setShowAddBookmarkForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newStrategy, setNewStrategy] = useState('dev_channel');
  const [newDescription, setNewDescription] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  // Soundboard state
  const [soundboardPresets, setSoundboardPresets] = useState([]);
  const [customVideoInput, setCustomVideoInput] = useState('');
  const [boostVolume, setBoostVolume] = useState(true);
  const [isFiring, setIsFiring] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const [showAddPresetForm, setShowAddPresetForm] = useState(false);
  
  // New / Edit preset form fields
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formVideoId, setFormVideoId] = useState('');
  const [formBadge, setFormBadge] = useState('');

  const fetchSoundboard = async () => {
    try {
      const res = await axios.get('/api/soundboard');
      if (res.data && res.data.success) {
        setSoundboardPresets(res.data.presets || []);
      }
    } catch (e) {
      console.warn('Failed to load soundboard presets:', e);
    }
  };

  useEffect(() => {
    fetchSoundboard();
  }, []);

  const handleFireVideo = async (videoIdOrUrl, label = 'Video') => {
    if (disabled || !videoIdOrUrl) return;
    setIsFiring(true);
    setStatusMessage({ type: 'info', text: `Waking TV & playing "${label}"...` });
    try {
      if (onPlayVideo) {
        await onPlayVideo(videoIdOrUrl, boostVolume);
      }
      setStatusMessage({ type: 'success', text: `Playing "${label}" on TV (Vol: 15)!` });
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

  const openAddPresetForm = () => {
    setEditingPreset(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormVideoId('');
    setFormBadge('Custom');
    setShowAddPresetForm(true);
  };

  const openEditPresetForm = (p, e) => {
    e.stopPropagation();
    setEditingPreset(p);
    setFormTitle(p.title || '');
    setFormSubtitle(p.subtitle || '');
    setFormVideoId(p.videoId || '');
    setFormBadge(p.badge || 'Meme');
    setShowAddPresetForm(true);
  };

  const handleSavePreset = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formVideoId.trim()) return;

    try {
      if (editingPreset) {
        const res = await axios.put(`/api/soundboard/${editingPreset.id}`, {
          title: formTitle,
          subtitle: formSubtitle,
          videoId: formVideoId,
          badge: formBadge
        });
        if (res.data.success) {
          setSoundboardPresets(res.data.presets);
          setStatusMessage({ type: 'success', text: `Updated "${formTitle}"!` });
        }
      } else {
        const res = await axios.post('/api/soundboard', {
          title: formTitle,
          subtitle: formSubtitle,
          videoId: formVideoId,
          badge: formBadge
        });
        if (res.data.success) {
          setSoundboardPresets(res.data.presets);
          setStatusMessage({ type: 'success', text: `Added "${formTitle}"!` });
        }
      }
      setShowAddPresetForm(false);
      setEditingPreset(null);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save preset' });
    }
  };

  const handleDeletePreset = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await axios.delete(`/api/soundboard/${id}`);
      if (res.data.success) {
        setSoundboardPresets(res.data.presets);
      }
    } catch (err) {
      console.error('Failed to delete preset:', err);
    }
  };

  const handleResetPresets = async () => {
    if (!window.confirm('Reset all soundboard presets to default list?')) return;
    try {
      const res = await axios.post('/api/soundboard/reset');
      if (res.data.success) {
        setSoundboardPresets(res.data.presets);
        setStatusMessage({ type: 'success', text: 'Reset soundboard to defaults!' });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to reset presets:', err);
    }
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
    setShowAddBookmarkForm(false);
  };

  return (
    <div className="touch-scroll-panel max-h-[480px] lg:max-h-[500px] xl:max-h-[520px] 2xl:max-h-[550px] overflow-y-auto pr-1 w-full space-y-3.5">
      
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
                <span className="px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 text-[10px] font-bold">Auto TV Wake & Play</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Wakes TV from sleep, un-mutes, and auto-plays YouTube videos or memes on command.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openAddPresetForm}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-purple-400" />
              <span>Add Button</span>
            </button>

            <button
              onClick={handleResetPresets}
              title="Reset presets to default list"
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs text-slate-300 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={boostVolume}
                onChange={(e) => setBoostVolume(e.target.checked)}
                className="accent-purple-500 w-3.5 h-3.5 rounded"
              />
              <Volume2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] font-medium">Auto Vol (15)</span>
            </label>
          </div>
        </div>

        {/* Add/Edit Preset Drawer */}
        {showAddPresetForm && (
          <form onSubmit={handleSavePreset} className="bg-slate-950/90 border border-purple-500/40 rounded-2xl p-4 mb-3 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Edit2 className="w-3.5 h-3.5" />
                <span>{editingPreset ? `Edit Button: ${editingPreset.title}` : 'Add New Instant Video Button'}</span>
              </div>
              <button
                type="button"
                onClick={() => { setShowAddPresetForm(false); setEditingPreset(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-medium block mb-1 uppercase">Button Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Weird Singing Guy 👽"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-medium block mb-1 uppercase">Subtitle / Artist</label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="e.g. Vitas - 7th Element"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-400 font-medium block mb-1 uppercase">YouTube URL or Video ID</label>
                <input
                  type="text"
                  value={formVideoId}
                  onChange={(e) => setFormVideoId(e.target.value)}
                  placeholder="e.g. https://youtu.be/tVj0ZTS4WF4 or tVj0ZTS4WF4"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-medium block mb-1 uppercase">Badge Tag</label>
                <input
                  type="text"
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  placeholder="e.g. Meme, Classic"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setShowAddPresetForm(false); setEditingPreset(null); }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-medium text-xs hover:bg-purple-500 shadow-md shadow-purple-600/20"
              >
                {editingPreset ? 'Save Changes' : 'Create Button'}
              </button>
            </div>
          </form>
        )}

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
          {soundboardPresets.map((p) => (
            <div
              key={p.id}
              onClick={() => handleFireVideo(p.videoId, p.title)}
              className={`group relative overflow-hidden text-left p-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 border ${p.border || 'border-slate-800'} hover:border-purple-400/60 transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer ${disabled || isFiring ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-slate-200">
                  {p.badge || 'Sound'}
                </span>
                
                {/* Actions: Edit & Delete */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => openEditPresetForm(p, e)}
                    title="Edit button video URL or title"
                    className="p-1 rounded bg-slate-800/80 hover:bg-purple-600 text-slate-400 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => handleDeletePreset(p.id, e)}
                    title="Delete button"
                    className="p-1 rounded bg-slate-800/80 hover:bg-red-600 text-slate-400 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="font-bold text-xs text-slate-100 group-hover:text-amber-300 truncate transition-colors">
                {p.title}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {p.subtitle || 'Click to play'}
              </div>
            </div>
          ))}
        </div>

        {/* Custom YouTube URL or ID Launcher */}
        <form onSubmit={handleCustomVideoSubmit} className="mt-3 flex gap-2">
          <input
            type="text"
            value={customVideoInput}
            onChange={(e) => setCustomVideoInput(e.target.value)}
            placeholder="Paste any YouTube URL or Video ID (e.g. https://youtu.be/tVj0ZTS4WF4)"
            disabled={disabled || isFiring}
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors font-mono"
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
              onClick={() => setShowAddBookmarkForm(!showAddBookmarkForm)}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddBookmarkForm ? 'Cancel' : 'Add Web App'}</span>
            </button>
          </div>

          {/* Add Web App Bookmark Drawer */}
          {showAddBookmarkForm && (
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
                  onClick={() => setShowAddBookmarkForm(false)}
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
