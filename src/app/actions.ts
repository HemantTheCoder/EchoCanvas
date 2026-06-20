"use server";

import { getTrackDetails, getAudioFeatures, searchSpotify } from "@/lib/spotify-server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function fetchTrackDataAction(trackId: string) {
  try {
    const track = await getTrackDetails(trackId);
    const audioFeatures = await getAudioFeatures(trackId);
    return { track, audioFeatures };
  } catch (e) {
    console.error("fetchTrackDataAction error", e);
    return null;
  }
}

export async function searchTracksAction(query: string) {
  try {
    const res = await searchSpotify(query, ["track"]);
    return res?.tracks?.items || [];
  } catch (e) {
    console.error("searchTracksAction error", e);
    return [];
  }
}

export async function saveTrackToVault(trackId: string, tags: string, note: string, nostalgia: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { error: "Not logged in" };

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { error: "User not found" };

    const track = await getTrackDetails(trackId);
    
    await prisma.savedSong.create({
      data: {
        userId: user.id,
        spotifyId: track.id,
        spotifyUri: track.uri,
        title: track.name,
        artist: track.artists.map((a:any) => a.name).join(", "),
        albumArt: track.album.images[0]?.url,
        tags,
        note,
        nostalgia,
      }
    });

    return { success: true };
  } catch (error) {
    console.error("saveTrackToVault error", error);
    return { error: "Failed to save track" };
  }
}

export async function getVaultTracks() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return [];

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return [];

    const tracks = await prisma.savedSong.findMany({
      where: { userId: user.id },
      orderBy: { dateSaved: 'desc' }
    });

    return tracks;
  } catch (error) {
    console.error("getVaultTracks error", error);
    return [];
  }
}
