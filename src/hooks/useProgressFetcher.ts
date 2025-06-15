
import { useState, useCallback } from "react";
import { supabase, validateSupabaseClient } from "@/integrations/supabase/client";
import { withRetry } from "@/utils/retryUtils";
import type { User } from "@supabase/supabase-js";

export function useProgressFetcher() {
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWatchedVideos = useCallback(async (user: User) => {
    setIsLoading(true);
    
    try {
      const progressData = await withRetry(async () => {
        // Validate client before each operation
        validateSupabaseClient();
        
        console.log("[useProgressFetcher] Fetching watched videos for user:", user.id);
        
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

      console.log("[useProgressFetcher] Progress data:", progressData);
      setSupabaseError(null);
      
      return progressData.map((w) => w.video_id);
    } catch (err) {
      console.error("[useProgressFetcher] Final error after retries:", err);
      setSupabaseError("Unable to load progress. Please refresh the page.");
      return [];
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
