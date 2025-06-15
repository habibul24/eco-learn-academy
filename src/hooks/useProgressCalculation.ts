
type ProgressCalculationParams = {
  videos: { id: number; video_url: string }[];
  watchedVideoIds: number[];
};

export function useProgressCalculation({ videos, watchedVideoIds }: ProgressCalculationParams) {
  const total = videos.length;
  const completed = videos.filter((v) => watchedVideoIds.includes(v.id)).length;
  
  const progressPercentage = total ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed === total && total > 0;
  
  return {
    progress: progressPercentage,
    allWatched: isComplete,
    completed,
    total
  };
}
