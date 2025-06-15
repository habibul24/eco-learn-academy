
type ProgressCalculationParams = {
  videos: { id: number; video_url: string }[];
  watchedVideoIds: number[];
};

export function useProgressCalculation({ videos, watchedVideoIds }: ProgressCalculationParams) {
  // Ensure watchedVideoIds is always an array to prevent runtime errors
  const safeWatchedVideoIds = Array.isArray(watchedVideoIds) ? watchedVideoIds : [];
  
  const total = videos.length;
  const completed = videos.filter((v) => safeWatchedVideoIds.includes(v.id)).length;
  
  const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed === total && total > 0;
  
  console.log("[useProgressCalculation] Progress calculated:", {
    total,
    completed,
    progressPercentage,
    isComplete,
    watchedVideoIds: safeWatchedVideoIds,
    videoIds: videos.map(v => v.id)
  });
  
  return {
    progress: progressPercentage,
    allWatched: isComplete,
    completed,
    total
  };
}
