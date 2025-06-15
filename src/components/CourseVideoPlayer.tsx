
import React, { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useToast } from "@/components/ui/use-toast";

/**
 * Extract YouTube video ID from a YouTube URL (support various url formats)
 */
function getYoutubeVideoId(url?: string | null): string | null {
  if (!url) return null;
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
  const completeMarkRef = useRef(false);

  useEffect(() => {
    completeMarkRef.current = false;
  }, [ytVideoId, videoId, user?.id]);

  // Load YouTube IFrame API script only if it's a youtube video
  useEffect(() => {
    if (!ytVideoId) return;
    if ((window as any).YT && (window as any).YT.Player) return;

    const scriptTag = document.createElement("script");
    scriptTag.src = "https://www.youtube.com/iframe_api";
    scriptTag.async = true;
    document.body.appendChild(scriptTag);

    return () => {
      document.body.removeChild(scriptTag);
    };
  }, [ytVideoId]);

  useEffect(() => {
    if (!ytVideoId || !user || !videoId) {
      console.log("[VideoPlayer] Early exit: ytVideoId, user, or videoId missing", {
        ytVideoId,
        user,
        videoId
      });
      return;
    }

    // Enhanced debug: check for and log the containerRef
    if (!containerRef.current) {
      console.error("[VideoPlayer] containerRef.current is null! Cannot initialize player.");
      toast({
        variant: "destructive",
        title: "Error loading video player",
        description: "The video container could not be found. Try reloading.",
      });
      return;
    }

    const onYouTubeIframeAPIReady = () => {
      // Remove old player instance if exists
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      // eslint-disable-next-line no-console
      console.log("[VideoPlayer] Initializing YouTube Player with videoId:", ytVideoId, "on element:", containerRef.current);

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
            onReady: () => {
              setPlayerReady(true);
              // eslint-disable-next-line no-console
              console.log("[VideoPlayer] YouTube player is ready");
            },
            onStateChange: async (event: any) => {
              // eslint-disable-next-line no-console
              console.log("[VideoPlayer] onStateChange fired", { data: event.data });
              // 0: ended, 1: playing, 2: paused, etc.
              if (event.data === 0 && !completeMarkRef.current) {
                completeMarkRef.current = true;
                // eslint-disable-next-line no-console
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

                // eslint-disable-next-line no-console
                if (error) {
                  console.error("[VideoPlayer] Error marking video watched:", error);
                  toast({
                    variant: "destructive",
                    title: "Error marking video as completed",
                    description: error.message,
                  });
                } else {
                  toast({
                    title: "Video marked as watched!",
                    description: "Your progress has been updated for this video.",
                  });
                  // eslint-disable-next-line no-console
                  console.log("[VideoPlayer] Marked video as watched:", data);
                  if (onComplete) onComplete();
                }
              }
            },
            onError: (err: any) => {
              toast({
                variant: "destructive",
                title: "Video player error",
                description: `Could not play YouTube video (${err?.data || err})`,
              });
              // eslint-disable-next-line no-console
              console.error("[VideoPlayer] YouTube player error:", err);
            },
          },
        }
      );
    };

    // If the API is already loaded
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

  // For non-YouTube videos, embed as plain iframe
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

