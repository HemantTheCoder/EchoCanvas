import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import SpotifyWebApi from "spotify-web-api-node";

export async function getSpotifyClient() {
  const session = await getServerSession(authOptions);

  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  // @ts-expect-error - Custom properties on session
  if (session?.user?.accessToken) {
    // @ts-expect-error - Custom properties on session
    spotifyApi.setAccessToken(session.user.accessToken);
  }

  return spotifyApi;
}

export async function searchSpotify(query: string, types: ('album' | 'artist' | 'playlist' | 'track' | 'show' | 'episode' | 'audiobook')[] = ["track", "artist", "album"]) {
  const client = await getSpotifyClient();
  const res = await client.search(query, types, { limit: 10 });
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

export async function getSimilarTracks(seedTracks: string[]) {
  const client = await getSpotifyClient();
  const res = await client.getRecommendations({
    seed_tracks: seedTracks,
    limit: 10,
  });
  return res.body;
}
