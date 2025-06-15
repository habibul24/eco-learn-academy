import React from "react";
import Navbar from "@/components/Navbar";
import CourseContentSidebar from "@/components/CourseContentSidebar";
import CourseVideoPlayer from "@/components/CourseVideoPlayer";
import CourseSidebarToggle from "@/components/CourseSidebarToggle";
import { useCourseDetailData } from "@/hooks/useCourseDetailData";
import { Loader2 } from "lucide-react";
import CourseProgress from "@/components/CourseProgress";
import CourseDetailHeader from "@/components/CourseDetailHeader";
import { supabase } from "@/integrations/supabase/client";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { assertSupabaseClient } from "@/integrations/supabase/client";

// Runtime supabase client integrity check
if (!supabase || typeof supabase.from !== "function") {
  // eslint-disable-next-line no-console
  console.error("[EnrolledCourse] Invalid supabase client!", supabase);
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";

// Debug: Log and check validity of supabase client
console.log("[DEBUG: enrolled-course] Imported supabase at runtime is:", supabase, "typeof:", typeof supabase);
if (!supabase || typeof supabase.from !== "function") {
  // eslint-disable-next-line no-console
  console.error("[debug:enrolled-course] Imported supabase client is invalid!", supabase);
}

function extractSection(desc: string, title: string) {
  const lines = desc.split("\n");
  const idx = lines.findIndex(line => line.trim().toLowerCase().startsWith(title.toLowerCase()));
  if (idx === -1) return [];
  const section: string[] = [];
  for (let i = idx + 1; i < lines.length; i++) {
    if (/^[A-Za-z\s]+:?$/.test(lines[i]) && i !== idx + 1) break;
    section.push(lines[i].replace(/^-\s?/, "").trim());
  }
  return section.filter(Boolean);
}

export default function EnrolledCourse() {
  const { course, chapters, videos, loading, user } = useCourseDetailData();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [activeVideoUrl, setActiveVideoUrl] = React.useState<string | null>(videos.length > 0 ? videos[0].video_url : null);

  // Prevent rendering if Supabase client is invalid
  if (!assertSupabaseClient(supabase)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
        <div className="text-xl font-bold text-red-700 mb-6">Supabase client broken</div>
        <div className="text-red-700 text-base max-w-lg mx-auto">
          The application cannot fetch data because the database client is invalid.<br />
          <span className="block mt-4">Please reload or contact admin — check browser console for errors and search for <code>SUPABASE CLIENT INTEGRITY FAILURE</code>.</span>
        </div>
      </div>
    );
  }

  React.useEffect(() => {
    setActiveVideoUrl(videos.length > 0 ? videos[0].video_url : null);
  }, [videos]);

  // Use the new course progress hook
  const { progress, allWatched, supabaseError } = useCourseProgress({
    user,
    courseId: course?.id,
    videos,
  });

  if (supabaseError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
        <div className="text-xl font-bold text-red-700 mb-3">Progress Fetch Error</div>
        <div className="text-red-700 text-base max-w-lg">{supabaseError}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin mr-3" /> Loading...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center mt-16">
        <div className="text-2xl text-center text-red-700 font-semibold mb-6">Course not found</div>
      </div>
    );
  }

  const priceFormatted = `HKD ${course.price ? course.price.toFixed(2) : "0.00"}`;
  const firstVideoUrl = videos.length > 0 ? videos[0].video_url : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#FCF6E8]">
      <Navbar />
      <div className="max-w-7xl w-full mx-auto px-2 md:px-8 flex-1 flex flex-col pt-20 pb-12">
        <CourseDetailHeader title={course.title} priceFormatted={priceFormatted} />
        <CourseProgress progress={progress} allWatched={allWatched} />
        <div className="flex gap-4 mt-2">
          {/* Sidebar */}
          {sidebarOpen && (
            <aside className="w-full max-w-[340px] min-w-[250px] pt-1 transition-all duration-200">
              <CourseContentSidebar
                chapters={chapters}
                videos={videos}
                firstVideoUrl={firstVideoUrl}
                activeVideoUrl={activeVideoUrl}
                setActiveVideoUrl={setActiveVideoUrl}
                isEnrolled={true}
                paying={false}
                onBuyCourse={() => {}}
              />
            </aside>
          )}
          <div className="flex-1 min-w-0 relative">
            {/* Place the toggle button next to sidebar or float when collapsed */}
            <div className="absolute left-[-22px] top-2 z-10">
              <CourseSidebarToggle open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            </div>
            <CourseVideoPlayer
              videoUrl={activeVideoUrl}
              courseTitle={course.title}
              fallbackImage={DEFAULT_IMAGE}
              videoId={videos.find(v => v.video_url === activeVideoUrl)?.id}
            />
            {/* Video Transcript */}
            <div className="mt-4 p-4 bg-white rounded shadow border">
              <h3 className="font-semibold text-green-900 mb-2">Video Transcript</h3>
              <div className="text-gray-800 text-base">Transcript will appear here soon. (Placeholder)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
