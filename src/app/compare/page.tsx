"use client";

import { useState } from "react";
import { searchTracksAction, fetchTrackDataAction } from "@/app/actions";
import { Search, X, Activity, Zap, Droplets, Mic, Music2, Gauge } from "lucide-react";

export default function ComparePage() {
  const [searchQueryA, setSearchQueryA] = useState("");
  const [searchQueryB, setSearchQueryB] = useState("");
  
  const [resultsA, setResultsA] = useState<any[]>([]);
  const [resultsB, setResultsB] = useState<any[]>([]);

  const [trackA, setTrackA] = useState<any | null>(null);
  const [trackB, setTrackB] = useState<any | null>(null);

  const handleSearch = async (query: string, side: 'A' | 'B') => {
    if (!query) return;
    const res = await searchTracksAction(query);
    if (side === 'A') setResultsA(res);
    else setResultsB(res);
  };

  const handleSelect = async (trackInfo: any, side: 'A' | 'B') => {
    const data = await fetchTrackDataAction(trackInfo.id);
    if (side === 'A') {
      setTrackA(data);
      setResultsA([]);
      setSearchQueryA("");
    } else {
      setTrackB(data);
      setResultsB([]);
      setSearchQueryB("");
    }
  };

  const features = [
    { label: "Energy", key: "energy", icon: <Zap size={14} />, color: "bg-yellow-400" },
    { label: "Danceability", key: "danceability", icon: <Activity size={14} />, color: "bg-primary" },
    { label: "Valence", key: "valence", icon: <Droplets size={14} />, color: "bg-pink-500" },
    { label: "Acousticness", key: "acousticness", icon: <Mic size={14} />, color: "bg-orange-400" },
    { label: "Instrumentalness", key: "instrumentalness", icon: <Music2 size={14} />, color: "bg-blue-400" },
    { label: "Liveness", key: "liveness", icon: <Gauge size={14} />, color: "bg-teal-400" },
  ];

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 flex flex-col gap-10">
      
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Compare DNA</h1>
        <p className="text-gray-400">Select two tracks to compare their audio features side-by-side.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Track A Side */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            {!trackA && (
              <div className="flex items-center glass-panel rounded-full px-4 border-white/10">
                <Search size={18} className="text-gray-400" />
                <input 
                  type="text" 
                  value={searchQueryA}
                  onChange={(e) => setSearchQueryA(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQueryA, 'A')}
                  placeholder="Search first track..."
                  className="w-full bg-transparent py-3 px-3 text-white focus:outline-none placeholder:text-gray-500"
                />
                <button onClick={() => handleSearch(searchQueryA, 'A')} className="text-xs font-bold text-primary">SEARCH</button>
              </div>
            )}
            
            {resultsA.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-panel max-h-60 overflow-y-auto custom-scrollbar z-20 flex flex-col p-2">
                {resultsA.map(t => (
                  <button key={t.id} onClick={() => handleSelect(t, 'A')} className="flex items-center gap-3 p-2 hover:bg-white/10 rounded text-left">
                    {t.album.images[0] && <img src={t.album.images[0].url} className="w-10 h-10 rounded" alt="" />}
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold truncate text-white">{t.name}</span>
                      <span className="text-xs text-gray-400 truncate">{t.artists.map((a:any) => a.name).join(", ")}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {trackA && (
              <div className="glass-panel p-6 flex gap-4 relative items-center">
                <button onClick={() => setTrackA(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={18} /></button>
                {trackA.track.album.images[0] && <img src={trackA.track.album.images[0].url} className="w-24 h-24 rounded-md shadow-lg" alt="" />}
                <div className="flex flex-col">
                  <span className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Track A</span>
                  <h2 className="text-2xl font-bold text-white leading-tight">{trackA.track.name}</h2>
                  <p className="text-gray-400 text-sm">{trackA.track.artists[0].name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Track B Side */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            {!trackB && (
              <div className="flex items-center glass-panel rounded-full px-4 border-white/10">
                <Search size={18} className="text-gray-400" />
                <input 
                  type="text" 
                  value={searchQueryB}
                  onChange={(e) => setSearchQueryB(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQueryB, 'B')}
                  placeholder="Search second track..."
                  className="w-full bg-transparent py-3 px-3 text-white focus:outline-none placeholder:text-gray-500"
                />
                <button onClick={() => handleSearch(searchQueryB, 'B')} className="text-xs font-bold text-accent">SEARCH</button>
              </div>
            )}
            
            {resultsB.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-panel max-h-60 overflow-y-auto custom-scrollbar z-20 flex flex-col p-2">
                {resultsB.map(t => (
                  <button key={t.id} onClick={() => handleSelect(t, 'B')} className="flex items-center gap-3 p-2 hover:bg-white/10 rounded text-left">
                    {t.album.images[0] && <img src={t.album.images[0].url} className="w-10 h-10 rounded" alt="" />}
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold truncate text-white">{t.name}</span>
                      <span className="text-xs text-gray-400 truncate">{t.artists.map((a:any) => a.name).join(", ")}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {trackB && (
              <div className="glass-panel p-6 flex gap-4 relative items-center">
                <button onClick={() => setTrackB(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={18} /></button>
                {trackB.track.album.images[0] && <img src={trackB.track.album.images[0].url} className="w-24 h-24 rounded-md shadow-lg" alt="" />}
                <div className="flex flex-col">
                  <span className="text-xs text-accent font-bold uppercase tracking-wider mb-1">Track B</span>
                  <h2 className="text-2xl font-bold text-white leading-tight">{trackB.track.name}</h2>
                  <p className="text-gray-400 text-sm">{trackB.track.artists[0].name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      {trackA && trackB && (
        <div className="glass-panel p-8 mt-4 flex flex-col gap-8">
          <h3 className="text-xl font-bold text-center">Feature Breakdown</h3>
          
          <div className="flex flex-col gap-6">
            {features.map(f => {
              const valA = trackA.audioFeatures?.[f.key] || 0;
              const valB = trackB.audioFeatures?.[f.key] || 0;
              
              return (
                <div key={f.key} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary font-mono w-12">{Math.round(valA * 100)}%</span>
                    <div className="flex items-center gap-2 text-gray-300 uppercase tracking-wider text-xs font-semibold">
                      {f.icon} {f.label}
                    </div>
                    <span className="text-accent font-mono w-12 text-right">{Math.round(valB * 100)}%</span>
                  </div>
                  
                  {/* Diverging Bar Chart */}
                  <div className="flex items-center w-full h-2 rounded-full overflow-hidden bg-white/5">
                    <div className="flex-1 flex justify-end h-full">
                      <div className="h-full bg-primary transition-all duration-700" style={{ width: `${valA * 100}%` }} />
                    </div>
                    <div className="w-[2px] h-full bg-white/30 z-10" />
                    <div className="flex-1 flex justify-start h-full">
                      <div className="h-full bg-accent transition-all duration-700" style={{ width: `${valB * 100}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
