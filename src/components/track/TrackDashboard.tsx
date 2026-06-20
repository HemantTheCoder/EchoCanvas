"use client";

import { useState, useEffect } from "react";
import CanvasVisualizer from "@/components/visualizer/CanvasVisualizer";
import TrackMetadataPanel from "./TrackMetadataPanel";
import MusicDNAPanel from "./MusicDNAPanel";
import { useSpotifyPlayer } from "../providers/SpotifyPlayerProvider";
import { useSession } from "next-auth/react";
import { GameMode } from "@/components/visualizer/CanvasVisualizer";

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
  const [gameMode, setGameMode] = useState<GameMode>("catcher");
  const [isArcadeMode, setIsArcadeMode] = useState(false);
  const { deviceId, playbackState, isActive } = useSpotifyPlayer();
  const { data: session } = useSession();
  
  // The true playing state from the SDK
  const isActuallyPlaying = isActive && playbackState && !playbackState.paused;

  const handlePlay = async () => {
    if (!deviceId || !session) return;
    
    const token = (session.user as any).accessToken;
    
    try {
      // 1. Play the main track
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [track.uri] }),
      });
      
      // 2. Queue up similar vibes so it autoplays!
      if (similarTracks && similarTracks.length > 0) {
        // Enqueue the top 5 similar tracks
        for (const sim of similarTracks.slice(0, 5)) {
          if (!sim.uri) continue;
          await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(sim.uri)}&device_id=${deviceId}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      }
    } catch (e) {
      console.error("Failed to play track or queue", e);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isArcadeMode) {
        setIsArcadeMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isArcadeMode]);

  return (
    <div className="relative w-full flex-1 overflow-hidden">
      {/* Background Visualizer (Always Zen) */}
      <div className="absolute inset-0 z-0 opacity-50">
        <CanvasVisualizer 
          audioFeatures={audioFeatures} 
          theme={theme} 
          isPlaying={isActuallyPlaying} 
          trackId={track.id}
          gameMode="zen"
        />
      </div>

      {/* Arcade Fullscreen Overlay */}
      {isArcadeMode && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="absolute top-6 right-6 z-50">
            <button 
              onClick={() => setIsArcadeMode(false)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full font-bold backdrop-blur-md transition-all"
            >
              Exit Arcade (ESC)
            </button>
          </div>
          <div className="flex-1 w-full h-full relative">
            <CanvasVisualizer 
              audioFeatures={audioFeatures} 
              theme={theme} 
              isPlaying={isActuallyPlaying} 
              trackId={track.id}
              gameMode={gameMode}
            />
          </div>
        </div>
      )}

      {/* Overlay UI */}
      <div className="relative z-10 w-full h-full p-6 flex flex-col md:flex-row gap-6 pb-32 overflow-y-auto">
        
        {/* Left Column: Metadata & Controls */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <TrackMetadataPanel 
            track={track} 
            isPlaying={isActuallyPlaying} 
            onPlayToggle={handlePlay} 
          />
          
          {/* Theme & Game Switcher Mini Panel */}
          <div className="glass-panel p-4 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
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

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Arcade Mode</h3>
              <p className="text-xs text-gray-400">Jump into a fullscreen audio-reactive mini-game. Seeded directly by the current track!</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { id: "catcher", label: "Vibe Catcher" },
                  { id: "dodge", label: "Gravity Dodge" }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setGameMode(m.id as GameMode)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      gameMode === m.id 
                        ? "bg-white text-black glow-accent" 
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setIsArcadeMode(true)}
                className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:scale-[1.02] transition-transform glow-accent"
              >
                Enter Arcade
              </button>
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
