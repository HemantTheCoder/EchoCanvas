import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import SpotifyWebApi from "spotify-web-api-node";

export async function getSpotifyClient() {
  const session = await getServerSession(authOptions);

  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  if (session?.user?.accessToken) {
    spotifyApi.setAccessToken(session.user.accessToken);
  }

  return spotifyApi;
}

export async function searchSpotify(query: string, types: ('album' | 'artist' | 'playlist' | 'track' | 'show' | 'episode')[] = ["track", "artist", "album"]) {
  const client = await getSpotifyClient();
  const res: any = await client.search(query, types as any, { limit: 10 });
  return res.body;
}

export async function getTrackDetails(trackId: string) {
  const client = await getSpotifyClient();
  const res = await client.getTrack(trackId);
  return res.body;
}

export async function getAudioFeatures(trackId: string) {
  const client = await getSpotifyClient();
  const res = await client.getAudioFeaturesForTrack(trackId);
  return res.body;
}

export async function getSimilarTracks(seedTrackId: string, artistName: string) {
  const client = await getSpotifyClient();
  try {
    // Fallback: Since getRecommendations is deprecated, we search for more tracks by this artist
    const res: any = await client.searchTracks(`artist:${artistName}`, { limit: 10 });
    return res.body;
  } catch (e) {
    console.error("Fallback search failed", e);
    return { tracks: { items: [] } };
  }
}
