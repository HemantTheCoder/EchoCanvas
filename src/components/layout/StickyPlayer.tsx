"use client";

import { useSession } from "next-auth/react";
import { Play, Pause, SkipBack, SkipForward, Volume2, MonitorSpeaker } from "lucide-react";
import { useEffect, useState } from "react";
import { useSpotifyPlayer } from "../providers/SpotifyPlayerProvider";
import Image from "next/image";

export default function StickyPlayer() {
  const { data: session } = useSession();
  const { player, isReady, playbackState, isActive, deviceId } = useSpotifyPlayer();
  const [position, setPosition] = useState(0);

  // Update progress bar
  useEffect(() => {
    if (!playbackState || playbackState.paused) return;

    const interval = setInterval(() => {
      player?.getCurrentState().then((state: any) => {
        if (state) {
          setPosition(state.position);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [playbackState, player]);

  if (!session) return null;

  if (!isReady) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-24 glass-panel border-t border-white/5 z-50 px-6 flex items-center justify-center bg-black/80 backdrop-blur-xl rounded-none text-gray-500 text-sm">
        Initializing Spotify Premium Player...
      </div>
    );
  }

  const track = playbackState?.track_window?.current_track;
  const isPlaying = !playbackState?.paused;
  const duration = playbackState?.duration || 0;
  const currentPos = playbackState?.paused ? playbackState.position : position;
  
  const formatTime = (ms: number) => {
    if (!ms) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration ? (currentPos / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 glass-panel border-t border-white/5 z-50 px-6 py-4 flex items-center justify-between bg-black/80 backdrop-blur-xl rounded-none">
      
      {/* Track Info */}
      <div className="flex items-center gap-4 w-1/3 min-w-0">
        {track ? (
          <>
            <div className="w-14 h-14 bg-white/10 rounded-md overflow-hidden relative flex-shrink-0">
              {track.album.images[0] && (
                <Image src={track.album.images[0].url} alt={track.album.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-white text-sm font-semibold truncate hover:underline cursor-pointer">
                {track.name}
              </span>
              <span className="text-gray-400 text-xs truncate hover:underline cursor-pointer">
                {track.artists.map((a: any) => a.name).join(", ")}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col truncate">
            <span className="text-gray-400 text-sm truncate">
              EchoCanvas Device Ready
            </span>
            <span className="text-gray-500 text-xs truncate">
              Select a track to play
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center justify-center w-1/3 max-w-md gap-2">
        <div className="flex items-center gap-6">
          <button 
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            onClick={() => player?.previousTrack()}
            disabled={!isActive}
          >
            <SkipBack size={20} />
          </button>
          <button 
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            onClick={() => player?.togglePlay()}
            disabled={!isActive}
          >
            {isPlaying ? <Pause size={20} className="fill-black" /> : <Play size={20} className="fill-black ml-1" />}
          </button>
          <button 
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            onClick={() => player?.nextTrack()}
            disabled={!isActive}
          >
            <SkipForward size={20} />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full flex items-center gap-2 text-xs text-gray-400 font-mono">
          <span className="w-8 text-right">{formatTime(currentPos)}</span>
          <div 
            className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden group cursor-pointer relative"
            onClick={(e) => {
              if (!isActive || !duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              player?.seek(percent * duration);
            }}
          >
            <div 
              className="absolute top-0 left-0 bottom-0 bg-white group-hover:bg-primary transition-colors" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
          <span className="w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Extra Controls */}
      <div className="flex items-center justify-end gap-4 w-1/3 text-gray-400">
        <div className={`flex items-center gap-2 ${isActive ? 'text-primary' : 'text-gray-500'}`} title="Device Status">
          <MonitorSpeaker size={18} />
          <span className="text-xs">{isActive ? 'Listening on EchoCanvas' : 'Device Available'}</span>
        </div>
        <div className="flex items-center gap-2 w-24 group cursor-pointer ml-4">
          <Volume2 size={18} className="hover:text-white transition-colors" />
          <div 
            className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              player?.setVolume(percent);
            }}
          >
            <div className="absolute top-0 left-0 bottom-0 bg-white group-hover:bg-primary transition-colors w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
