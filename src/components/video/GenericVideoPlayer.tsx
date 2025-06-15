
import React, { useRef, useEffect } from "react";

// Add a debug banner
export const RenderedBanner = () => (
  <div className="fixed top-0 left-0 right-0 z-[1000] py-4 bg-blue-800 text-white text-2xl text-center font-extrabold tracking-widest shadow-2xl pointer-events-auto">
    DEBUG: GenericVideoPlayer RENDERED!
  </div>
);

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

  // PROMINENT DEBUG BANNER
  // If it's a .mp4 or playable HTML5 video
  if (videoUrl.match(/\.(mp4|webm|ogg)$/)) {
    return (
      <>
        <RenderedBanner />
        <video
          ref={videoRef}
          src={videoUrl}
          title={courseTitle}
          className="w-full h-full min-h-[260px] rounded-lg"
          controls
        />
      </>
    );
  }

  // Non-HTML5 (e.g. external embed, fallback to iframe)
  return (
    <>
      <RenderedBanner />
      <iframe
        src={videoUrl}
        title={courseTitle}
        className="w-full h-full min-h-[260px] rounded-lg"
        allowFullScreen
      />
    </>
  );
};
