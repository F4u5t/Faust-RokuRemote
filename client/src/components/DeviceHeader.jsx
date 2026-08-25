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
  Columns,
  PlaySquare,
  Power,
  SlidersHorizontal
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
  activeApp,
  onKeyPress,
  disabled
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [inputDropdownOpen, setInputDropdownOpen] = useState(false);

  const handleKey = (keyName) => {
    if (disabled || !onKeyPress) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(25); } catch (e) {}
    }
    onKeyPress(keyName);
  };

  const INPUT_OPTIONS = [
    { label: 'Live TV / Antenna', key: 'InputTuner', desc: 'Over-the-air tuner' },
    { label: 'HDMI 1', key: 'InputHDMI1', desc: 'Port 1' },
    { label: 'HDMI 2', key: 'InputHDMI2', desc: 'Port 2' },
    { label: 'HDMI 3', key: 'InputHDMI3', desc: 'Port 3' },
    { label: 'HDMI 4', key: 'InputHDMI4', desc: 'Port 4' },
    { label: 'AV / Composite', key: 'InputAV', desc: 'Analog input' }
  ];

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-3 sm:px-4 py-2 sticky top-0 z-30 shadow-md">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Device Selector + Power Button + Inputs Combobox */}
        <div className="flex items-center gap-2">
          
          {/* Device Selector Button & Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700/60 text-left transition-all shadow-sm"
            >
              <div className={`p-1.5 rounded-lg ${activeDevice ? 'bg-purple-600/30 text-purple-400' : 'bg-slate-700 text-slate-400'}`}>
                <Tv className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5 leading-tight">
                  <span className="truncate max-w-[120px] sm:max-w-[190px]">
                    {activeDevice ? activeDevice.name : 'No Roku Selected'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 leading-tight font-mono">
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

          {/* Top Bar Power Button */}
          <button
            onClick={() => handleKey('Power')}
            disabled={disabled}
            title="Toggle TV Power"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/50 hover:bg-red-900/70 border border-red-800/50 hover:border-red-600 text-red-400 hover:text-red-300 text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-40"
          >
            <Power className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">Power</span>
          </button>

          {/* TV Inputs Combobox (Single matching dropdown) */}
          <div className="relative">
            <button
              onClick={() => setInputDropdownOpen(!inputDropdownOpen)}
              disabled={disabled}
              title="Select TV Input Source"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700/60 text-left transition-all shadow-sm disabled:opacity-40"
            >
              <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-400">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5 leading-tight">
                  <span>Input</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${inputDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">
                  HDMI / TV
                </div>
              </div>
            </button>

            {/* Input Dropdown Menu */}
            {inputDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setInputDropdownOpen(false)} />
                <div className="absolute left-0 top-full mt-2 w-52 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs">
                  <div className="px-2.5 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                    Switch TV Input
                  </div>
                  <div className="space-y-1 my-1">
                    {INPUT_OPTIONS.map((inp) => (
                      <button
                        key={inp.key}
                        onClick={() => {
                          handleKey(inp.key);
                          setInputDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-slate-200 hover:bg-purple-600/20 hover:text-purple-300 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-600 group-hover:bg-purple-400 transition-colors" />
                          <span className="font-semibold">{inp.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{inp.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

        {/* Center / Right: Tablet/Desktop Navigation Tabs Switcher */}
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
            <span>Remote</span>
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
            onClick={() => onTabChange('youtubetv')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'youtubetv' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-red-300'
            }`}
          >
            <PlaySquare className="w-3.5 h-3.5" />
            <span>YouTube TV</span>
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

      </div>
    </header>
  );
}
