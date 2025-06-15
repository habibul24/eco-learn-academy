
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
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Attempt to listen to HTML5 video end if possible (for .mp4, etc embedded directly, not for all iframes)
    // For most iframes, best effort is timeout fallback (handled by Mark as Complete button)
    // You could also inject listeners to contentWindow, but most providers block this for security
  }, []);

  return (
    <iframe
      ref={ref}
      src={videoUrl}
      title={courseTitle}
      className="w-full h-full min-h-[260px] rounded-lg"
      allowFullScreen
      onLoad={() => {/* could attempt smart fallback here if desired */}}
      // No reliable onEnded, so button is manual
    />
  );
};
