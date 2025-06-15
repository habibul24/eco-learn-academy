
import { useState, useCallback } from "react";
import { supabase, validateSupabaseClient } from "@/integrations/supabase/client";
import { withRetry } from "@/utils/retryUtils";
import type { User } from "@supabase/supabase-js";

export function useProgressFetcher() {
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWatchedVideos = useCallback(async (user: User): Promise<number[]> => {
    setIsLoading(true);

    try {
      // Add DEBUG log for the supabase client before use
      console.log("[DEBUG][useProgressFetcher] supabase:", supabase, typeof supabase, (supabase as any).from);
      validateSupabaseClient();

      const progressData = await withRetry(async () => {
        // Validate client before each operation
        validateSupabaseClient();

        console.log("[useProgressFetcher] Fetching watched videos for user:", user.id);

        // Extra debug log RIGHT BEFORE USING
        if (!supabase || typeof supabase.from !== 'function') {
          console.error("[CRITICAL] supabase client is not valid before .from. Value:", supabase);
          throw new Error("Supabase client is invalid (no .from)");
        }
        const { data: watched, error } = await supabase
          .from("user_progress")
          .select("video_id, watched")
          .eq("user_id", user.id)
          .eq("watched", true);

        if (error) {
          console.error("[useProgressFetcher] Database error:", error);
          throw new Error(`Database query failed: ${error.message}`);
        }

        return watched || [];
      });

      console.log("[useProgressFetcher] Progress data fetched:", progressData);
      setSupabaseError(null);

      // Ensure we return an array of numbers, with fallback to empty array
      const videoIds = progressData.map((w) => w.video_id).filter(id => typeof id === 'number');
      console.log("[useProgressFetcher] Returning video IDs:", videoIds);

      return videoIds;
    } catch (err) {
      console.error("[useProgressFetcher] Final error after retries:", err);
      setSupabaseError("Unable to load progress. Please refresh the page.");
      return []; // Always return an empty array on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    fetchWatchedVideos,
    supabaseError,
    isLoading,
    setSupabaseError,
    setIsLoading
  };
}
