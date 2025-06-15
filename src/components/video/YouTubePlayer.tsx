import React, { useEffect, useRef } from "react";
import { supabase, validateSupabaseClient } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { withRetry } from "@/utils/retryUtils";
import { PlayerLoading } from "./PlayerLoading";
import type { User } from "@supabase/supabase-js";

type YouTubePlayerProps = {
  videoId: string;
  courseTitle: string;
  user: User | null;
  videoDbId?: number;
  onComplete?: () => void;
};

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  courseTitle,
  user,
  videoDbId,
  onComplete,
}) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [playerReady, setPlayerReady] = React.useState(false);
  const completeMarkRef = useRef(false);

  useEffect(() => {
    completeMarkRef.current = false;
  }, [videoId, videoDbId, user?.id]);

  // Load YouTube IFrame API script
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!videoId || !videoDbId || !user || !containerRef.current) {
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
          videoId: videoId,
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
                  console.log("[YouTubePlayer] Attempting to upsert watched progress for:", { videoId: videoDbId, userId: user.id });
                  
                  const result = await withRetry(async () => {
                    validateSupabaseClient();
                    // ADDED: wrap the upsert with extra error debug logs
                    const upsertObj = {
                      user_id: user.id,
                      video_id: videoDbId,
                      watched: true,
                      progress_percentage: 100,
                    };
                    const { error, data } = await supabase
                      .from("user_progress")
                      .upsert(upsertObj)
                      .select();

                    if (error) {
                      console.error("[YouTubePlayer][UPSERT] Database error:", error, "For upsert obj:", upsertObj);
                      // Show toast immediately if error
                      toast({
                        variant: "destructive",
                        title: "Progress save failed (upsert error)!",
                        description: error.message || "Could not save your progress.",
                      });
                      throw error; // Also throw so withRetry handles it
                    } else {
                      console.log("[YouTubePlayer][UPSERT] Success! Data:", data);
                    }

                    return data;
                  });

                  if (!result || result.length === 0) {
                    console.warn("[YouTubePlayer][UPSERT] No data returned after upsert");
                    toast({
                      variant: "destructive",
                      title: "Progress not saved",
                      description: "Could not save your progress. You may not be enrolled or signed in properly.",
                    });
                  } else {
                    console.log("[YouTubePlayer][UPSERT] Progress saved successfully:", result);
                    toast({
                      title: "Video completed!",
                      description: "Your progress has been saved.",
                    });
                    if (onComplete) onComplete();
                  }
                } catch (e) {
                  console.error("[YouTubePlayer][UPSERT] Final error after retries:", e);
                  toast({
                    variant: "destructive",
                    title: "Progress save failed (upsert failed)!",
                    description: "Could not save your progress. Please try refreshing the page.",
                  });
                }
              }
            },
            onError: (err: any) => {
              toast({
                variant: "destructive",
                title: "Video player error",
                description: `Could not play YouTube video (${err?.data || err})`,
              });
              console.error("[YouTubePlayer] YouTube player error:", err);
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
  }, [videoId, user, videoDbId, toast, onComplete]);

  return (
    <div className="w-full h-full min-h-[260px] relative">
      <div
        ref={containerRef}
        className="w-full h-full min-h-[260px] rounded-lg"
        id="youtube-player"
      />
      {!playerReady && <PlayerLoading />}
    </div>
  );
};
