import React, { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useToast } from "@/components/ui/use-toast";

/**
 * Extract YouTube video ID from a YouTube URL (support various url formats)
 */
function getYoutubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  // Typical formats: https://www.youtube.com/watch?v=VIDEO_ID
  // or https://youtu.be/VIDEO_ID
  const youtubeRegex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeRegex);
  return match ? match[1] : null;
}

type CourseVideoPlayerProps = {
  videoUrl: string | null;
  courseTitle: string;
  fallbackImage?: string;
  videoId?: number;
  onComplete?: () => void;
};

// Small loader for player
const PlayerLoading = () => (
  <div className="w-full h-full flex items-center justify-center text-green-900 bg-white/50">
    Loading video...
  </div>
);

export default function CourseVideoPlayer({
  videoUrl,
  courseTitle,
  fallbackImage,
  videoId,
  onComplete,
}: CourseVideoPlayerProps) {
  const { user } = useAuthUser();
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const ytVideoId = getYoutubeVideoId(videoUrl ?? "");
  const [playerReady, setPlayerReady] = React.useState(false);
  // Used to prevent duplicate onComplete upserts
  const completeMarkRef = useRef(false);

  useEffect(() => {
    completeMarkRef.current = false;
  }, [ytVideoId, videoId, user?.id]); // Reset on video/user change

  // Load YouTube IFrame API script only if it's a youtube video
  useEffect(() => {
    if (!ytVideoId) return;
    if ((window as any).YT && (window as any).YT.Player) return; // already loaded

    const scriptTag = document.createElement("script");
    scriptTag.src = "https://www.youtube.com/iframe_api";
    scriptTag.async = true;
    document.body.appendChild(scriptTag);

    return () => {
      // Prevent duplicate scripts
      document.body.removeChild(scriptTag);
    };
  }, [ytVideoId]);

  // Create the YouTube player and listen for events
  useEffect(() => {
    if (!ytVideoId || !user || !videoId) return;

    const onYouTubeIframeAPIReady = () => {
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        playerRef.current.destroy();
      }
      playerRef.current = new (window as any).YT.Player(
        containerRef.current,
        {
          videoId: ytVideoId,
          playerVars: {
            controls: 1,
            showinfo: 0,
            rel: 0,
            modestbranding: 1,
            autoplay: 0,
          },
          events: {
            onReady: () => setPlayerReady(true),
            onStateChange: async (event: any) => {
              // State 0 means ended, see: https://developers.google.com/youtube/iframe_api_reference#onStateChange
              if (event.data === 0 && !completeMarkRef.current) {
                completeMarkRef.current = true; // mark as completed to avoid multiple upserts
                console.log("[VideoPlayer] Video ended, marking watched for uid:", user.id, "videoId:", videoId);
                const { error, data } = await supabase
                  .from("user_progress")
                  .upsert({
                    user_id: user.id,
                    video_id: videoId,
                    watched: true,
                    progress_percentage: 100,
                  })
                  .select();
                if (error) {
                  toast({
                    variant: "destructive",
                    title: "Error marking video as completed",
                    description: error.message,
                  });
                  console.error("[VideoPlayer] Error marking video watched:", error);
                } else {
                  toast({
                    title: "Video marked as watched!",
                    description: "Your progress has been updated for this video.",
                  });
                  console.log("[VideoPlayer] Marked video as watched:", data);
                  if (onComplete) onComplete();
                }
              }
            },
          },
        }
      );
    };

    if ((window as any).YT && (window as any).YT.Player) {
      onYouTubeIframeAPIReady();
    } else {
      (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ytVideoId, user, videoId]);

  // For non-YouTube videos, embed with iframe as before
  if (videoUrl && !ytVideoId) {
    return (
      <div className="rounded-lg overflow-hidden mb-4 aspect-video bg-black/5 border border-gray-200 flex justify-center items-center">
        <iframe
          src={videoUrl}
          title={courseTitle}
          className="w-full h-full min-h-[260px] rounded-lg"
          allowFullScreen
        />
      </div>
    );
  }

  // YouTube: show loader until ready
  return (
    <div className="rounded-lg overflow-hidden mb-4 aspect-video bg-black/5 border border-gray-200 flex justify-center items-center">
      {videoUrl ? (
        ytVideoId ? (
          <div className="w-full h-full min-h-[260px] relative">
            <div
              ref={containerRef}
              className="w-full h-full min-h-[260px] rounded-lg"
              id="youtube-player"
            />
            {!playerReady && <PlayerLoading />}
          </div>
        ) : (
          // unreachable here but fallback
          <iframe
            src={videoUrl}
            title={courseTitle}
            className="w-full h-full min-h-[260px] rounded-lg"
            allowFullScreen
          />
        )
      ) : (
        <img
          src={fallbackImage}
          alt="Course"
          className="w-full h-full object-cover rounded-lg"
        />
      )}
    </div>
  );
}
