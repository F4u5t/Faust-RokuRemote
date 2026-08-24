import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Tv, Grid, Globe, Radio, Columns, Layers } from 'lucide-react';
import DeviceHeader from './components/DeviceHeader';
import RemoteControl from './components/RemoteControl';
import AppsGrid from './components/AppsGrid';
import WebLauncherModal from './components/WebLauncherModal';
import ManualIpModal from './components/ManualIpModal';

export default function App() {
  // Determine initial layout mode based on screen width
  const [activeTab, setActiveTab] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth >= 768 ? 'split' : 'remote';
  });

  const [splitRightTab, setSplitRightTab] = useState('apps'); // 'apps' | 'web'
  const [devices, setDevices] = useState([]);
  const [activeDevice, setActiveDevice] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);

  // App & Status State
  const [apps, setApps] = useState([]);
  const [activeApp, setActiveApp] = useState(null);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);

  // Audio / Live Volume State
  const [audioState, setAudioState] = useState({ volume: 15, muted: false });

  // Load saved device & bookmarks on mount
  useEffect(() => {
    const savedIp = localStorage.getItem('faust_selected_roku_ip');
    const savedName = localStorage.getItem('faust_selected_roku_name');
    if (savedIp) {
      setActiveDevice({ ip: savedIp, name: savedName || `Roku (${savedIp})` });
    }
    fetchBookmarks();
    scanDevices();

    // Auto-switch to split layout if resized to tablet/desktop
    const handleResize = () => {
      if (window.innerWidth >= 1024 && activeTab === 'remote') {
        setActiveTab('split');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // When active device changes, refresh its installed apps, active app & audio state
  useEffect(() => {
    if (activeDevice && activeDevice.ip) {
      localStorage.setItem('faust_selected_roku_ip', activeDevice.ip);
      localStorage.setItem('faust_selected_roku_name', activeDevice.name || '');
      fetchApps(activeDevice.ip);
      fetchActiveApp(activeDevice.ip);
      fetchAudioState(activeDevice.ip);
    }
  }, [activeDevice]);

  // Periodic polling for active app and audio status
  useEffect(() => {
    if (!activeDevice || !activeDevice.ip) return;
    const interval = setInterval(() => {
      fetchActiveApp(activeDevice.ip);
      fetchAudioState(activeDevice.ip);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeDevice]);

  // --- API Calls ---

  const scanDevices = async () => {
    setIsScanning(true);
    try {
      const res = await axios.get('/api/devices');
      if (res.data.success) {
        setDevices(res.data.devices);
        if (res.data.devices.length > 0 && !activeDevice) {
          setActiveDevice(res.data.devices[0]);
        }
      }
    } catch (e) {
      console.warn('Discovery error:', e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleVerifyAndAddDevice = async (ip) => {
    const res = await axios.post('/api/devices/verify', { ip });
    if (res.data.success) {
      const newDev = res.data.device;
      setDevices((prev) => {
        const filtered = prev.filter((d) => d.ip !== newDev.ip);
        return [...filtered, newDev];
      });
      setActiveDevice(newDev);
    }
  };

  const fetchApps = async (ip) => {
    setIsLoadingApps(true);
    try {
      const res = await axios.get(`/api/roku/apps?ip=${encodeURIComponent(ip)}`);
      if (res.data.success) {
        setApps(res.data.apps || []);
      }
    } catch (e) {
      console.warn('Failed to load apps:', e);
    } finally {
      setIsLoadingApps(false);
    }
  };

  const fetchActiveApp = async (ip) => {
    try {
      const res = await axios.get(`/api/roku/active-app?ip=${encodeURIComponent(ip)}`);
      if (res.data.success) {
        setActiveApp(res.data.activeApp);
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchAudioState = async (ip) => {
    try {
      const res = await axios.get(`/api/roku/audio-device?ip=${encodeURIComponent(ip)}`);
      if (res.data && res.data.success && res.data.volume !== null) {
        setAudioState({
          volume: res.data.volume,
          muted: res.data.muted,
          destinations: res.data.destinations
        });
      }
    } catch (e) {
      // ignore
    }
  };

  const handleKeyPress = async (key) => {
    if (!activeDevice) return;
    
    // Optimistic volume state update
    if (key === 'VolumeUp') {
      setAudioState(prev => ({ ...prev, volume: Math.min((prev?.volume ?? 15) + 1, 100), muted: false }));
    } else if (key === 'VolumeDown') {
      setAudioState(prev => ({ ...prev, volume: Math.max((prev?.volume ?? 15) - 1, 0), muted: false }));
    } else if (key === 'VolumeMute') {
      setAudioState(prev => ({ ...prev, muted: !prev.muted }));
    }

    try {
      await axios.post('/api/roku/keypress', { ip: activeDevice.ip, key });
      // Refresh real audio level right after
      if (key.startsWith('Volume')) {
        setTimeout(() => fetchAudioState(activeDevice.ip), 300);
      }
    } catch (e) {
      console.error(`Failed to send key ${key}:`, e);
    }
  };

  const handleSetVolume = async (newVol) => {
    if (!activeDevice) return;
    setAudioState(prev => ({ ...prev, volume: newVol, muted: false }));
    try {
      const res = await axios.post('/api/roku/volume', {
        ip: activeDevice.ip,
        volume: newVol
      });
      if (res.data && res.data.success) {
        setAudioState({
          volume: res.data.volume,
          muted: res.data.muted,
          destinations: res.data.destinations
        });
      }
    } catch (e) {
      console.error('Failed to set volume:', e);
    }
  };

  const handleSendText = async (text) => {
    if (!activeDevice) return;
    try {
      await axios.post('/api/roku/text', { ip: activeDevice.ip, text });
    } catch (e) {
      console.error('Failed to send text:', e);
    }
  };

  const handleLaunchApp = async (appId) => {
    if (!activeDevice) return;
    try {
      await axios.post('/api/roku/launch', { ip: activeDevice.ip, appId });
      setTimeout(() => fetchActiveApp(activeDevice.ip), 1000);
    } catch (e) {
      console.error('Failed to launch app:', e);
    }
  };

  // --- Web Launcher Bookmarks ---

  const fetchBookmarks = async () => {
    try {
      const res = await axios.get('/api/bookmarks');
      if (res.data.success) {
        setBookmarks(res.data.bookmarks);
      }
    } catch (e) {
      console.warn('Failed to fetch bookmarks:', e);
    }
  };

  const handleLaunchUrl = async (url, strategy, customAppId) => {
    if (!activeDevice) throw new Error('Please select or connect a Roku TV first');
    const res = await axios.post('/api/roku/launch-web', {
      ip: activeDevice.ip,
      url,
      launchType: strategy,
      customAppId
    });
    return res.data;
  };

  const handleAddBookmark = async (bookmark) => {
    const res = await axios.post('/api/bookmarks', bookmark);
    if (res.data.success) {
      setBookmarks((prev) => [...prev, res.data.bookmark]);
    }
  };

  const handleDeleteBookmark = async (id) => {
    const res = await axios.delete(`/api/bookmarks/${id}`);
    if (res.data.success) {
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      
      {/* Top Device Header */}
      <DeviceHeader
        devices={devices}
        activeDevice={activeDevice}
        onSelectDevice={setActiveDevice}
        onRefreshDevices={scanDevices}
        onOpenManualModal={() => setManualModalOpen(true)}
        isScanning={isScanning}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeApp={activeApp}
      />

      {/* Limited ECP Mode Warning Banner */}
      {activeDevice && activeDevice.ecpMode === 'limited' && (
        <div className="max-w-7xl mx-auto w-full px-4 mt-3">
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs shadow-lg animate-in fade-in">
            <div className="font-bold flex items-center gap-1.5 text-amber-300 mb-1">
              <span>⚠️ Remote Control Blocked by Roku TV Settings</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-200/90 mb-2">
              Your Roku TV's mobile control is set to <strong>"Limited"</strong>, which blocks remote key commands.
            </p>
            <div className="bg-slate-950/60 rounded-xl p-2.5 text-[11px] font-mono text-amber-300 border border-amber-900/40">
              TV Menu: <strong>Settings &gt; System &gt; Advanced system settings &gt; Control by mobile apps &gt; Network access</strong> &rarr; Select <strong>"Permissive"</strong> (or "Default").
            </div>
          </div>
        </div>
      )}

      {/* Main Responsive Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 overflow-y-auto pb-24 md:pb-6">
        
        {/* Split Dashboard View (Tablet / Desktop) */}
        {activeTab === 'split' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Tactile Remote Control with Vertical Volume Panel */}
            <div className="md:col-span-6 lg:col-span-5 sticky top-20 flex justify-center">
              <div className="w-full max-w-md">
                <RemoteControl
                  onKeyPress={handleKeyPress}
                  onSendText={handleSendText}
                  audioState={audioState}
                  onSetVolume={handleSetVolume}
                  disabled={!activeDevice}
                />
              </div>
            </div>

            {/* Right Column: Channels & Web Apps Dashboard Workspace */}
            <div className="md:col-span-6 lg:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-4 shadow-xl">
              
              {/* Right Pane Sub-Tabs */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSplitRightTab('apps')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      splitRightTab === 'apps'
                        ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    <span>Channels & Favorites</span>
                  </button>

                  <button
                    onClick={() => setSplitRightTab('web')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      splitRightTab === 'web'
                        ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Web Apps & Dashboards</span>
                  </button>
                </div>

                <div className="text-xs text-slate-500 font-medium hidden sm:block">
                  {splitRightTab === 'apps' ? `${apps.length} Channels Loaded` : `${bookmarks.length} Bookmarks Saved`}
                </div>
              </div>

              {/* Render Selected Workspace */}
              {splitRightTab === 'apps' ? (
                <AppsGrid
                  apps={apps}
                  activeApp={activeApp}
                  onLaunchApp={handleLaunchApp}
                  onRefreshApps={() => activeDevice && fetchApps(activeDevice.ip)}
                  isLoading={isLoadingApps}
                  disabled={!activeDevice}
                  activeDeviceId={activeDevice?.serialNumber || activeDevice?.ip}
                />
              ) : (
                <WebLauncherModal
                  bookmarks={bookmarks}
                  onLaunchUrl={handleLaunchUrl}
                  onAddBookmark={handleAddBookmark}
                  onDeleteBookmark={handleDeleteBookmark}
                  disabled={!activeDevice}
                />
              )}
            </div>

          </div>
        ) : (
          /* Single Tab Views (Mobile or Full-Width Tablet/Desktop) */
          <div className="w-full">
            {activeTab === 'remote' && (
              <div className="max-w-md mx-auto">
                <RemoteControl
                  onKeyPress={handleKeyPress}
                  onSendText={handleSendText}
                  audioState={audioState}
                  onSetVolume={handleSetVolume}
                  disabled={!activeDevice}
                />
              </div>
            )}

            {activeTab === 'apps' && (
              <div className="w-full">
                <AppsGrid
                  apps={apps}
                  activeApp={activeApp}
                  onLaunchApp={handleLaunchApp}
                  onRefreshApps={() => activeDevice && fetchApps(activeDevice.ip)}
                  isLoading={isLoadingApps}
                  disabled={!activeDevice}
                  activeDeviceId={activeDevice?.serialNumber || activeDevice?.ip}
                />
              </div>
            )}

            {activeTab === 'web' && (
              <div className="w-full">
                <WebLauncherModal
                  bookmarks={bookmarks}
                  onLaunchUrl={handleLaunchUrl}
                  onAddBookmark={handleAddBookmark}
                  onDeleteBookmark={handleDeleteBookmark}
                  disabled={!activeDevice}
                />
              </div>
            )}
          </div>
        )}

      </main>

      {/* Bottom Floating Navigation Bar (Phones / Mobile screens only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-4 py-2 z-40">
        <div className="flex items-center justify-around max-w-md mx-auto">
          
          {/* Remote Tab */}
          <button
            onClick={() => setActiveTab('remote')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
              activeTab === 'remote' ? 'text-purple-400 font-bold bg-purple-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-5 h-5" />
            <span className="text-[11px] tracking-wider uppercase">Remote</span>
          </button>

          {/* Apps Tab */}
          <button
            onClick={() => setActiveTab('apps')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
              activeTab === 'apps' ? 'text-purple-400 font-bold bg-purple-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-[11px] tracking-wider uppercase">Channels</span>
          </button>

          {/* Web Launcher Tab */}
          <button
            onClick={() => setActiveTab('web')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
              activeTab === 'web' ? 'text-purple-400 font-bold bg-purple-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-5 h-5" />
            <span className="text-[11px] tracking-wider uppercase">Web Apps</span>
          </button>
        </div>
      </nav>

      {/* Manual IP Modal */}
      <ManualIpModal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        onVerifyAndAdd={handleVerifyAndAddDevice}
      />

    </div>
  );
}
