export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[800px] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-primary/20 blur-[150px] animate-pulse"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-white/10 border-t-primary animate-spin"></div>
          <div className="absolute w-16 h-16 rounded-full border-4 border-white/5 border-b-secondary animate-spin-reverse"></div>
          {/* Inner core */}
          <div className="absolute w-8 h-8 rounded-full bg-primary animate-pulse glow-accent"></div>
        </div>
        
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black tracking-widest uppercase glow-text">Tuning in...</h2>
          <p className="text-gray-400 font-medium">Fetching tracks, audio features, and synced lyrics</p>
        </div>
      </div>
    </div>
  );
}
