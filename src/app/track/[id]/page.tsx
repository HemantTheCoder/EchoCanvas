import { getTrackDetails, getAudioFeatures, getSimilarTracks } from "@/lib/spotify-server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import TrackDashboard from "@/components/track/TrackDashboard";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  const { id } = await params;

  try {
    const track = await getTrackDetails(id);
    const audioFeatures = await getAudioFeatures(id);
    
    // We can also fetch similar tracks based on the track ID
    const similarTracksRes = await getSimilarTracks([id]);
    const similarTracks = similarTracksRes?.tracks || [];

    return (
      <div className="flex-1 flex flex-col relative w-full h-full min-h-[800px]">
        <TrackDashboard 
          track={track} 
          audioFeatures={audioFeatures} 
          similarTracks={similarTracks} 
        />
      </div>
    );
  } catch (error) {
    console.error("Failed to load track data", error);
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Error loading track</h2>
        <p className="text-gray-400">We couldn't fetch the details for this track. It might not exist or there was an issue with Spotify's API.</p>
      </div>
    );
  }
}
