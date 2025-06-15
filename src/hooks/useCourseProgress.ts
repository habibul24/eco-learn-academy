
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
    // Reset state when dependencies are invalid
    if (!user || !courseId || videos.length === 0) {
      console.log("[useCourseProgress] Resetting state - invalid dependencies:", { 
        hasUser: !!user, 
        courseId, 
        videosLength: videos.length 
      });
      setWatchedVideoIds([]);
      setSupabaseError(null);
      setIsLoading(false);
      return;
    }

    async function loadProgress() {
      console.log("[useCourseProgress] Loading progress for course:", courseId);
      try {
        const watchedIds = await fetchWatchedVideos(user);
        console.log("[useCourseProgress] Setting watched video IDs:", watchedIds);
        setWatchedVideoIds(watchedIds);
      } catch (error) {
        console.error("[useCourseProgress] Error loading progress:", error);
        setWatchedVideoIds([]); // Ensure we always have an array
      }
    }
    
    loadProgress();
  }, [user, courseId, JSON.stringify(videos), fetchWatchedVideos]);

  console.log("[useCourseProgress] Current state:", {
    progress,
    allWatched,
    watchedVideoIds,
    videosCount: videos.length,
    isLoading,
    supabaseError
  });

  return { progress, allWatched, supabaseError, isLoading };
}
