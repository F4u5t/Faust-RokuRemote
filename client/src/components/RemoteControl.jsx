import React from 'react';
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
  Search
} from 'lucide-react';
import KeyboardInput from './KeyboardInput';

export default function RemoteControl({
  onKeyPress,
  onSendText,
  disabled
}) {
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

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-4 py-2">
      
      {/* Top TV Power, Audio & Input Controls */}
      <div className="w-full bg-slate-900/70 backdrop-blur border border-slate-800 rounded-2xl p-3 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          {/* Power */}
          <button
            onClick={() => handleKey('Power')}
            disabled={disabled}
            className="remote-btn flex-1 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 flex items-center justify-center gap-1.5 text-xs font-semibold shadow-sm"
          >
            <Power className="w-4 h-4" />
            <span>Power</span>
          </button>

          {/* Mute */}
          <button
            onClick={() => handleKey('VolumeMute')}
            disabled={disabled}
            className="remote-btn p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 flex items-center justify-center"
            title="Mute Audio"
          >
            <VolumeX className="w-4 h-4 text-amber-400" />
          </button>

          {/* Volume Down */}
          <button
            onClick={() => handleKey('VolumeDown')}
            disabled={disabled}
            className="remote-btn px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/50 text-slate-200 flex items-center justify-center gap-1 text-xs font-medium"
            title="Volume Down"
          >
            <Volume1 className="w-4 h-4" />
            <span>Vol -</span>
          </button>

          {/* Volume Up */}
          <button
            onClick={() => handleKey('VolumeUp')}
            disabled={disabled}
            className="remote-btn px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/50 text-slate-200 flex items-center justify-center gap-1 text-xs font-medium"
            title="Volume Up"
          >
            <Volume2 className="w-4 h-4 text-blue-400" />
            <span>Vol +</span>
          </button>
        </div>

        {/* HDMI / Inputs Quick Bar */}
        <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider pl-1">Input:</span>
          {['InputTuner', 'InputHDMI1', 'InputHDMI2', 'InputHDMI3', 'InputHDMI4'].map((inputKey, idx) => {
            const labels = ['TV', 'HDMI 1', 'HDMI 2', 'HDMI 3', 'HDMI 4'];
            return (
              <button
                key={inputKey}
                onClick={() => handleKey(inputKey)}
                disabled={disabled}
                className="remote-btn flex-1 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/30 text-[11px] font-medium text-slate-400 hover:text-slate-200"
              >
                {labels[idx]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main D-Pad & Navigation Hub */}
      <div className="w-full bg-slate-900/80 backdrop-blur border border-slate-800/90 rounded-3xl p-5 shadow-2xl relative">
        
        {/* Navigation Bar: Back, Home, Options (*) */}
        <div className="flex items-center justify-between mb-5 px-2">
          {/* Back */}
          <button
            onClick={() => handleKey('Back')}
            disabled={disabled}
            className="remote-btn w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 flex flex-col items-center justify-center gap-0.5 shadow-md"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
            <span className="text-[9px] font-bold text-slate-400">BACK</span>
          </button>

          {/* Instant Replay */}
          <button
            onClick={() => handleKey('InstantReplay')}
            disabled={disabled}
            className="remote-btn w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 text-slate-400 flex items-center justify-center"
            title="Instant Replay (7 sec)"
          >
            <RotateCcw className="w-4 h-4 text-slate-300" />
          </button>

          {/* Home */}
          <button
            onClick={() => handleKey('Home')}
            disabled={disabled}
            className="remote-btn w-14 h-12 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-300 flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-purple-900/20"
            title="Home Screen"
          >
            <Home className="w-5 h-5 text-purple-300" />
            <span className="text-[9px] font-bold tracking-wider">HOME</span>
          </button>

          {/* Options / Asterisk */}
          <button
            onClick={() => handleKey('Info')}
            disabled={disabled}
            className="remote-btn w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 flex flex-col items-center justify-center gap-0.5 shadow-md"
            title="Options (*)"
          >
            <Asterisk className="w-5 h-5 text-amber-400" />
            <span className="text-[9px] font-bold text-slate-400">INFO</span>
          </button>
        </div>

        {/* Tactile Circular D-Pad */}
        <div className="relative w-64 h-64 mx-auto my-2 rounded-full bg-gradient-to-b from-slate-800/90 to-slate-900/90 border-2 border-slate-700/70 p-3 shadow-inner flex items-center justify-center">
          
          {/* UP Button */}
          <button
            onClick={() => handleKey('Up')}
            disabled={disabled}
            className="remote-btn absolute top-2 w-16 h-14 rounded-t-2xl bg-slate-700/60 hover:bg-slate-600/70 text-slate-200 flex items-center justify-center pt-1"
            title="Up"
          >
            <ChevronUp className="w-8 h-8 text-slate-300 drop-shadow" />
          </button>

          {/* DOWN Button */}
          <button
            onClick={() => handleKey('Down')}
            disabled={disabled}
            className="remote-btn absolute bottom-2 w-16 h-14 rounded-b-2xl bg-slate-700/60 hover:bg-slate-600/70 text-slate-200 flex items-center justify-center pb-1"
            title="Down"
          >
            <ChevronDown className="w-8 h-8 text-slate-300 drop-shadow" />
          </button>

          {/* LEFT Button */}
          <button
            onClick={() => handleKey('Left')}
            disabled={disabled}
            className="remote-btn absolute left-2 h-16 w-14 rounded-l-2xl bg-slate-700/60 hover:bg-slate-600/70 text-slate-200 flex items-center justify-center pl-1"
            title="Left"
          >
            <ChevronLeft className="w-8 h-8 text-slate-300 drop-shadow" />
          </button>

          {/* RIGHT Button */}
          <button
            onClick={() => handleKey('Right')}
            disabled={disabled}
            className="remote-btn absolute right-2 h-16 w-14 rounded-r-2xl bg-slate-700/60 hover:bg-slate-600/70 text-slate-200 flex items-center justify-center pr-1"
            title="Right"
          >
            <ChevronRight className="w-8 h-8 text-slate-300 drop-shadow" />
          </button>

          {/* CENTER OK BUTTON */}
          <button
            onClick={() => handleKey('Select')}
            disabled={disabled}
            className="remote-btn w-20 h-20 rounded-full bg-gradient-to-tr from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white font-black text-lg shadow-xl shadow-purple-900/50 flex items-center justify-center border border-purple-400/40 z-10 active:scale-95 transition-transform"
            title="OK / Select"
          >
            OK
          </button>
        </div>

        {/* Media Transport Controls: Rewind, Play/Pause, Fast-Forward */}
        <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => handleKey('Rev')}
            disabled={disabled}
            className="remote-btn w-12 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-300 flex items-center justify-center shadow-md"
            title="Rewind"
          >
            <Rewind className="w-5 h-5 text-slate-300" />
          </button>

          <button
            onClick={() => handleKey('Play')}
            disabled={disabled}
            className="remote-btn px-6 h-12 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
            title="Play / Pause"
          >
            <Play className="w-4 h-4 fill-white" />
            <Pause className="w-4 h-4 fill-white" />
          </button>

          <button
            onClick={() => handleKey('Fwd')}
            disabled={disabled}
            className="remote-btn w-12 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-300 flex items-center justify-center shadow-md"
            title="Fast Forward"
          >
            <FastForward className="w-5 h-5 text-slate-300" />
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
