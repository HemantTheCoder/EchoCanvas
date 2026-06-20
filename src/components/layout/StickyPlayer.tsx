"use client";

import { useSession } from "next-auth/react";
import { Play, Pause, SkipBack, SkipForward, Volume2, MonitorSpeaker } from "lucide-react";
import { useState } from "react";

export default function StickyPlayer() {
  const { data: session } = useSession();
  const [isPlaying, setIsPlaying] = useState(false);

  // Minimal skeleton player for now. Will connect to Spotify SDK or Preview Audio later.
  if (!session) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 glass-panel border-t border-white/5 z-50 px-6 py-4 flex items-center justify-between bg-black/80 backdrop-blur-xl rounded-none">
      
      {/* Track Info */}
      <div className="flex items-center gap-4 w-1/3 min-w-0">
        <div className="w-14 h-14 bg-white/10 rounded-md overflow-hidden relative group cursor-pointer flex-shrink-0">
          {/* Placeholder for album art */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20" />
        </div>
        <div className="flex flex-col truncate">
          <span className="text-white text-sm font-semibold truncate hover:underline cursor-pointer">
            Select a track
          </span>
          <span className="text-gray-400 text-xs truncate hover:underline cursor-pointer">
            Artist
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center justify-center w-1/3 max-w-md gap-2">
        <div className="flex items-center gap-6">
          <button className="text-gray-400 hover:text-white transition-colors">
            <SkipBack size={20} />
          </button>
          <button 
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={20} className="fill-black" /> : <Play size={20} className="fill-black ml-1" />}
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <SkipForward size={20} />
          </button>
        </div>
        {/* Progress Bar (Mock) */}
        <div className="w-full flex items-center gap-2 text-xs text-gray-400 font-mono">
          <span>0:00</span>
          <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden group cursor-pointer">
            <div className="h-full bg-white group-hover:bg-primary transition-colors w-1/3" />
          </div>
          <span>3:00</span>
        </div>
      </div>

      {/* Extra Controls */}
      <div className="flex items-center justify-end gap-4 w-1/3 text-gray-400">
        <button className="hover:text-white transition-colors">
          <MonitorSpeaker size={18} />
        </button>
        <div className="flex items-center gap-2 w-24 group cursor-pointer">
          <Volume2 size={18} className="hover:text-white transition-colors" />
          <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white group-hover:bg-primary transition-colors w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
