import React from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { getYoutubeVideoId } from "@/utils/youtubeUtils";
import { YouTubePlayer } from "./video/YouTubePlayer";
import { GenericVideoPlayer } from "./video/GenericVideoPlayer";
import { AuthWarning } from "./video/AuthWarning";
import { useToast } from "@/components/ui/use-toast";
import MarkCompleteButton from "./video/MarkCompleteButton";

// Helper to create a certificate number
function generateCertificateNumber() {
  return 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Only issues certificate if all videos are completed
async function checkAndIssueCertificate({
  userId,
  courseId,
  toast,
  userFullName,
}: {
  userId: string;
  courseId: number;
  toast: any;
  userFullName: string;
}) {
  if (!userId || !courseId) return;
  try {
    const { supabase, validateSupabaseClient } = await import("@/integrations/supabase/client");
    validateSupabaseClient();

    // Get list of videos for course
    const { data: videoData, error: videosError } = await supabase
      .from("videos")
      .select("id")
      .in("chapter_id",
        (await supabase.from("chapters").select("id").eq("course_id", courseId)).data?.map(c => c.id) || []
      );

    if (videosError) throw videosError;
    const allVideoIds = videoData ? videoData.map((v: { id: number }) => v.id) : [];

    // How many videos has this user completed?
    const { data: progressData, error: progressError } = await supabase
      .from("user_progress")
      .select("video_id")
      .eq("user_id", userId)
      .eq("watched", true);

    if (progressError) throw progressError;
    const watchedIds = progressData ? progressData.map((r) => r.video_id) : [];

    // Only issue if all video IDs present in watched IDs (all course videos complete)
    const allWatched = allVideoIds.length > 0 && allVideoIds.every((vid: number) => watchedIds.includes(vid));
    if (!allWatched) return; // Not complete, do not issue

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

    // Insert certificate with user full name
    const { error } = await supabase
      .from("certificates")
      .insert({
        user_id: userId,
        course_id: courseId,
        certificate_number: generateCertificateNumber(),
        issue_date: new Date().toISOString(),
        user_full_name: userFullName || "",
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
        description: "Congratulations! Your certificate is now available on the My Certificates page.",
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
  isFirstVideo?: boolean;
};

export default function CourseVideoPlayer({
  videoUrl,
  courseTitle,
  fallbackImage,
  videoId,
  onComplete,
  isFirstVideo = false,
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
    videoId,
    isFirstVideo,
    userExists: !!user,
    shouldShowAuthWarning: !user && !isFirstVideo,
    videoUrlType: videoUrl ? (videoUrl.includes('youtube') || videoUrl.includes('youtu.be') ? 'YouTube' : 'Other') : 'None'
  });

  // Only show AuthWarning for non-first videos when user is not authenticated
  if (!user && !isFirstVideo) {
    console.log("[CourseVideoPlayer] Showing AuthWarning - user not authenticated and not first video");
    return <AuthWarning />;
  }

  console.log("[CourseVideoPlayer] Proceeding to render video player");

  // Get courseId from URL
  const courseId = (() => {
    const match = window.location.pathname.match(/\/enrolled-course\/(\d+)/);
    return match ? Number(match[1]) : undefined;
  })();

  // Always prefer full name for user on certificate
  const userFullName =
    user?.user_metadata?.full_name?.trim?.() ||
    user?.user_metadata?.name?.trim?.() ||
    "";

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

      // --- Only issue certificate if 100% complete ---
      if (courseId && user.id) {
        await checkAndIssueCertificate({
          userId: user.id,
          courseId,
          toast,
          userFullName,
        });
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

  // If no video URL, show fallback image
  if (!videoUrl) {
    console.log("[CourseVideoPlayer] No video URL, showing fallback image");
    return (
      <div className="rounded-lg overflow-hidden mb-4 aspect-video bg-black/5 border border-gray-200 flex flex-col justify-center items-center relative">
        <img
          src={fallbackImage}
          alt="Course"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    );
  }

  // Temporary debug display
  if (process.env.NODE_ENV === 'development') {
    console.log("[CourseVideoPlayer] Rendering video player with:", {
      videoUrl,
      ytVideoId,
      isFirstVideo,
      user: !!user,
      courseTitle
    });
  }

  // For first video without user, show video but no progress tracking
  if (videoUrl && !ytVideoId) {
    return (
      <div className="rounded-lg overflow-hidden mb-4 aspect-video bg-black/5 border border-gray-200 flex flex-col justify-center items-center relative">
        <GenericVideoPlayer
          videoUrl={videoUrl}
          courseTitle={courseTitle}
          onVideoEnd={() => setVideoEnded(true)}
        />
        {/* Only show mark complete button if user is authenticated */}
        {videoEnded && !completed && user && (
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
      {/* Only show mark complete button if user is authenticated */}
      {videoEnded && !completed && user && (
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
