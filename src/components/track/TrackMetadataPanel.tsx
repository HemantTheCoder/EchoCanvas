"use client";

import { Play, Pause, Heart, Share2, Clock, Calendar, Check } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { saveTrackToVault } from "@/app/actions";

export default function TrackMetadataPanel({ 
  track, 
  isPlaying, 
  onPlayToggle 
}: { 
  track: any; 
  isPlaying: boolean; 
  onPlayToggle: () => void; 
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Hardcoding some default tags for the MVP
    const tags = "vibes, discovery";
    const note = "Discovered on EchoCanvas";
    const nostalgia = Math.floor(Math.random() * 5) + 5; // Random 5-9 nostalgia
    
    await saveTrackToVault(track.id, tags, note, nostalgia);
    
    setSaved(true);
    setIsSaving(false);
  };

  if (!track) return null;

  const durationMs = track.duration_ms;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = ((durationMs % 60000) / 1000).toFixed(0);
  const durationStr = `${minutes}:${(Number(seconds) < 10 ? '0' : '')}${seconds}`;

  return (
    <div className="glass-panel p-6 flex flex-col gap-6 relative overflow-hidden group">
      
      {/* Background glow based on album art (simulated with CSS for now) */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/30 blur-[60px] rounded-full pointer-events-none" />

      <div className="w-full aspect-square rounded-xl overflow-hidden shadow-2xl relative">
        {track.album.images[0]?.url ? (
          <img 
            src={track.album.images[0].url} 
            alt={track.album.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
        
        {/* Play overlay on image */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            onClick={onPlayToggle}
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform glow-accent shadow-xl"
          >
            {isPlaying ? (
              <Pause className="fill-black text-black" size={24} />
            ) : (
              <Play className="fill-black text-black ml-1" size={24} />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {track.explicit && (
          <span className="bg-white/20 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded w-max">
            Explicit
          </span>
        )}
        <h1 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
          {track.name}
        </h1>
        <h2 className="text-lg text-primary font-medium">
          {track.artists.map((a: any) => a.name).join(", ")}
        </h2>
        <p className="text-sm text-gray-400">
          {track.album.name}
        </p>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-300">
        <div className="flex items-center gap-1.5">
          <Clock size={14} />
          <span>{durationStr}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={14} />
          <span>{track.album.release_date?.substring(0, 4)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-white">Popularity:</span>
          <span>{track.popularity}/100</span>
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        <button 
          onClick={handleSave}
          disabled={isSaving || saved}
          className={`flex-1 py-2.5 rounded-full flex items-center justify-center gap-2 transition-colors text-sm font-semibold ${
            saved ? "bg-primary text-black" : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          {saved ? <><Check size={16} /> Saved in Vault</> : <><Heart size={16} /> Save to Vault</>}
        </button>
        <button className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors">
          <Share2 size={16} />
        </button>
      </div>
    </div>
  );
}
