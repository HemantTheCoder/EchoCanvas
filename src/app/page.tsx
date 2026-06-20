"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Sparkles, LayoutDashboard } from "lucide-react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If already logged in, we could redirect to a dashboard or search,
  // but let's let them stay on the landing page if they want, or offer a quick jump.

  if (status === "loading") {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] absolute -top-40 -left-40 mix-blend-screen" />
        <div className="w-[600px] h-[600px] bg-accent/20 rounded-full blur-[100px] absolute bottom-0 right-0 mix-blend-screen" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 text-center max-w-3xl"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          See the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent glow-text">Music</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
          EchoCanvas transforms your Spotify library into an immersive visual world. 
          Analyze the DNA of your favorite tracks, save musical memories, and watch sound come alive.
        </p>

        {session ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => router.push("/search")}
              className="bg-white text-black px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Play size={20} className="fill-black" />
              Start Exploring
            </button>
            <button 
              onClick={() => router.push("/vault")}
              className="glass-panel px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-white/10 transition-colors"
            >
              <LayoutDashboard size={20} />
              Open Vault
            </button>
          </div>
        ) : (
          <button 
            onClick={() => signIn("spotify")}
            className="bg-primary hover:bg-primary/90 text-black px-10 py-4 rounded-full font-bold text-lg flex items-center gap-3 mx-auto transition-all hover:scale-105 glow-accent"
          >
            <Sparkles size={24} />
            Connect Spotify to Begin
          </button>
        )}
      </motion.div>
    </div>
  );
}
