
import React, { useRef, useEffect } from "react";

type GenericVideoPlayerProps = {
  videoUrl: string;
  courseTitle: string;
  onVideoEnd?: () => void;
};

export const GenericVideoPlayer: React.FC<GenericVideoPlayerProps> = ({
  videoUrl,
  courseTitle,
  onVideoEnd,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const ref = videoRef.current;
    if (!ref || !onVideoEnd) return;
    const handleEnded = () => {
      onVideoEnd();
    };
    ref.addEventListener("ended", handleEnded);
    return () => {
      ref.removeEventListener("ended", handleEnded);
    };
  }, [onVideoEnd]);

  // If it's a .mp4 or playable HTML5 video
  if (videoUrl.match(/\.(mp4|webm|ogg)$/)) {
    return (
      <video
        ref={videoRef}
        src={videoUrl}
        title={courseTitle}
        className="w-full h-full min-h-[260px] rounded-lg"
        controls
      />
    );
  }

  // Non-HTML5 (e.g. external embed, fallback to iframe)
  return (
    <iframe
      src={videoUrl}
      title={courseTitle}
      className="w-full h-full min-h-[260px] rounded-lg"
      allowFullScreen
    />
  );
};
