
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { useAuthUser } from "@/hooks/useAuthUser";
import { SupabaseClient } from "@supabase/supabase-js";

// Runtime supabase client integrity check
if (!supabase || typeof supabase.from !== "function") {
  // eslint-disable-next-line no-console
  console.error("[useCourseDetailData] Invalid supabase client!", supabase);
}

type Video = {
  id: number;
  chapter_id: number;
  title: string;
  description: string | null;
  video_url: string;
  duration: number | null;
};
type Chapter = {
  id: number;
  course_id: number;
  order_index: number;
  title: string;
  description: string | null;
};
type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
};

export function useCourseDetailData() {
  const { id } = useParams<{ id: string }>();
  const courseId = id && !isNaN(Number(id)) ? Number(id) : undefined;
  const { user, loading: authLoading } = useAuthUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  function checkSupabaseClient() {
    if (!supabase || typeof supabase.from !== "function" || !(supabase instanceof SupabaseClient)) {
      // eslint-disable-next-line no-console
      console.error("[FATAL] The imported `supabase` is NOT a valid Supabase client instance!", { supabase, type: typeof supabase, proto: Object.getPrototypeOf(supabase), keys: Object.keys(supabase) });
      throw new Error(
        "Invalid Supabase client! Check all imports for 'supabase' and ensure no code shadows, re-exports or assigns it from anywhere else except '@/integrations/supabase/client'."
      );
    }
  }

  useEffect(() => { checkSupabaseClient(); }, []);

  useEffect(() => {
    checkSupabaseClient();
    // If courseId is invalid, don't make requests and reset state
    if (typeof courseId !== "number" || isNaN(courseId)) {
      setCourse(null);
      setChapters([]);
      setVideos([]);
      setLoading(false);
      console.warn("[useCourseDetailData] Invalid or missing courseId in params:", { id, courseId });
      return;
    }
    async function fetchDetails() {
      setLoading(true);
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .maybeSingle();
      const { data: chaptersData } = await supabase
        .from("chapters")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");
      const chapterIds = chaptersData?.map((c) => c.id) || [];
      let videosData: Video[] = [];
      if (chapterIds.length > 0) {
        const { data } = await supabase
          .from("videos")
          .select("*")
          .in("chapter_id", chapterIds)
          .order("id");
        videosData = data || [];
      }
      setCourse(courseData ?? null);
      setChapters(chaptersData ?? []);
      setVideos(videosData);
      setLoading(false);
    }
    fetchDetails();
  }, [id, courseId]);

  useEffect(() => {
    checkSupabaseClient();
    // Only check enrollment when course and courseId are valid
    if (!user || !course || typeof courseId !== "number" || isNaN(courseId)) {
      setIsEnrolled(false);
      return;
    }
    async function checkEnrollment() {
      const { data } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", course.id)
        .maybeSingle();
      setIsEnrolled(!!data);
    }
    checkEnrollment();
  }, [user, course, courseId]);

  return {
    course,
    chapters,
    videos,
    loading: loading || authLoading,
    isEnrolled,
    user,
  };
}
