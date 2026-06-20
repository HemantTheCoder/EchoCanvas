"use client";

import { Activity, Zap, Droplets, Mic, Music2, Gauge } from "lucide-react";

export default function MusicDNAPanel({ audioFeatures }: { audioFeatures: any }) {
  if (!audioFeatures) {
    return (
      <div className="glass-panel p-6 flex items-center justify-center min-h-[300px]">
        <span className="text-gray-400">Audio features not available for this track.</span>
      </div>
    );
  }

  // Convert features 0-1 to percentage for visual meters
  const features = [
    { label: "Energy", value: audioFeatures.energy, icon: <Zap size={16} />, color: "bg-yellow-400" },
    { label: "Danceability", value: audioFeatures.danceability, icon: <Activity size={16} />, color: "bg-primary" },
    { label: "Valence (Mood)", value: audioFeatures.valence, icon: <Droplets size={16} />, color: "bg-pink-500" },
    { label: "Acousticness", value: audioFeatures.acousticness, icon: <Mic size={16} />, color: "bg-orange-400" },
    { label: "Instrumentalness", value: audioFeatures.instrumentalness, icon: <Music2 size={16} />, color: "bg-blue-400" },
    { label: "Liveness", value: audioFeatures.liveness, icon: <Gauge size={16} />, color: "bg-teal-400" },
  ];

  return (
    <div className="glass-panel p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight mb-1">Music DNA</h2>
        <p className="text-sm text-gray-400">The sonic fingerprint of this track.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        {features.map((feature) => (
          <div key={feature.label} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-gray-400">{feature.icon}</span>
                <span className="font-medium">{feature.label}</span>
              </div>
              <span className="text-white font-mono font-bold">
                {Math.round(feature.value * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${feature.color} transition-all duration-1000 ease-out`}
                style={{ width: `${feature.value * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Tempo</span>
          <span className="text-lg font-bold text-white">{Math.round(audioFeatures.tempo)} <span className="text-sm font-normal text-gray-400">BPM</span></span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Key / Mode</span>
          <span className="text-lg font-bold text-white">
            {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][audioFeatures.key] || 'Unknown'} 
            {audioFeatures.mode === 1 ? ' Major' : ' Minor'}
          </span>
        </div>
      </div>
    </div>
  );
}
