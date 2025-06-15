import { useEffect, useState } from "react";
import { supabase, assertSupabaseClient } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

// Helper: never fetch if client broken
function isClientValid(supabase: any): boolean {
  return assertSupabaseClient(supabase);
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

  useEffect(() => {
    if (!user || !courseId) return;
    if (!isClientValid(supabase)) {
      setSupabaseError("Supabase client is not valid, cannot fetch progress.");
      setProgress(0);
      setAllWatched(false);
      return;
    }
    // New: Defensive, don't proceed if supabase is null or typeof .from is not function
    if (!supabase || typeof supabase.from !== "function") {
      setSupabaseError("Supabase client is missing or corrupted.");
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
        // DEBUG LOG: watched data, ids, etc.
        console.log("[DEBUG: fetchProgress] watched data:", watched);
        const watchedIds = (watched || []).map((w) => w.video_id);
        const total = videos.length;
        const completed = videos.filter((v) => watchedIds.includes(v.id)).length;
        setProgress(total ? Math.round((completed / total) * 100) : 0);
        setAllWatched(completed === total && total > 0);
        setSupabaseError(null);
        // eslint-disable-next-line no-console
        console.log("[DEBUG: fetchProgress] watchedIds:", watchedIds);
        console.log("[DEBUG: fetchProgress] completed:", completed, "total:", total);
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
