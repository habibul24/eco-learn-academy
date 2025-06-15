
import React from "react";

type CourseVideoPlayerProps = {
  videoUrl: string | null;
  courseTitle: string;
  fallbackImage?: string;
};

export default function CourseVideoPlayer({ videoUrl, courseTitle, fallbackImage }: CourseVideoPlayerProps) {
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
