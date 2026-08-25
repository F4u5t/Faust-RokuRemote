import React, { useState, useEffect } from 'react';
import {
  Play,
  Search,
  Sparkles,
  RefreshCw,
  Layers,
  Star,
  GripVertical,
  Trash2,
  PlusCircle
} from 'lucide-react';

export default function AppsGrid({
  apps,
  activeApp,
  onLaunchApp,
  onRefreshApps,
  isLoading,
  disabled,
  activeDeviceId
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [draggedAppId, setDraggedAppId] = useState(null);
  const [dragSource, setDragSource] = useState(null); // 'favorites' | 'all'
  const [isOverFavoritesZone, setIsOverFavoritesZone] = useState(false);
  const [isOverRemoveZone, setIsOverRemoveZone] = useState(false);

  // Storage key
  const storageKey = `faust_roku_favorites_${activeDeviceId || 'default'}`;

  // Default popular keywords to initialize favorites if none saved
  const defaultKeywords = ['youtube', 'netflix', 'prime', 'hulu', 'disney', 'max', 'roku', 'apple'];

  // Initialize or load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setFavoriteIds(JSON.parse(saved));
      } else if (apps.length > 0) {
        const initialFavs = apps
          .filter((a) => defaultKeywords.some((kw) => a.name.toLowerCase().includes(kw)))
          .map((a) => String(a.id));
        setFavoriteIds(initialFavs);
        localStorage.setItem(storageKey, JSON.stringify(initialFavs));
      }
    } catch (e) {
      console.warn('Error loading favorites:', e);
    }
  }, [storageKey, apps.length]);

  const saveFavorites = (newIds) => {
    setFavoriteIds(newIds);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newIds));
    } catch (e) {
      console.warn('Error saving favorites:', e);
    }
  };

  const toggleFavorite = (appId, e) => {
    if (e) e.stopPropagation();
    const idStr = String(appId);
    if (favoriteIds.includes(idStr)) {
      saveFavorites(favoriteIds.filter((id) => id !== idStr));
    } else {
      saveFavorites([...favoriteIds, idStr]);
    }
  };

  const handleDragStart = (appId, source, e) => {
    setDraggedAppId(String(appId));
    setDragSource(source);
    e.dataTransfer.setData('text/plain', String(appId));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedAppId(null);
    setDragSource(null);
    setIsOverFavoritesZone(false);
    setIsOverRemoveZone(false);
  };

  const handleFavoritesDrop = (e, targetIndex = null) => {
    e.preventDefault();
    setIsOverFavoritesZone(false);
    if (!draggedAppId) return;

    let updated = [...favoriteIds];
    if (dragSource === 'favorites') {
      const currentIndex = updated.indexOf(draggedAppId);
      if (currentIndex !== -1) {
        updated.splice(currentIndex, 1);
        if (targetIndex !== null && targetIndex >= 0) {
          updated.splice(targetIndex, 0, draggedAppId);
        } else {
          updated.push(draggedAppId);
        }
      }
    } else {
      if (!updated.includes(draggedAppId)) {
        if (targetIndex !== null && targetIndex >= 0) {
          updated.splice(targetIndex, 0, draggedAppId);
        } else {
          updated.push(draggedAppId);
        }
      }
    }
    saveFavorites(updated);
    setDraggedAppId(null);
  };

  const handleRemoveDrop = (e) => {
    e.preventDefault();
    setIsOverRemoveZone(false);
    if (!draggedAppId) return;

    if (dragSource === 'favorites') {
      saveFavorites(favoriteIds.filter((id) => id !== draggedAppId));
    }
    setDraggedAppId(null);
  };

  const favoriteApps = favoriteIds
    .map((id) => apps.find((a) => String(a.id) === String(id)))
    .filter(Boolean);

  const filteredApps = apps.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-2.5">
      
      {/* Search and Refresh Bar (Sticky at top of channels workspace) */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search installed channels..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <button
          onClick={onRefreshApps}
          disabled={isLoading || disabled}
          title="Reload installed apps from Roku"
          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 disabled:opacity-40 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
        </button>
      </div>

      {/* Touch-Friendly Scrollable Channels Workspace Container (Shorter to eliminate browser vertical scroll) */}
      <div className="touch-scroll-panel max-h-[390px] sm:max-h-[410px] md:max-h-[420px] lg:max-h-[430px] xl:max-h-[450px] space-y-3 pr-2 pb-2 overflow-y-auto">
        
        {/* Quick Favorites Section & Drop Zone */}
        {!searchQuery && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsOverFavoritesZone(true);
            }}
            onDragLeave={() => setIsOverFavoritesZone(false)}
            onDrop={(e) => handleFavoritesDrop(e)}
            className={`rounded-2xl p-2.5 sm:p-3 transition-all ${
              isOverFavoritesZone
                ? 'bg-purple-950/40 border-2 border-dashed border-purple-400 shadow-xl shadow-purple-900/30'
                : 'bg-slate-900/70 border border-slate-800 shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Favorites & Quick Launch</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Drag channels here to pin
              </span>
            </div>

            {favoriteApps.length === 0 ? (
              <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 text-center text-slate-400">
                <PlusCircle className="w-5 h-5 mx-auto mb-1 text-purple-400/80" />
                <p className="text-xs font-medium">No favorite channels pinned yet.</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Drag any channel from below or tap the ⭐ icon to add it.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-2">
                {favoriteApps.map((app, index) => {
                  const isActive = activeApp && String(activeApp.id) === String(app.id);
                  return (
                    <div
                      key={`fav-${app.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(app.id, 'favorites', e)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.stopPropagation();
                        handleFavoritesDrop(e, index);
                      }}
                      className={`group relative flex flex-col items-center bg-slate-800/80 hover:bg-slate-700/80 border rounded-xl p-1.5 transition-all shadow cursor-grab active:cursor-grabbing ${
                        isActive ? 'border-emerald-500/60 bg-emerald-950/30' : 'border-slate-700/60 hover:border-purple-500/50'
                      }`}
                    >
                      {/* Star Unpin Button */}
                      <button
                        onClick={(e) => toggleFavorite(app.id, e)}
                        title="Remove from favorites"
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/80 hover:bg-red-950 text-amber-400 hover:text-red-400 transition-colors z-10"
                      >
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                      </button>

                      {/* Launch Button */}
                      <button
                        onClick={() => onLaunchApp(app.id)}
                        disabled={disabled}
                        className="w-full flex flex-col items-center"
                      >
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center mb-1 shadow-inner">
                          <img
                            src={app.iconUrl}
                            alt={app.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-medium text-slate-200 truncate w-full text-center">
                          {app.name}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Drag to Remove Drop Zone */}
            {draggedAppId && dragSource === 'favorites' && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsOverRemoveZone(true);
                }}
                onDragLeave={() => setIsOverRemoveZone(false)}
                onDrop={handleRemoveDrop}
                className={`mt-2 border-2 border-dashed rounded-xl p-2.5 text-center transition-all ${
                  isOverRemoveZone
                    ? 'bg-red-950/60 border-red-500 text-red-300 scale-102'
                    : 'bg-slate-950/50 border-red-900/40 text-red-400/80'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Drop here to remove from Favorites</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* All Installed Channels Grid */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>All Installed Channels ({filteredApps.length})</span>
            </div>
            <span className="text-[10px] text-slate-500 lowercase">
              drag or tap ⭐ to pin
            </span>
          </div>

          {filteredApps.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
              {apps.length === 0 ? (
                <div>
                  <p className="text-xs font-medium mb-1.5">No apps loaded.</p>
                  <p className="text-[11px] text-slate-500 mb-2.5">Ensure your Roku TV is turned on and connected.</p>
                  <button
                    onClick={onRefreshApps}
                    className="px-3 py-1.5 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-medium hover:bg-purple-600/40 transition-colors"
                  >
                    Fetch Installed Apps
                  </button>
                </div>
              ) : (
                <p className="text-xs">No channels match "{searchQuery}"</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-2.5">
              {filteredApps.map((app) => {
                const isFav = favoriteIds.includes(String(app.id));
                const isActive = activeApp && String(activeApp.id) === String(app.id);

                return (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={(e) => handleDragStart(app.id, 'all', e)}
                    onDragEnd={handleDragEnd}
                    className={`group relative flex flex-col items-center bg-slate-900/80 hover:bg-slate-800 border rounded-xl p-2 transition-all text-center shadow-md cursor-grab active:cursor-grabbing ${
                      isActive ? 'border-emerald-500/60 bg-emerald-950/20' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Star Pin/Unpin Toggle */}
                    <button
                      onClick={(e) => toggleFavorite(app.id, e)}
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      className={`absolute top-1 right-1 p-0.5 rounded-full transition-colors z-10 ${
                        isFav
                          ? 'bg-amber-950/80 text-amber-400'
                          : 'bg-slate-950/70 text-slate-500 hover:text-amber-400 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>

                    {/* Active Indicator */}
                    {isActive && (
                      <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm" />
                    )}

                    {/* Click to Launch */}
                    <button
                      onClick={() => onLaunchApp(app.id)}
                      disabled={disabled}
                      className="w-full flex flex-col items-center"
                    >
                      <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center mb-1 shadow">
                        <img
                          src={app.iconUrl}
                          alt={app.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-200 line-clamp-1 w-full">
                        {app.name}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
