import React, { useState, useEffect } from 'react';
import {
  Power,
  Volume2,
  VolumeX,
  Volume1,
  Home,
  ArrowLeft,
  RotateCcw,
  Asterisk,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  FastForward,
  Rewind,
  Tv2,
  Search,
  Sliders,
  Tv
} from 'lucide-react';
import KeyboardInput from './KeyboardInput';

export default function RemoteControl({
  onKeyPress,
  onSendText,
  audioState = { volume: 15, muted: false },
  onSetVolume,
  activeApp,
  disabled
}) {
  const [localVol, setLocalVol] = useState(audioState?.volume ?? 15);
  const [isSliding, setIsSliding] = useState(false);

  // Sync external volume updates when not actively dragging
  useEffect(() => {
    if (!isSliding && audioState?.volume !== undefined && audioState.volume !== null) {
      setLocalVol(audioState.volume);
    }
  }, [audioState?.volume, isSliding]);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch (e) {
        // ignore if not supported
      }
    }
  };

  const handleKey = (keyName) => {
    if (disabled) return;
    triggerHaptic();
    onKeyPress(keyName);
  };

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    setLocalVol(val);
  };

  const handleSliderCommit = () => {
    setIsSliding(false);
    triggerHaptic();
    if (onSetVolume && !disabled) {
      onSetVolume(localVol);
    }
  };

  const isMuted = audioState?.muted;

  return (
    <div className="w-full flex flex-col items-center gap-3.5 py-1">
      
      {/* Top: Currently Playing Card (Moved Above Remote) */}
      {activeApp && activeApp.name && activeApp.name !== 'Home' && (
        <div className="w-full bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/40 rounded-2xl p-2.5 flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-3 overflow-hidden">
            {activeApp.iconUrl ? (
              <img
                src={activeApp.iconUrl}
                alt={activeApp.name}
                className="w-9 h-9 rounded-xl object-cover bg-slate-800 shadow shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                <Play className="w-4 h-4 fill-current" />
              </div>
            )}
            <div className="overflow-hidden">
              <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span>Currently Playing</span>
              </div>
              <div className="text-sm font-bold text-slate-100 truncate">
                {activeApp.name}
              </div>
            </div>
          </div>
          {activeApp.id && (
            <span className="text-[10px] font-mono text-slate-500 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800 shrink-0">
              {activeApp.id}
            </span>
          )}
        </div>
      )}

      {/* TV Power, Inputs & Global Actions */}
      <div className="w-full bg-slate-900/70 backdrop-blur border border-slate-800 rounded-2xl p-3 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          {/* Power Button */}
          <button
            onClick={() => handleKey('Power')}
            disabled={disabled}
            className="remote-btn flex-1 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 flex items-center justify-center gap-1.5 text-xs font-semibold shadow-sm"
          >
            <Power className="w-4 h-4" />
            <span>Power</span>
          </button>

          {/* Quick HDMI & Inputs */}
          <div className="flex-1 flex items-center gap-1">
            {['InputTuner', 'InputHDMI1', 'InputHDMI2', 'InputHDMI3'].map((inputKey, idx) => {
              const labels = ['TV', 'HDMI 1', 'HDMI 2', 'HDMI 3'];
              return (
                <button
                  key={inputKey}
                  onClick={() => handleKey(inputKey)}
                  disabled={disabled}
                  className="remote-btn flex-1 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/30 text-[11px] font-medium text-slate-400 hover:text-slate-200"
                >
                  {labels[idx]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Remote Area: Tactile D-Pad Center + Vertical Volume Panel Beside It */}
      <div className="w-full flex items-stretch justify-center gap-3">
        
        {/* Left / Main Column: D-Pad & Navigation Hub */}
        <div className="flex-1 bg-slate-900/80 backdrop-blur border border-slate-800/90 rounded-3xl p-4 shadow-2xl relative">
          
          {/* Navigation Bar: Back, Instant Replay, Home, Info (*) */}
          <div className="flex items-center justify-between mb-4 px-1">
            {/* Back */}
            <button
              onClick={() => handleKey('Back')}
              disabled={disabled}
              className="remote-btn w-11 h-11 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 flex flex-col items-center justify-center gap-0.5 shadow-md"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 text-slate-300" />
              <span className="text-[8px] font-bold text-slate-400">BACK</span>
            </button>

            {/* Instant Replay */}
            <button
              onClick={() => handleKey('InstantReplay')}
              disabled={disabled}
              className="remote-btn w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 text-slate-400 flex items-center justify-center"
              title="Instant Replay (7 sec)"
            >
              <RotateCcw className="w-4 h-4 text-slate-300" />
            </button>

            {/* Home */}
            <button
              onClick={() => handleKey('Home')}
              disabled={disabled}
              className="remote-btn w-14 h-11 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-300 flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-purple-900/20"
              title="Home Screen"
            >
              <Home className="w-4 h-4 text-purple-300" />
              <span className="text-[8px] font-bold tracking-wider">HOME</span>
            </button>

            {/* Options / Info */}
            <button
              onClick={() => handleKey('Info')}
              disabled={disabled}
              className="remote-btn w-11 h-11 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 flex flex-col items-center justify-center gap-0.5 shadow-md"
              title="Options (*)"
            >
              <Asterisk className="w-4 h-4 text-amber-400" />
              <span className="text-[8px] font-bold text-slate-400">INFO</span>
            </button>
          </div>

          {/* Tactile Circular D-Pad */}
          <div className="relative w-56 h-56 mx-auto my-1 rounded-full bg-gradient-to-b from-slate-800/90 to-slate-900/90 border-2 border-slate-700/70 p-3 shadow-inner flex items-center justify-center">
            
            {/* UP Button */}
            <button
              onClick={() => handleKey('Up')}
              disabled={disabled}
              className="remote-btn absolute top-1.5 w-14 h-12 rounded-t-2xl bg-slate-700/60 hover:bg-slate-600/70 text-slate-200 flex items-center justify-center pt-1"
              title="Up"
            >
              <ChevronUp className="w-7 h-7 text-slate-300 drop-shadow" />
            </button>

            {/* DOWN Button */}
            <button
              onClick={() => handleKey('Down')}
              disabled={disabled}
              className="remote-btn absolute bottom-1.5 w-14 h-12 rounded-b-2xl bg-slate-700/60 hover:bg-slate-600/70 text-slate-200 flex items-center justify-center pb-1"
              title="Down"
            >
              <ChevronDown className="w-7 h-7 text-slate-300 drop-shadow" />
            </button>

            {/* LEFT Button */}
            <button
              onClick={() => handleKey('Left')}
              disabled={disabled}
              className="remote-btn absolute left-1.5 h-14 w-12 rounded-l-2xl bg-slate-700/60 hover:bg-slate-600/70 text-slate-200 flex items-center justify-center pl-1"
              title="Left"
            >
              <ChevronLeft className="w-7 h-7 text-slate-300 drop-shadow" />
            </button>

            {/* RIGHT Button */}
            <button
              onClick={() => handleKey('Right')}
              disabled={disabled}
              className="remote-btn absolute right-1.5 h-14 w-12 rounded-r-2xl bg-slate-700/60 hover:bg-slate-600/70 text-slate-200 flex items-center justify-center pr-1"
              title="Right"
            >
              <ChevronRight className="w-7 h-7 text-slate-300 drop-shadow" />
            </button>

            {/* CENTER OK BUTTON */}
            <button
              onClick={() => handleKey('Select')}
              disabled={disabled}
              className="remote-btn w-16 h-16 rounded-full bg-gradient-to-tr from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white font-black text-base shadow-xl shadow-purple-900/50 flex items-center justify-center border border-purple-400/40 z-10 active:scale-95 transition-transform"
              title="OK / Select"
            >
              OK
            </button>
          </div>

          {/* Media Transport Controls: Rewind, Play/Pause, Fast-Forward */}
          <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => handleKey('Rev')}
              disabled={disabled}
              className="remote-btn w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-300 flex items-center justify-center shadow-md"
              title="Rewind"
            >
              <Rewind className="w-4 h-4 text-slate-300" />
            </button>

            <button
              onClick={() => handleKey('Play')}
              disabled={disabled}
              className="remote-btn px-5 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30"
              title="Play / Pause"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <Pause className="w-3.5 h-3.5 fill-white" />
            </button>

            <button
              onClick={() => handleKey('Fwd')}
              disabled={disabled}
              className="remote-btn w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-300 flex items-center justify-center shadow-md"
              title="Fast Forward"
            >
              <FastForward className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Right Column: Dedicated Vertical Volume Slider & Large Mute Strip */}
        <div className="w-20 sm:w-24 bg-slate-900/90 border border-slate-800/90 rounded-3xl p-2.5 flex flex-col items-center justify-between shadow-2xl">
          
          {/* Live Volume Number Badge */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vol</span>
            <div className={`mt-0.5 px-2 py-1 rounded-xl text-xs font-black border transition-all ${
              isMuted
                ? 'bg-red-950/60 border-red-500/50 text-red-400'
                : 'bg-purple-950/60 border-purple-500/40 text-purple-300'
            }`}>
              {isMuted ? 'MUTE' : (localVol ?? '--')}
            </div>
          </div>

          {/* Volume + (Up) Button */}
          <button
            onClick={() => handleKey('VolumeUp')}
            disabled={disabled}
            className="remote-btn w-12 h-10 mt-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 flex items-center justify-center text-sm font-bold shadow-md active:scale-95 transition-transform"
            title="Volume Up (+)"
          >
            <ChevronUp className="w-5 h-5 text-purple-300" />
          </button>

          {/* Vertical Slider Bar Track */}
          <div className="relative flex-1 my-3 flex items-center justify-center py-2">
            <input
              type="range"
              min="0"
              max="100"
              value={localVol}
              onChange={handleSliderChange}
              onMouseDown={() => setIsSliding(true)}
              onTouchStart={() => setIsSliding(true)}
              onMouseUp={handleSliderCommit}
              onTouchEnd={handleSliderCommit}
              disabled={disabled}
              className="h-36 sm:h-44 w-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none [writing-mode:bt-lr] [-webkit-appearance:slider-vertical]"
              style={{
                writingMode: 'vertical-lr',
                direction: 'rtl'
              }}
              title={`Volume: ${localVol}`}
            />
          </div>

          {/* Volume - (Down) Button */}
          <button
            onClick={() => handleKey('VolumeDown')}
            disabled={disabled}
            className="remote-btn w-12 h-10 mb-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 flex items-center justify-center text-sm font-bold shadow-md active:scale-95 transition-transform"
            title="Volume Down (-)"
          >
            <ChevronDown className="w-5 h-5 text-purple-300" />
          </button>

          {/* Giant Tactile Mute Button */}
          <button
            onClick={() => handleKey('VolumeMute')}
            disabled={disabled}
            className={`remote-btn w-full py-3 rounded-2xl flex flex-col items-center justify-center gap-1 border shadow-lg transition-all active:scale-95 ${
              isMuted
                ? 'bg-red-600 hover:bg-red-500 border-red-400 text-white shadow-red-600/40 animate-pulse'
                : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-amber-400 hover:text-amber-300'
            }`}
            title={isMuted ? 'Unmute TV' : 'Mute TV'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            <span className="text-[9px] font-black uppercase tracking-wider">
              {isMuted ? 'MUTED' : 'MUTE'}
            </span>
          </button>

        </div>

      </div>

      {/* Virtual Keyboard Accordion */}
      <div className="w-full">
        <KeyboardInput
          onSendText={onSendText}
          onKeyPress={onKeyPress}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
