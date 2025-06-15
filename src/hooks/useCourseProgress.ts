
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
    // Defensive: do nothing if user or courseId is not valid
    if (!user || !courseId) return;

    // Defensive: check if supabase is really a client
    if (!supabase || typeof supabase.from !== "function") {
      console.error("[useCourseProgress] Supabase client invalid!", supabase);
      setSupabaseError("Supabase client is invalid! Progress cannot be fetched.");
      setProgress(0);
      setAllWatched(false);
      return;
    }

    async function fetchProgress() {
      try {
        const { data: watched, error } = await supabase
          .from("user_progress")
          .select("video_id, watched")
          .eq("user_id", user.id)
          .eq("watched", true);

        if (error) {
          console.error("[useCourseProgress] Supabase query error:", error);
          setProgress(0);
          setAllWatched(false);
          setSupabaseError("Supabase query failed.");
          return;
        }
        // Compute watched set
        const watchedIds = (watched || []).map((w) => w.video_id);
        const total = videos.length;
        const completed = videos.filter((v) => watchedIds.includes(v.id)).length;

        setProgress(total ? Math.round((completed / total) * 100) : 0);
        setAllWatched(completed === total && total > 0);
        setSupabaseError(null); // clear error if successful
        // Debug logging
        console.log("[useCourseProgress] Progress fetch: watchedIds", watchedIds, "completed", completed, "of", total);
      } catch (err) {
        console.error("[useCourseProgress] Unexpected fetch error:", err);
        setProgress(0);
        setAllWatched(false);
        setSupabaseError("Unexpected error fetching course progress.");
      }
    }
    fetchProgress();
  }, [user, courseId, JSON.stringify(videos)]);

  return { progress, allWatched, supabaseError };
}
