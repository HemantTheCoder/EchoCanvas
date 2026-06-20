"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Search, User, Music, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 py-3 px-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center group-hover:scale-105 transition-transform glow-accent">
          <Music size={16} className="text-black" />
        </div>
        <span className="text-xl font-bold tracking-tight">
          Echo<span className="text-primary glow-text">Canvas</span>
        </span>
      </Link>

      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search for a song, artist, or album..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white placeholder:text-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="flex items-center gap-4">
        {session ? (
          <>
            <Link href="/library" className="text-sm text-gray-300 hover:text-white transition-colors hidden sm:block">
              Library
            </Link>
            <Link href="/vault" className="text-sm text-gray-300 hover:text-white transition-colors hidden sm:block">
              Memory Vault
            </Link>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <button
                onClick={() => signOut()}
                className="text-gray-400 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
              {session.user?.image ? (
                <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full border border-white/20" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <User size={16} className="text-gray-300" />
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={() => signIn("spotify")}
            className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-full text-sm transition-all glow-accent flex items-center gap-2"
          >
            <LogIn size={16} />
            Connect Spotify
          </button>
        )}
      </div>
    </nav>
  );
}
