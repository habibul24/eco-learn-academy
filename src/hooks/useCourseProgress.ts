
import { useEffect, useState } from "react";
import { supabase, validateSupabaseClient } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

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

  useEffect(() => {
    if (!user || !courseId) return;

    async function fetchProgress() {
      try {
        // Strict validation before any database operations
        validateSupabaseClient();
        
        // Additional runtime check
        if (!supabase || typeof supabase.from !== 'function') {
          throw new Error("Supabase client validation failed");
        }
        
        const { data: watched, error } = await supabase
          .from("user_progress")
          .select("video_id, watched")
          .eq("user_id", user.id)
          .eq("watched", true);

        if (error) {
          console.error("[useCourseProgress] Supabase query error:", error);
          setProgress(0);
          setAllWatched(false);
          setSupabaseError("Failed to fetch progress.");
          return;
        }

        const watchedIds = (watched || []).map((w) => w.video_id);
        const total = videos.length;
        const completed = videos.filter((v) => watchedIds.includes(v.id)).length;
        setProgress(total ? Math.round((completed / total) * 100) : 0);
        setAllWatched(completed === total && total > 0);
        setSupabaseError(null);
      } catch (err) {
        console.error("[useCourseProgress] Error:", err);
        setProgress(0);
        setAllWatched(false);
        setSupabaseError("Database connection error - please refresh the page.");
      }
    }
    
    fetchProgress();
  }, [user, courseId, JSON.stringify(videos)]);

  return { progress, allWatched, supabaseError };
}
