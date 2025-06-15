import React from "react";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";

type CourseVideoPlayerProps = {
  videoUrl: string | null;
  courseTitle: string;
  fallbackImage?: string;
  videoId?: number;
  onComplete?: () => void;
};

export default function CourseVideoPlayer({ videoUrl, courseTitle, fallbackImage, videoId, onComplete }: CourseVideoPlayerProps) {
  const { user } = useAuthUser();

  useEffect(() => {
    if (user && videoId && videoUrl) {
      // Mark as watched (for demo: on mount)
      supabase
        .from("user_progress")
        .upsert({
          user_id: user.id,
          video_id: videoId,
          watched: true,
          progress_percentage: 100,
        });
      // Optionally, send onComplete callback
      if (onComplete) onComplete();
    }
  }, [user, videoId, videoUrl, onComplete]);

  return (
    <div className="rounded-lg overflow-hidden mb-4 aspect-video bg-black/5 border border-gray-200 flex justify-center items-center">
      {videoUrl ? (
        <iframe
          src={videoUrl}
          title={courseTitle}
          className="w-full h-full min-h-[260px] rounded-lg"
          allowFullScreen
        />
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
