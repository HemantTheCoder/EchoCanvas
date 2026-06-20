async function test() {
  try {
    const res = await fetch('https://api.lyrics.ovh/v1/Coldplay/Yellow');
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    console.log("Lyrics OK:", data.lyrics ? data.lyrics.substring(0, 50) + "..." : "No lyrics");
  } catch (e) {
    console.error("Lyrics Error:", e.message);
  }
}
test();
