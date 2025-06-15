
import React from "react";

type GenericVideoPlayerProps = {
  videoUrl: string;
  courseTitle: string;
};

export const GenericVideoPlayer: React.FC<GenericVideoPlayerProps> = ({
  videoUrl,
  courseTitle,
}) => {
  return (
    <iframe
      src={videoUrl}
      title={courseTitle}
      className="w-full h-full min-h-[260px] rounded-lg"
      allowFullScreen
    />
  );
};
