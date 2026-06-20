import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserPlaylists } from "@/lib/spotify-server";
import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "lucide-react";

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  let playlists;
  try {
    playlists = await getUserPlaylists();
  } catch (error) {
    console.error("Failed to fetch playlists:", error);
    // If we fail here, the user likely needs to re-login to grant new scopes
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-20">
        <h1 className="text-4xl font-extrabold text-white mb-4">Re-Login Required</h1>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          We recently added the ability to sync your Spotify Playlists! However, we need you to sign out and connect Spotify again to grant the new permissions.
        </p>
        <Link 
          href="/api/auth/signout" 
          className="bg-primary text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
        >
          Sign Out & Reconnect
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-8 pt-24 max-w-7xl mx-auto w-full">
      <h1 className="text-4xl font-extrabold text-white mb-2">My Vibe Library</h1>
      <p className="text-gray-400 mb-10">Select a playlist to launch EchoCanvas</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {playlists.items.map((playlist: any) => (
          <Link 
            key={playlist.id} 
            href={`/library/${playlist.id}`}
            className="group flex flex-col gap-4 bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-full aspect-square rounded-md overflow-hidden relative shadow-lg">
              {playlist.images?.[0]?.url ? (
                <Image 
                  src={playlist.images[0].url} 
                  alt={playlist.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <span className="text-gray-500 text-xs uppercase font-bold tracking-widest">No Cover</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <PlayCircle size={48} className="text-primary glow-accent" />
              </div>
            </div>

            <div className="flex flex-col">
              <h2 className="text-white font-bold truncate group-hover:text-primary transition-colors">
                {playlist.name}
              </h2>
              <span className="text-gray-400 text-xs mt-1 truncate">
                {playlist.tracks.total} Tracks • By {playlist.owner.display_name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
