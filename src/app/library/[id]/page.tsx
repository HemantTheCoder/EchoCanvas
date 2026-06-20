import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPlaylistDetails, searchSpotify } from "@/lib/spotify-server";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

export default async function PlaylistDashboard({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  let playlist;
  try {
    playlist = await getPlaylistDetails(params.id);
  } catch (error) {
    redirect("/library");
  }

  // Extract artists from the first 20 tracks to generate recommendations
  const artistCounts: Record<string, number> = {};
  playlist.tracks.items.slice(0, 20).forEach((item: any) => {
    if (item.track && item.track.artists[0]) {
      const artistName = item.track.artists[0].name;
      artistCounts[artistName] = (artistCounts[artistName] || 0) + 1;
    }
  });

  // Find the most prominent artist in this playlist
  const topArtist = Object.entries(artistCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  
  let recommendations: any[] = [];
  if (topArtist) {
    try {
      const searchRes = await searchSpotify(`artist:${topArtist}`, ["track"]);
      recommendations = searchRes.tracks?.items || [];
    } catch (e) {
      console.error("Failed to generate recommendations", e);
    }
  }

  return (
    <div className="flex-1 flex flex-col pt-24 px-8 pb-32 max-w-7xl mx-auto w-full">
      
      {/* Playlist Header */}
      <div className="flex flex-col md:flex-row gap-8 items-end mb-12">
        <div className="w-52 h-52 flex-shrink-0 shadow-2xl relative rounded-xl overflow-hidden">
          {playlist.images?.[0]?.url ? (
            <Image src={playlist.images[0].url} alt={playlist.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center">No Cover</div>
          )}
        </div>
        
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-widest text-primary font-bold">Playlist</span>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
            {playlist.name}
          </h1>
          <p className="text-gray-400 mt-2 max-w-2xl text-lg">
            {playlist.description || "No description provided."}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2 font-medium">
            <span className="text-white">{playlist.owner.display_name}</span>
            <span>•</span>
            <span>{playlist.tracks.total} songs</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Playlist Tracks */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-white mb-2">Tracks</h2>
          <div className="flex flex-col gap-2">
            {playlist.tracks.items.map((item: any, index: number) => {
              const track = item.track;
              if (!track) return null;
              
              return (
                <Link 
                  key={`${track.id}-${index}`}
                  href={`/track/${track.id}`}
                  className="flex items-center gap-4 p-3 rounded-md hover:bg-white/5 transition-colors group"
                >
                  <span className="text-gray-500 w-4 text-right font-mono text-xs">{index + 1}</span>
                  <div className="w-10 h-10 bg-white/10 relative rounded overflow-hidden flex-shrink-0">
                    {track.album.images[0]?.url && (
                      <Image src={track.album.images[0].url} alt={track.album.name} fill className="object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="fill-white w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-white font-medium truncate group-hover:text-primary transition-colors">
                      {track.name}
                    </span>
                    <span className="text-gray-500 text-xs truncate">
                      {track.artists.map((a: any) => a.name).join(", ")}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs hidden md:block w-1/3 truncate">
                    {track.album.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Smart Recommendations */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white mb-2">Curated for this Vibe</h2>
          {topArtist && (
            <p className="text-xs text-gray-400 mb-4 uppercase tracking-widest">
              Based on {topArtist}
            </p>
          )}
          
          <div className="flex flex-col gap-3 glass-panel p-6">
            {recommendations.slice(0, 8).map((track: any) => (
              <Link 
                key={track.id}
                href={`/track/${track.id}`}
                className="flex items-center gap-3 p-2 rounded hover:bg-white/10 transition-colors group"
              >
                <div className="w-12 h-12 rounded-sm overflow-hidden relative">
                  {track.album.images[0]?.url && (
                    <Image src={track.album.images[0].url} alt={track.album.name} fill className="object-cover" />
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-white text-sm font-semibold truncate group-hover:text-primary transition-colors">
                    {track.name}
                  </span>
                  <span className="text-gray-400 text-xs truncate">
                    {track.artists[0]?.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
