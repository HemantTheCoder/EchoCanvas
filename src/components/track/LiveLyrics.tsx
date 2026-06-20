"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useSpotifyPlayer } from "../providers/SpotifyPlayerProvider";

export default function LiveLyrics({ lyricsData }: { lyricsData: any }) {
  const { isActive, playbackState } = useSpotifyPlayer();
  const isActuallyPlaying = isActive && playbackState && !playbackState.paused;

  const parsedLyrics = useMemo(() => {
    if (!lyricsData?.syncedLyrics) return [];
    const lines = lyricsData.syncedLyrics.split("\n");
    const parsed = [];
    for (const line of lines) {
      const match = line.match(/\[(\d{2}):(\d{2}\.\d{2})\](.*)/);
      if (match) {
        const mins = parseInt(match[1]);
        const secs = parseFloat(match[2]);
        const timeMs = (mins * 60 + secs) * 1000;
        if (match[3].trim()) {
          parsed.push({ timeMs, text: match[3].trim() });
        }
      }
    }
    return parsed;
  }, [lyricsData]);

  const [currentPos, setCurrentPos] = useState(0);

  useEffect(() => {
    if (!isActuallyPlaying || !playbackState) return;
    
    const startPerf = performance.now();
    const startPos = playbackState.position;
    
    let rafId: number;
    const loop = () => {
      const delta = performance.now() - startPerf;
      setCurrentPos(startPos + delta);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    
    return () => cancelAnimationFrame(rafId);
  }, [isActuallyPlaying, playbackState]);

  const activeLyricIndex = useMemo(() => {
    if (parsedLyrics.length === 0) return -1;
    let activeIdx = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (parsedLyrics[i].timeMs <= currentPos + 200) { // 200ms lookahead for smoothness
        activeIdx = i;
      } else {
        break;
      }
    }
    return activeIdx;
  }, [parsedLyrics, currentPos]);

  const lyricsScrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (lyricsScrollRef.current && activeLyricIndex !== -1) {
      const container = lyricsScrollRef.current;
      const activeEl = container.children[activeLyricIndex] as HTMLElement;
      if (activeEl) {
        // Calculate the target scroll position to center the active lyric inside the panel
        // This prevents the entire page from being forced to scroll.
        const targetScroll = activeEl.offsetTop - (container.clientHeight / 2) + (activeEl.clientHeight / 2);
        container.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    }
  }, [activeLyricIndex]);

  if (parsedLyrics.length === 0) return null;

  return (
    <div className="glass-panel p-6 flex flex-col gap-4 h-[350px] overflow-hidden relative">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider sticky top-0 z-20 pb-2">Live Lyrics</h3>
      
      {/* Blur gradients */}
      <div className="absolute top-10 inset-x-0 h-16 bg-gradient-to-b from-[#111111] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#111111] to-transparent z-10 pointer-events-none"></div>

      <div ref={lyricsScrollRef} className="relative flex flex-col gap-6 overflow-y-auto custom-scrollbar pb-32 pt-16 scroll-smooth h-full">
        {parsedLyrics.map((lyric, idx) => {
          const isActive = idx === activeLyricIndex;
          const isPassed = idx < activeLyricIndex;
          return (
            <p 
              key={idx} 
              className={`text-2xl md:text-3xl font-black transition-all duration-500 text-center ${
                isActive 
                  ? "text-white glow-text scale-110" 
                  : isPassed 
                    ? "text-gray-500 opacity-50" 
                    : "text-gray-600 opacity-30"
              }`}
            >
              {lyric.text}
            </p>
          )
        })}
      </div>
    </div>
  );
}
