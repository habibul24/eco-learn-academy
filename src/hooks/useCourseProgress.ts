
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useProgressFetcher } from "./useProgressFetcher";
import { useProgressCalculation } from "./useProgressCalculation";

export function useCourseProgress({
  user,
  courseId,
  videos,
}: {
  user: User | null;
  courseId: number | undefined;
  videos: { id: number; video_url: string }[];
}) {
  const [watchedVideoIds, setWatchedVideoIds] = useState<number[]>([]);
  const { fetchWatchedVideos, supabaseError, isLoading, setSupabaseError, setIsLoading } = useProgressFetcher();
  const { progress, allWatched } = useProgressCalculation({ videos, watchedVideoIds });

  useEffect(() => {
    if (!user || !courseId || videos.length === 0) {
      setWatchedVideoIds([]);
      setSupabaseError(null);
      setIsLoading(false);
      return;
    }

    async function loadProgress() {
      console.log("[useCourseProgress] Loading progress for course:", courseId);
      const watchedIds = await fetchWatchedVideos(user);
      setWatchedVideoIds(watchedIds);
    }
    
    loadProgress();
  }, [user, courseId, JSON.stringify(videos), fetchWatchedVideos]);

  return { progress, allWatched, supabaseError, isLoading };
}
