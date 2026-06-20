import { searchSpotify } from "@/lib/spotify-server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Play } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === "string" ? resolvedParams.q : "";

  let results = null;
  if (q) {
    try {
      results = await searchSpotify(q, ["track"]);
    } catch (error) {
      console.error("Search failed:", error);
    }
  }

  const tracks = results?.tracks?.items || [];

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 flex flex-col gap-8">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Search Results</h1>
        {q ? (
          <p className="text-gray-400">Showing results for <span className="text-white font-semibold">"{q}"</span></p>
        ) : (
          <p className="text-gray-400">Enter a search term above to find tracks.</p>
        )}
      </div>

      {q && tracks.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          No tracks found. Try a different search term.
        </div>
      )}

      {tracks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tracks.map((track: any) => (
            <Link 
              key={track.id} 
              href={`/track/${track.id}`}
              className="glass-panel p-4 flex flex-col gap-4 group hover:bg-white/5 transition-colors"
            >
              <div className="relative aspect-square w-full rounded-md overflow-hidden bg-white/5">
                {track.album.images[0]?.url && (
                  <img 
                    src={track.album.images[0].url} 
                    alt={track.album.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center glow-accent">
                    <Play className="fill-black text-black ml-1" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                <span className="font-semibold truncate text-white group-hover:text-primary transition-colors">
                  {track.name}
                </span>
                <span className="text-sm text-gray-400 truncate">
                  {track.artists.map((a: any) => a.name).join(", ")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
