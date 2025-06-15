
import React, { useEffect, useRef } from "react";
import { supabase, validateSupabaseClient } from "@/integrations/supabase/client";
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
      if (document.body.contains(scriptTag)) {
        document.body.removeChild(scriptTag);
      }
    };
  }, [ytVideoId]);

  useEffect(() => {
    if (!ytVideoId || !videoId || !user || !containerRef.current) {
      return;
    }

    const onYouTubeIframeAPIReady = () => {
      // Remove old player instance if exists
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        playerRef.current.destroy();
        playerRef.current = null;
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
            onReady: () => {
              setPlayerReady(true);
            },
            onStateChange: async (event: any) => {
              // 0: ended, 1: playing, 2: paused, etc.
              if (event.data === 0 && !completeMarkRef.current) {
                completeMarkRef.current = true;

                try {
                  // Validate client before database operation
                  validateSupabaseClient();
                  
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
                    console.error("[VideoPlayer] Error marking video watched:", error);
                    toast({
                      variant: "destructive",
                      title: "Error marking video as completed",
                      description: error.message + (error.code ? ` (code: ${error.code})` : ""),
                    });
                  } else if (!data || data.length === 0) {
                    toast({
                      variant: "destructive",
                      title: "Progress not saved!",
                      description: "Your progress was not recorded. This may happen if you are not enrolled, not signed in, or due to access issues.",
                    });
                  } else {
                    toast({
                      title: "Video marked as watched!",
                      description: "Your progress has been updated for this video.",
                    });
                    if (onComplete) onComplete();
                  }
                } catch (e) {
                  toast({
                    variant: "destructive",
                    title: "Database error",
                    description: "Could not save progress - please refresh the page and try again.",
                  });
                  console.error("[VideoPlayer] Exception during progress update:", e);
                }
              }
            },
            onError: (err: any) => {
              toast({
                variant: "destructive",
                title: "Video player error",
                description: `Could not play YouTube video (${err?.data || err})`,
              });
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
  }, [ytVideoId, user, videoId, toast, onComplete]);

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

  // Show visual warning if user not signed in
  if (!user) {
    return (
      <div className="rounded-lg overflow-hidden mb-4 aspect-video bg-yellow-50 border border-yellow-300 flex flex-col items-center justify-center p-8">
        <div className="text-yellow-900 font-semibold mb-2">
          You must be signed in to track your course progress.
        </div>
        <div className="text-yellow-700 text-sm">
          Please <b>log in</b> to continue tracking your earned progress.
        </div>
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
