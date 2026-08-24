import React, { useState } from 'react';
import {
  Tv,
  RefreshCw,
  Plus,
  ChevronDown,
  Check,
  Wifi,
  AlertCircle,
  LayoutGrid,
  Radio,
  Globe,
  Columns
} from 'lucide-react';

export default function DeviceHeader({
  devices,
  activeDevice,
  onSelectDevice,
  onRefreshDevices,
  onOpenManualModal,
  isScanning,
  activeTab,
  onTabChange,
  activeApp
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-3 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Device Selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700/60 text-left transition-all shadow-sm"
          >
            <div className={`p-1.5 rounded-lg ${activeDevice ? 'bg-purple-600/30 text-purple-400' : 'bg-slate-700 text-slate-400'}`}>
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5 leading-tight">
                <span className="truncate max-w-[150px] sm:max-w-[220px]">
                  {activeDevice ? activeDevice.name : 'No Roku Selected'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              <div className="text-[11px] text-slate-400 leading-tight font-mono">
                {activeDevice ? activeDevice.ip : 'Scan network or add IP'}
              </div>
            </div>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute left-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs">
                <div className="px-3 py-1.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Discovered Roku Devices ({devices.length})
                </div>
                {devices.length === 0 ? (
                  <div className="px-3 py-4 text-center text-slate-400">
                    <AlertCircle className="w-5 h-5 mx-auto mb-1 text-slate-500" />
                    No Roku found on network.
                  </div>
                ) : (
                  <div className="space-y-1 my-1 max-h-56 overflow-y-auto">
                    {devices.map((dev) => {
                      const isSelected = activeDevice && activeDevice.ip === dev.ip;
                      return (
                        <button
                          key={dev.ip}
                          onClick={() => {
                            onSelectDevice(dev);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                            isSelected ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'hover:bg-slate-800 text-slate-200'
                          }`}
                        >
                          <div>
                            <div className="font-semibold truncate max-w-[180px]">{dev.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{dev.ip} &bull; {dev.model || 'Roku'}</div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="border-t border-slate-800 mt-2 pt-2 space-y-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onRefreshDevices();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-purple-400' : ''}`} />
                    <span>Scan Network (Fast Subnet & SSDP)</span>
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenManualModal();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-purple-400 transition-colors font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Roku by IP Address</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Center: Tablet/Desktop Navigation Tabs Switcher */}
        <div className="hidden md:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onTabChange('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'split' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Dashboard (Split)</span>
          </button>
          <button
            onClick={() => onTabChange('remote')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'remote' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Remote Only</span>
          </button>
          <button
            onClick={() => onTabChange('apps')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'apps' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Channels</span>
          </button>
          <button
            onClick={() => onTabChange('web')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'web' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Web Apps</span>
          </button>
        </div>

        {/* Right: Actions & Scan Buttons */}
        <div className="flex items-center gap-2">
          {/* Active app pill on desktop */}
          {activeApp && activeApp.name && activeApp.name !== 'Home' && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400 font-medium">Playing:</span>
              <span className="text-purple-200 font-bold truncate max-w-[120px]">{activeApp.name}</span>
            </div>
          )}

          <button
            onClick={onRefreshDevices}
            disabled={isScanning}
            title="Scan for Roku TVs"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 transition-colors border border-slate-700/50 flex items-center gap-1.5 text-xs font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-purple-400' : ''}`} />
            <span className="hidden sm:inline">Scan</span>
          </button>
          
          <button
            onClick={onOpenManualModal}
            title="Add Roku TV by IP"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add IP</span>
          </button>
        </div>
      </div>
    </header>
  );
}
