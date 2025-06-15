
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

// --- DEBUG header component
const DebugHeader = ({ videoId, videoDbId, user }) => (
  <div className="bg-red-300 text-red-900 text-lg font-bold text-center p-3 w-full rounded mb-3 border-2 border-red-600">
    DEBUG: YouTubePlayer ACTIVE<br/>
    videoId: <span className="font-mono">{videoId}</span> &nbsp; | &nbsp;
    videoDbId: <span className="font-mono">{videoDbId ?? "null"}</span> &nbsp; | &nbsp;
    user: <span className="font-mono">{user?.id ?? "null"}</span>
  </div>
);

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

  // For debug fallback
  const [debugShowComplete, setDebugShowComplete] = React.useState(false);

  useEffect(() => {
    completeMarkRef.current = false;
    setDebugShowComplete(false);
    console.log("[YouTubePlayer] RESET on videoId, videoDbId, user?.id", { videoId, videoDbId, user });
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

  // Poll video time to detect ALMOST finished + DEBUG LOGS
  useEffect(() => {
    let poller: NodeJS.Timeout | null = null;

    function maybeTriggerComplete(force: boolean = false) {
      if (
        !playerRef.current ||
        typeof playerRef.current.getCurrentTime !== "function" ||
        typeof playerRef.current.getDuration !== "function" ||
        completeMarkRef.current
      ) {
        console.log("[YouTubePlayer] Skipping poll: playerRef", playerRef.current, "playerReady", playerReady, "completeMarkRef", completeMarkRef.current);
        return;
      }
      try {
        const duration = playerRef.current.getDuration();
        const current = playerRef.current.getCurrentTime();
        const left = duration > 0 ? duration - current : null;
        console.log("[YouTubePlayer] polling current/duration:", {current, duration, left});

        if (duration > 0 && current > 0 && (duration - current < 12 && duration - current > 2.5)) {
          if (!debugShowComplete) {
            setDebugShowComplete(true);
            console.log("[YouTubePlayer] Setting debugShowComplete TRUE", {current, duration, left});
          }
        }

        if (duration > 0) {
          if ((left !== null && left < 2.5 && duration > 15) || force) {
            if (!completeMarkRef.current) {
              console.log("[YouTubePlayer] TRIGGERING onComplete", {current, duration, left, force});
              if (onComplete) onComplete();
              completeMarkRef.current = true;
              setDebugShowComplete(false);
            }
          }
        }
      } catch (e) {
        console.warn("[YouTubePlayer] Error in poll:", e);
      }
    }

    if (playerReady) {
      console.log("[YouTubePlayer] Polling started — playerReady");
      poller = setInterval(() => maybeTriggerComplete(), 500);
    } else {
      console.log("[YouTubePlayer] Polling NOT started, playerReady?", playerReady);
    }
    return () => {
      if (poller) clearInterval(poller);
    };
  }, [playerReady, onComplete, videoId, debugShowComplete]);

  useEffect(() => {
    if (!videoId || !videoDbId || !user || !containerRef.current) {
      console.log("[YouTubePlayer] Skipping player init: missing dependency", {videoId, videoDbId, user, container: !!containerRef.current});
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
              console.log("[YouTubePlayer] Player ready", playerRef.current);
            },
            onStateChange: (event: any) => {
              if (event.data === 0 && !completeMarkRef.current) {
                completeMarkRef.current = true;
                if (onComplete) onComplete();
                setDebugShowComplete(false);
                console.log("[YouTubePlayer] YT Event: ended");
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

  // DEBUG: always print state on render and render fallback button if playerReady
  console.log("[YouTubePlayer RENDER] playerReady", playerReady, "debugShowComplete", debugShowComplete, "videoId", videoId, "videoDbId", videoDbId, "user?.id", user?.id);

  return (
    <div className="w-full h-full min-h-[260px] relative">
      <DebugHeader videoId={videoId} videoDbId={videoDbId} user={user} />
      {/* Super prominent fake always-visible complete button */}
      <div className="my-6 flex flex-col items-center justify-center bg-yellow-200 border-4 border-yellow-500 p-4 rounded shadow-lg">
        <button
          onClick={() => {
            alert("DEBUG: YouTubePlayer is mounted! (Button Clicked)");
          }}
          className="bg-red-600 text-white text-lg font-semibold px-6 py-3 rounded shadow-lg border-4 border-red-700 animate-pulse"
        >
          DEBUG: YouTubePlayer is rendered! (Click me)
        </button>
        <div className="mt-2 text-red-800 font-bold">If you see this, the YouTubePlayer is mounting.</div>
      </div>
      <div
        ref={containerRef}
        className="w-full h-full min-h-[260px] rounded-lg"
        id="youtube-player"
      />
      {!playerReady && <PlayerLoading />}
      {/* Fallback debug button, forced always on test */}
      <div className="absolute left-0 right-0 bottom-36 flex justify-center z-40">
        <MarkCompleteButton
          onClick={() => {
            if (!completeMarkRef.current) {
              if (onComplete) onComplete();
              completeMarkRef.current = true;
              setDebugShowComplete(false);
              console.log("[YouTubePlayer] TEST/FORCED Mark Complete pressed");
            }
          }}
          loading={false}
        />
        <span className="ml-3 bg-yellow-300/80 px-2 py-1 rounded text-sm font-mono text-yellow-900 shadow">
          DEBUG: BUTTON ALWAYS ON
        </span>
      </div>
      {debugShowComplete && (
        <div className="absolute left-0 right-0 bottom-16 flex justify-center z-30">
          <MarkCompleteButton
            onClick={() => {
              if (!completeMarkRef.current) {
                if (onComplete) onComplete();
                completeMarkRef.current = true;
                setDebugShowComplete(false);
                console.log("[YouTubePlayer] Fallback: manual Mark Complete button pressed");
              }
            }}
            loading={false}
          />
        </div>
      )}
    </div>
  );
};
