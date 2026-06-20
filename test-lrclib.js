async function test() {
  try {
    const res = await fetch('https://lrclib.net/api/get?artist_name=Coldplay&track_name=Yellow', {
      headers: {
        'User-Agent': 'EchoCanvas v0.1.0 (https://github.com/HemantTheCoder/EchoCanvas)'
      }
    });
    if (!res.ok) throw new Error("Status " + res.status);
    const data = await res.json();
    console.log("LRCLIB Success!");
    console.log("Has Synced Lyrics:", !!data.syncedLyrics);
    console.log(data.syncedLyrics ? data.syncedLyrics.substring(0, 200) : "No synced lyrics");
  } catch(e) {
    console.error("LRCLIB Error:", e.message);
  }
}
test();
