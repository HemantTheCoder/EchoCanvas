const SpotifyWebApi = require('spotify-web-api-node');

async function test() {
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  const data = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(data.body['access_token']);

  try {
    const analysis = await spotifyApi.getAudioAnalysisForTrack('11dFghVXANMlKmJXsNCbNl');
    console.log("Analysis OK, Beats:", analysis.body.beats.length);
  } catch (e) {
    console.error("ERROR:", e.statusCode);
  }
}

test();
