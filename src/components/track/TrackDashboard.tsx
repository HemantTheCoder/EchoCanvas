"use client";

import { useState } from "react";
import CanvasVisualizer from "@/components/visualizer/CanvasVisualizer";
import TrackMetadataPanel from "./TrackMetadataPanel";
import MusicDNAPanel from "./MusicDNAPanel";

export default function TrackDashboard({
  track,
  audioFeatures,
  similarTracks,
}: {
  track: any;
  audioFeatures: any;
  similarTracks: any[];
}) {
  const [theme, setTheme] = useState("neon");
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative w-full flex-1 overflow-hidden">
      {/* Background Visualizer */}
      <div className="absolute inset-0 z-0">
        <CanvasVisualizer 
          audioFeatures={audioFeatures} 
          theme={theme} 
          isPlaying={isPlaying} 
        />
      </div>

      {/* Overlay UI */}
      <div className="relative z-10 w-full h-full p-6 flex flex-col md:flex-row gap-6 pb-32 overflow-y-auto">
        
        {/* Left Column: Metadata & Controls */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <TrackMetadataPanel 
            track={track} 
            isPlaying={isPlaying} 
            onPlayToggle={() => setIsPlaying(!isPlaying)} 
          />
          
          {/* Theme Switcher Mini Panel */}
          <div className="glass-panel p-4 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Visual Theme</h3>
            <div className="flex flex-wrap gap-2">
              {["neon", "vaporwave", "cosmos", "ambient"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                    theme === t 
                      ? "bg-primary text-black glow-accent" 
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: DNA & Similar */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <MusicDNAPanel audioFeatures={audioFeatures} />
          
          {/* Similar Tracks Mini Panel */}
          <div className="glass-panel p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Similar Vibes</h3>
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {similarTracks.map((simTrack: any) => (
                <a 
                  key={simTrack.id}
                  href={`/track/${simTrack.id}`}
                  className="flex flex-col gap-2 min-w-[120px] group"
                >
                  <div className="w-[120px] h-[120px] rounded-md overflow-hidden bg-white/5 relative">
                    {simTrack.album.images[0]?.url && (
                      <img 
                        src={simTrack.album.images[0].url} 
                        alt={simTrack.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white truncate group-hover:text-primary transition-colors">{simTrack.name}</span>
                    <span className="text-[10px] text-gray-400 truncate">{simTrack.artists[0]?.name}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
