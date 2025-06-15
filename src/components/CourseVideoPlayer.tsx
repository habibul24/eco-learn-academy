
import React from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { getYoutubeVideoId } from "@/utils/youtubeUtils";
import { YouTubePlayer } from "./video/YouTubePlayer";
import { GenericVideoPlayer } from "./video/GenericVideoPlayer";
import { AuthWarning } from "./video/AuthWarning";

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

  // Show visual warning if user not signed in
  if (!user) {
    return <AuthWarning />;
  }

  // For non-YouTube videos, embed as plain iframe
  if (videoUrl && !ytVideoId) {
    return (
      <div className="rounded-lg overflow-hidden mb-4 aspect-video bg-black/5 border border-gray-200 flex justify-center items-center">
        <GenericVideoPlayer videoUrl={videoUrl} courseTitle={courseTitle} />
      </div>
    );
  }

  // YouTube video player
  return (
    <div className="rounded-lg overflow-hidden mb-4 aspect-video bg-black/5 border border-gray-200 flex justify-center items-center">
      {videoUrl ? (
        ytVideoId ? (
          <YouTubePlayer
            videoId={ytVideoId}
            courseTitle={courseTitle}
            user={user}
            videoDbId={videoId}
            onComplete={onComplete}
          />
        ) : (
          <GenericVideoPlayer videoUrl={videoUrl} courseTitle={courseTitle} />
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
