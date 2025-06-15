
import { useEffect, useState } from "react";
import { supabase, validateSupabaseClient } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

// Retry helper function for database operations
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`[useCourseProgress] Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error("Max retries exceeded");
}

export function useCourseProgress({
  user,
  courseId,
  videos,
}: {
  user: User | null;
  courseId: number | undefined;
  videos: { id: number; video_url: string }[];
}) {
  const [progress, setProgress] = useState(0);
  const [allWatched, setAllWatched] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !courseId || videos.length === 0) {
      setProgress(0);
      setAllWatched(false);
      setIsLoading(false);
      return;
    }

    async function fetchProgress() {
      setIsLoading(true);
      
      try {
        const progressData = await withRetry(async () => {
          // Validate client before each operation
          validateSupabaseClient();
          
          console.log("[useCourseProgress] Fetching progress for course:", courseId);
          
          const { data: watched, error } = await supabase
            .from("user_progress")
            .select("video_id, watched")
            .eq("user_id", user.id)
            .eq("watched", true);

          if (error) {
            console.error("[useCourseProgress] Database error:", error);
            throw new Error(`Database query failed: ${error.message}`);
          }

          return watched || [];
        });

        console.log("[useCourseProgress] Progress data:", progressData);

        const watchedIds = progressData.map((w) => w.video_id);
        const total = videos.length;
        const completed = videos.filter((v) => watchedIds.includes(v.id)).length;
        
        const progressPercentage = total ? Math.round((completed / total) * 100) : 0;
        const isComplete = completed === total && total > 0;
        
        console.log(`[useCourseProgress] Progress: ${completed}/${total} (${progressPercentage}%)`);
        
        setProgress(progressPercentage);
        setAllWatched(isComplete);
        setSupabaseError(null);
      } catch (err) {
        console.error("[useCourseProgress] Final error after retries:", err);
        setProgress(0);
        setAllWatched(false);
        setSupabaseError("Unable to load progress. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProgress();
  }, [user, courseId, JSON.stringify(videos)]);

  return { progress, allWatched, supabaseError, isLoading };
}
