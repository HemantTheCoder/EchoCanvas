const SpotifyWebApi = require('spotify-web-api-node');

async function test() {
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  const data = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(data.body['access_token']);

  try {
    const recs = await spotifyApi.getRecommendations({
      seed_tracks: ['11dFghVXANMlKmJXsNCbNl'],
      limit: 10
    });
    console.log("Recs OK:", recs.body.tracks.length);
  } catch (e) {
    console.error("ERROR:", e);
  }
}

test();
