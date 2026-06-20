import { getVaultTracks } from "@/app/actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

export default async function VaultPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  const tracks = await getVaultTracks();

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 flex flex-col gap-10">
      
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Memory Vault</h1>
        <p className="text-gray-400">Your personal collection of saved tracks, memories, and nostalgia.</p>
      </div>

      {tracks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4 mt-20">
          <p>Your vault is empty.</p>
          <Link href="/search" className="bg-primary text-black px-6 py-2 rounded-full font-semibold hover:bg-primary/90 transition-colors">
            Search for a track
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tracks.map((track) => (
            <Link 
              key={track.id} 
              href={`/track/${track.spotifyId}`}
              className="glass-panel p-5 flex flex-col gap-4 group hover:border-primary/50 transition-colors"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-md overflow-hidden bg-white/5 flex-shrink-0">
                  {track.albumArt && (
                    <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  )}
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <h3 className="font-bold text-white truncate group-hover:text-primary transition-colors text-lg">{track.title}</h3>
                  <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                  <p className="text-xs text-gray-500 mt-auto">Saved {format(new Date(track.dateSaved), "MMM d, yyyy")}</p>
                </div>
                {track.nostalgia > 0 && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold border border-accent/30 glow-accent">
                    {track.nostalgia}
                  </div>
                )}
              </div>
              
              {track.tags && (
                <div className="flex flex-wrap gap-2">
                  {track.tags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                    <span key={t} className="px-2 py-1 rounded bg-white/10 text-xs text-gray-300">#{t}</span>
                  ))}
                </div>
              )}
              
              {track.note && (
                <div className="p-3 bg-black/40 rounded border border-white/5 text-sm text-gray-300 italic relative">
                  <span className="absolute -left-1 -top-2 text-2xl text-white/20">"</span>
                  {track.note}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
