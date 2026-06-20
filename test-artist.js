const SpotifyWebApi = require('spotify-web-api-node');

async function test() {
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  const data = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(data.body['access_token']);

  try {
    const track = await spotifyApi.getTrack('11dFghVXANMlKmJXsNCbNl');
    const artistId = track.body.artists[0].id;
    
    const topTracks = await spotifyApi.getArtistTopTracks(artistId, 'US');
    console.log("Top Tracks OK:", topTracks.body.tracks.length);
  } catch (e) {
    console.error("ERROR:", e);
  }
}

test();
