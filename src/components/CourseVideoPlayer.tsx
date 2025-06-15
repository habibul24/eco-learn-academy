import React from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { getYoutubeVideoId } from "@/utils/youtubeUtils";
import { YouTubePlayer } from "./video/YouTubePlayer";
import { GenericVideoPlayer } from "./video/GenericVideoPlayer";
import { AuthWarning } from "./video/AuthWarning";
import { useToast } from "@/components/ui/use-toast";
import MarkCompleteButton from "./video/MarkCompleteButton";

type CourseVideoPlayerProps = {
  videoUrl: string | null;
  courseTitle: string;
  fallbackImage?: string;
  videoId?: number;
  onComplete?: () => void;
};

export default function CourseVideoPlayer({
  videoUrl,
  courseTitle,
  fallbackImage,
  videoId,
  onComplete,
}: CourseVideoPlayerProps) {
  const { user } = useAuthUser();
  const ytVideoId = getYoutubeVideoId(videoUrl ?? "");
  const { toast } = useToast();
  const [videoEnded, setVideoEnded] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [completed, setCompleted] = React.useState(false);

  React.useEffect(() => {
    setVideoEnded(false);
    setCompleted(false);
  }, [videoUrl]);

  // LOG WHICH VIDEO PLAYER is being chosen and with which IDs
  console.log("[CourseVideoPlayer DEBUG]", {
    videoUrl,
    ytVideoId,
    picked: videoUrl && ytVideoId ? "YouTubePlayer" : videoUrl ? "GenericVideoPlayer" : "Image fallback",
    userId: user?.id,
    courseTitle,
    videoId
  });

  if (!user) {
    return <AuthWarning />;
  }

  const handleMarkComplete = async () => {
    if (!user || !videoId) return;
    setSaving(true);
    try {
      const { supabase, validateSupabaseClient } = await import("@/integrations/supabase/client");
      validateSupabaseClient();
      const upsertObj = {
        user_id: user.id,
        video_id: videoId,
        watched: true,
        progress_percentage: 100,
      };
      const { error } = await supabase
        .from("user_progress")
        .upsert(upsertObj)
        .select();

      if (error) {
        toast({
          variant: "destructive",
          title: "Progress not saved!",
          description: error.message || "Could not save your progress.",
        });
        return;
      }
      toast({
        title: "Video completed!",
        description: "Your progress has been saved.",
      });
      setCompleted(true);
      if (onComplete) onComplete();
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Progress save failed!",
        description: e?.message || "Could not save your progress.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (videoUrl && !ytVideoId) {
    return (
      <div className="rounded-lg overflow-hidden mb-4 aspect-video bg-black/5 border border-gray-200 flex flex-col justify-center items-center relative">
        <GenericVideoPlayer
          videoUrl={videoUrl}
          courseTitle={courseTitle}
          onVideoEnd={() => setVideoEnded(true)}
        />
        {videoEnded && !completed && (
          <MarkCompleteButton onClick={handleMarkComplete} loading={saving} />
        )}
        {completed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-green-200 text-green-900 px-4 py-2 rounded shadow font-semibold">Marked as complete!</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden mb-4 aspect-video bg-black/5 border border-gray-200 flex flex-col justify-center items-center relative">
      {videoUrl ? (
        ytVideoId ? (
          <YouTubePlayer
            videoId={ytVideoId}
            courseTitle={courseTitle}
            user={user}
            videoDbId={videoId}
            onComplete={() => setVideoEnded(true)}
          />
        ) : (
          <GenericVideoPlayer
            videoUrl={videoUrl}
            courseTitle={courseTitle}
            onVideoEnd={() => setVideoEnded(true)}
          />
        )
      ) : (
        <img
          src={fallbackImage}
          alt="Course"
          className="w-full h-full object-cover rounded-lg"
        />
      )}
      {videoEnded && !completed && (
        <MarkCompleteButton onClick={handleMarkComplete} loading={saving} />
      )}
      {completed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-green-200 text-green-900 px-4 py-2 rounded shadow font-semibold">Marked as complete!</div>
        </div>
      )}
    </div>
  );
}
