"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";

interface SpotifyPlayerContextType {
  player: any;
  deviceId: string | null;
  isReady: boolean;
  playbackState: any;
  isActive: boolean;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType>({
  player: null,
  deviceId: null,
  isReady: false,
  playbackState: null,
  isActive: false,
});

export const useSpotifyPlayer = () => useContext(SpotifyPlayerContext);

export function SpotifyPlayerProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [playbackState, setPlaybackState] = useState<any>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Only load the script if we have an access token and haven't loaded it yet
    if (!(session?.user as any)?.accessToken || document.getElementById("spotify-player-script")) {
      return;
    }

    const script = document.createElement("script");
    script.id = "spotify-player-script";
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    // @ts-expect-error custom window property
    window.onSpotifyWebPlaybackSDKReady = () => {
      // @ts-expect-error window.Spotify exists after script load
      const newPlayer = new window.Spotify.Player({
        name: "EchoCanvas",
        getOAuthToken: (cb: (token: string) => void) => { cb((session?.user as any)?.accessToken || ""); },
        volume: 0.5,
      });

      setPlayer(newPlayer);

      newPlayer.addListener("ready", ({ device_id }: { device_id: string }) => {
        console.log("Ready with Device ID", device_id);
        setDeviceId(device_id);
        setIsReady(true);
      });

      newPlayer.addListener("not_ready", ({ device_id }: { device_id: string }) => {
        console.log("Device ID has gone offline", device_id);
        setIsReady(false);
      });

      newPlayer.addListener("player_state_changed", (state: any) => {
        if (!state) {
          setIsActive(false);
          return;
        }
        setPlaybackState(state);
        setIsActive(true);
      });

      newPlayer.connect();
    };

  }, [session]);

  return (
    <SpotifyPlayerContext.Provider value={{ player, deviceId, isReady, playbackState, isActive }}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
}
