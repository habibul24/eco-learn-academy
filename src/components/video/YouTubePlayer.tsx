
import React, { useEffect, useRef } from "react";
import { supabase, validateSupabaseClient } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { withRetry } from "@/utils/retryUtils";
import { PlayerLoading } from "./PlayerLoading";
import type { User } from "@supabase/supabase-js";
import MarkCompleteButton from "./MarkCompleteButton";

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
  const [showComplete, setShowComplete] = React.useState(false);

  useEffect(() => {
    completeMarkRef.current = false;
    setShowComplete(false);
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

  // Poll video time to detect ALMOST finished
  useEffect(() => {
    let poller: NodeJS.Timeout | null = null;

    function maybeTriggerComplete(force: boolean = false) {
      if (
        !playerRef.current ||
        typeof playerRef.current.getCurrentTime !== "function" ||
        typeof playerRef.current.getDuration !== "function" ||
        completeMarkRef.current
      ) {
        return;
      }
      try {
        const duration = playerRef.current.getDuration();
        const current = playerRef.current.getCurrentTime();
        const left = duration > 0 ? duration - current : null;

        if (duration > 0 && current > 0 && (duration - current < 12 && duration - current > 2.5)) {
          if (!showComplete) {
            setShowComplete(true);
          }
        }

        if (duration > 0) {
          if ((left !== null && left < 2.5 && duration > 15) || force) {
            if (!completeMarkRef.current) {
              if (onComplete) onComplete();
              completeMarkRef.current = true;
              setShowComplete(false);
            }
          }
        }
      } catch (e) {
        // Poll error
      }
    }

    if (playerReady) {
      poller = setInterval(() => maybeTriggerComplete(), 500);
    }
    return () => {
      if (poller) clearInterval(poller);
    };
  }, [playerReady, onComplete, videoId, showComplete]);

  useEffect(() => {
    if (!videoId || !videoDbId || !user || !containerRef.current) {
      return;
    }

    const onYouTubeIframeAPIReady = () => {
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
              if (event.data === 0 && !completeMarkRef.current) {
                completeMarkRef.current = true;
                if (onComplete) onComplete();
                setShowComplete(false);
              }
            },
            onError: (err: any) => {
              toast({
                variant: "destructive",
                title: "Video player error",
                description: `Could not play YouTube video (${err?.data || err})`,
              });
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
  }, [videoId, user, videoDbId, toast, onComplete]);

  return (
    <div className="w-full h-full min-h-[260px] relative">
      <div
        ref={containerRef}
        className="w-full h-full min-h-[260px] rounded-lg"
        id="youtube-player"
      />
      {!playerReady && <PlayerLoading />}
      {showComplete && (
        <div className="absolute left-0 right-0 bottom-16 flex justify-center z-30">
          <MarkCompleteButton
            onClick={() => {
              if (!completeMarkRef.current) {
                if (onComplete) onComplete();
                completeMarkRef.current = true;
                setShowComplete(false);
              }
            }}
            loading={false}
          />
        </div>
      )}
    </div>
  );
};

