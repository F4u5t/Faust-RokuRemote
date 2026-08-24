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
  AlertTriangle
} from 'lucide-react';

export default function WebLauncherModal({
  bookmarks,
  onLaunchUrl,
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
    <div className="w-full space-y-5 py-2">
      
      {/* Header & Explanation */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              Roku Web Browser & App Launcher
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Launch your custom web apps, Home Assistant dashboards, or web pages directly onto your Roku TV screen.
            </p>
          </div>
        </div>
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

          {/* Status Notification */}
          {statusMessage && (
            <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === 'success' ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' :
              statusMessage.type === 'error' ? 'bg-red-950/40 text-red-300 border border-red-500/30' :
              'bg-purple-950/40 text-purple-300 border border-purple-500/30'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4" />}
              <span className="truncate">{statusMessage.text}</span>
            </div>
          )}

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
