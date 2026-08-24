import React, { useState } from 'react';
import {
  Tv,
  Plus,
  Trash2,
  ExternalLink,
  GripVertical,
  Search,
  Sparkles,
  Layers,
  Check,
  X,
  Play,
  Cast,
  Link2,
  HelpCircle,
  Radio,
  Share2
} from 'lucide-react';

export default function YouTubeTvPresets({
  presets = [],
  library = [],
  onTunePreset,
  onAddPreset,
  onDeletePreset,
  onReorderPresets,
  disabled
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [customCategory, setCustomCategory] = useState('Sports');
  const [customColor, setCustomColor] = useState('from-red-600 to-red-800');

  // Drag-and-drop state
  const [draggedId, setDraggedId] = useState(null);
  const [isOverTrash, setIsOverTrash] = useState(false);

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnItem = (e, targetId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const sourceIdx = presets.findIndex(p => p.id === draggedId);
    const targetIdx = presets.findIndex(p => p.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const newOrder = [...presets];
    const [moved] = newOrder.splice(sourceIdx, 1);
    newOrder.splice(targetIdx, 0, moved);

    if (onReorderPresets) {
      onReorderPresets(newOrder.map(p => p.id));
    }
    setDraggedId(null);
  };

  const handleDropOnTrash = (e) => {
    e.preventDefault();
    setIsOverTrash(false);
    if (draggedId && onDeletePreset) {
      onDeletePreset(draggedId);
    }
    setDraggedId(null);
  };

  const handleCreateCustom = (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    onAddPreset({
      title: customTitle.trim(),
      slug: customSlug.trim() || customTitle.trim().toLowerCase().replace(/\s+/g, '-'),
      category: customCategory,
      color: customColor
    });

    setCustomTitle('');
    setCustomSlug('');
    setShowAddModal(false);
  };

  /**
   * Opens direct YouTube TV live stream link on tablet
   * Which automatically casts to paired Roku TV
   */
  const handleDirectCastLink = (preset) => {
    const slug = (preset.slug || '').trim();
    let targetUrl;

    if (slug.startsWith('http')) {
      targetUrl = slug;
    } else {
      targetUrl = `https://tv.youtube.com/live/${encodeURIComponent(slug)}`;
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const filteredLibrary = library.filter(item => {
    const q = filterQuery.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q);
  });

  const existingSlugs = new Set(presets.map(p => p.slug));

  return (
    <div className="w-full flex flex-col gap-4">
      
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>YouTube TV Channels & Cast</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/60 font-semibold">
                Tablet & TV Link
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              1-Tap channel shortcuts paired directly to your Roku TV.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowPairingModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-sm"
            title="Link tablet to Roku TV"
          >
            <Link2 className="w-3.5 h-3.5 text-red-400" />
            <span>Pair with TV</span>
          </button>

          <button
            onClick={() => window.open('https://tv.youtube.com/live', '_blank')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-sm"
            title="Open full YouTube TV Live Guide"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Live Guide</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-900/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Channels</span>
          </button>
        </div>
      </div>

      {/* Pairing Info Banner */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-300">
          <Cast className="w-4 h-4 text-red-400 shrink-0" />
          <span>
            <strong>Pro-Tip:</strong> Pair your Galaxy Tab once via <strong>Link with TV Code</strong>, then tap <strong>"Cast / Watch"</strong> on any channel below to stream instantly to the TV!
          </span>
        </div>
        <button
          onClick={() => setShowPairingModal(true)}
          className="text-red-400 hover:text-red-300 font-bold underline shrink-0 cursor-pointer"
        >
          Setup Guide
        </button>
      </div>

      {/* Trash Drop Zone (shown when dragging) */}
      {draggedId && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsOverTrash(true);
          }}
          onDragLeave={() => setIsOverTrash(false)}
          onDrop={handleDropOnTrash}
          className={`w-full p-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 transition-all duration-200 ${
            isOverTrash
              ? 'bg-red-950/80 border-red-500 text-red-200 scale-[1.02]'
              : 'bg-red-950/20 border-red-800/40 text-red-400'
          }`}
        >
          <Trash2 className="w-5 h-5 animate-bounce" />
          <span className="text-xs font-bold tracking-wide">
            Drop here to remove channel preset
          </span>
        </div>
      )}

      {/* Main Presets Grid with Touch Scrollbar */}
      <div className="touch-scroll-panel max-h-[calc(100vh-210px)] md:max-h-[calc(100vh-190px)] pr-1.5 pb-2">
        {presets.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 flex flex-col items-center gap-3">
            <Tv className="w-12 h-12 text-slate-600" />
            <div className="font-semibold text-slate-300 text-sm">No YouTube TV presets saved yet</div>
            <p className="text-xs text-slate-500 max-w-sm">
              Add your favorite sports, news, and entertainment networks to tune instantly with one touch!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md"
            >
              Browse Channel Library
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {presets.map((preset) => {
              return (
                <div
                  key={preset.id}
                  draggable={!disabled}
                  onDragStart={(e) => handleDragStart(e, preset.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnItem(e, preset.id)}
                  className="group relative bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-red-500/50 rounded-2xl p-3 shadow-lg transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between overflow-hidden"
                >
                  {/* Visual Gradient Background Accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${preset.color || 'from-red-600 to-red-800'}`} />

                  {/* Top Tile Row: Category & Drag Handle */}
                  <div className="flex items-center justify-between mb-2 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
                      {preset.category || 'Live'}
                    </span>
                    <div
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-slate-300 transition-opacity cursor-grab active:cursor-grabbing"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Center Badge / Channel Name */}
                  <div
                    className="my-2 flex flex-col items-center justify-center text-center cursor-pointer"
                    onClick={() => handleDirectCastLink(preset)}
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${preset.color || 'from-red-600 to-red-900'} text-white font-black text-sm flex items-center justify-center shadow-md mb-2 border border-white/10 group-hover:shadow-red-900/40`}>
                      {preset.title.slice(0, 4)}
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-red-300 transition-colors line-clamp-1">
                      {preset.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {preset.slug}
                    </span>
                  </div>

                  {/* Bottom Action: Cast Button & Launch on TV */}
                  <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => handleDirectCastLink(preset)}
                      className="flex-1 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                      title="Open stream & Cast to Roku TV"
                    >
                      <Cast className="w-3 h-3" />
                      <span>Cast</span>
                    </button>

                    <button
                      onClick={() => onTunePreset(preset)}
                      disabled={disabled}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                      title="Launch YouTube TV app on TV"
                    >
                      <Tv className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeletePreset(preset.id)}
                      disabled={disabled}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      title="Remove Preset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2-Step Pairing Assistant Modal */}
      {showPairingModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-base">
                <Link2 className="w-5 h-5 text-red-400" />
                <span>Pair Galaxy Tab to Roku TV</span>
              </div>
              <button
                onClick={() => setShowPairingModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-2xl">
                <p className="font-semibold text-red-300 mb-1">
                  Why pair with TV Code?
                </p>
                <p className="text-slate-300">
                  YouTube TV on Roku has proprietary stream encryption. Pairing your tablet gives you a direct, lag-free link so tapping channels on the tablet plays seamlessly on the big screen!
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-800 text-red-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-slate-700">
                    1
                  </div>
                  <div>
                    <strong>On your Roku TV</strong>: Open YouTube TV &rarr; Click your profile icon &rarr; <strong>Settings</strong> &rarr; <strong>Link with TV Code</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-800 text-red-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-slate-700">
                    2
                  </div>
                  <div>
                    <strong>On this tablet</strong>: Click the button below and type the 12-digit code shown on the TV screen.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    window.open('https://tv.youtube.com/pair', '_blank');
                  }}
                  className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open YouTube TV Pairing Page (tv.youtube.com/pair)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Browse Channel Presets Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-bold text-slate-100">Add YouTube TV Channel Presets</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-6">
              
              {/* Popular Networks Library */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Quick Pick Popular Networks
                  </h4>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search channels (e.g. ESPN, News)..."
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                      className="w-full sm:w-56 pl-8 pr-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {filteredLibrary.map((item) => {
                    const isAdded = existingSlugs.has(item.slug);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 bg-slate-800/60 border border-slate-700/40 rounded-xl hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.color} text-white font-black text-[10px] flex items-center justify-center shrink-0`}>
                            {item.title.slice(0, 2)}
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-xs font-bold text-slate-200 truncate">{item.title}</div>
                            <div className="text-[10px] text-slate-400">{item.category}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (!isAdded) onAddPreset(item);
                          }}
                          disabled={isAdded}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            isAdded
                              ? 'bg-slate-700/50 text-slate-400 cursor-default'
                              : 'bg-red-600 hover:bg-red-500 text-white shadow-sm'
                          }`}
                        >
                          {isAdded ? 'Added' : '+ Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Channel Form */}
              <div className="border-t border-slate-800 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Or Create Custom Channel / Slug
                </h4>
                <form onSubmit={handleCreateCustom} className="space-y-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Channel Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Golf HD or Local CBS"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-red-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Channel Slug or URL
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. espn or tv.youtube.com/live/..."
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Category
                      </label>
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-red-500"
                      >
                        <option value="Sports">Sports</option>
                        <option value="News">News</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Lifestyle">Lifestyle</option>
                        <option value="Kids">Kids</option>
                        <option value="Movies">Movies</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Theme Color
                      </label>
                      <select
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-red-500"
                      >
                        <option value="from-red-600 to-red-800">Red (Sports/News)</option>
                        <option value="from-blue-600 to-blue-800">Blue (Fox/News)</option>
                        <option value="from-emerald-600 to-teal-800">Emerald (Golf/Nature)</option>
                        <option value="from-purple-600 to-indigo-800">Purple (Entertainment)</option>
                        <option value="from-amber-600 to-orange-800">Amber (Movies/Lifestyle)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    + Save Custom Preset
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
