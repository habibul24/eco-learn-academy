
import React from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { getYoutubeVideoId } from "@/utils/youtubeUtils";
import { YouTubePlayer } from "./video/YouTubePlayer";
import { GenericVideoPlayer } from "./video/GenericVideoPlayer";
import { AuthWarning } from "./video/AuthWarning";
import { useToast } from "@/components/ui/use-toast";
import MarkCompleteButton from "./video/MarkCompleteButton";

// NEW: Helper to create a certificate if not already present
function generateCertificateNumber() {
  // Simple random string—swap with UUID if you want (not required for this fix)
  return 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

async function issueCertificateOnce({ userId, courseId, toast }: { userId: string, courseId: number, toast: any }) {
  if (!userId || !courseId) return;
  try {
    const { supabase, validateSupabaseClient } = await import("@/integrations/supabase/client");
    validateSupabaseClient();

    // Check if certificate already exists
    const { data: exists } = await supabase
      .from("certificates")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (exists?.id) {
      // Already exists
      return;
    }

    // Insert certificate - supply required fields
    const { error } = await supabase
      .from("certificates")
      .insert({
        user_id: userId,
        course_id: courseId,
        certificate_number: generateCertificateNumber(),
        issue_date: new Date().toISOString(),
      })
      .select();

    if (error) {
      toast({
        variant: "destructive",
        title: "Certificate error",
        description: error.message || "Could not issue your certificate.",
      });
    } else {
      toast({
        title: "Certificate earned!",
        description: "Your certificate is now available on the My Certificates page.",
      });
    }
  } catch (e: any) {
    toast({
      variant: "destructive",
      title: "Certificate error",
      description: e?.message || "Could not issue your certificate.",
    });
  }
}

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

  // NEW: receive courseId from parent
  // We'll get courseId from props in a follow-up as needed, for now grab from window.location.pathname
  const courseId = (() => {
    const match = window.location.pathname.match(/\/enrolled-course\/(\d+)/);
    return match ? Number(match[1]) : undefined;
  })();

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
      // --- New: issue certificate if course complete ---
      if (courseId && user.id) {
        await issueCertificateOnce({ userId: user.id, courseId, toast });
      }
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
