import React, { useEffect, useRef } from "react";
import { supabase, validateSupabaseClient } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { withRetry } from "@/utils/retryUtils";
import { PlayerLoading } from "./PlayerLoading";
import type { User } from "@supabase/supabase-js";

type YouTubePlayerProps = {
  videoId: string;
  courseTitle: string;
  user: any;
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
            onStateChange: (event: any) => {
              // 0: ended
              if (event.data === 0 && !completeMarkRef.current) {
                completeMarkRef.current = true;
                if (onComplete) onComplete(); // Now delegates save to outer button
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
