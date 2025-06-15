import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import CourseVideoPlayer from "@/components/CourseVideoPlayer";
import CourseContentSidebar from "@/components/CourseContentSidebar";
import { Loader2 } from "lucide-react";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";

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

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      const courseId = Number(id);

      // Fetch course info
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .maybeSingle();

      // Fetch chapters
      const { data: chaptersData } = await supabase
        .from("chapters")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      // Fetch videos for all chapters
      const chapterIds = chaptersData?.map(c => c.id) || [];
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

      // Default to first video
      const firstVideo = videosData.length > 0 ? videosData[0].video_url : null;
      setActiveVideoUrl(firstVideo);
      setLoading(false);
    }
    fetchDetails();
  }, [id]);

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
        <button
          className="mt-2 px-4 py-2 rounded bg-green-600 text-white"
          onClick={() => navigate("/courses")}
        >
          Back to Courses
        </button>
      </div>
    );
  }

  // Prepare meta and parsed description sections
  const priceFormatted = `USD ${course.price ? course.price.toFixed(2) : "0.00"}`;
  const COURSE_LEVEL = "Beginner";
  const COURSE_MODE = "Self-paced";

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

  const whoFor = extractSection(course.description, "Who is this course for?");
  const objectives = extractSection(course.description, "Learning Objectives");

  // Only allow first video to be played/interacted with
  const firstVideoUrl = videos.length > 0 ? videos[0].video_url : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F8F3]">
      <Navbar />
      <div className="max-w-7xl w-full mx-auto px-2 md:px-8 flex-1 flex flex-col lg:flex-row gap-10 pt-24 pb-12">
        {/* Left: Main Content */}
        <div className="w-full lg:w-3/5">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 mb-4">{course.title}</h1>
          <CourseVideoPlayer
            videoUrl={activeVideoUrl}
            courseTitle={course.title}
            fallbackImage={DEFAULT_IMAGE}
          />
          <div className="flex items-center gap-4 flex-wrap mb-4">
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">{COURSE_LEVEL}</span>
            <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs">{COURSE_MODE}</span>
            <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">{priceFormatted}</span>
          </div>
          <div className="text-base text-gray-700 mb-5 whitespace-pre-line">{course.description.split("\n\n")[0]}</div>
          {whoFor.length > 0 && (
            <div className="mb-5">
              <h4 className="font-bold text-green-900 mb-1">Who is this course for?</h4>
              <ul className="list-disc ml-6 text-sm text-gray-800">
                {whoFor.map((item, i) =>
                  <li key={i}>{item.replace(/^- /, "")}</li>)
                }
              </ul>
            </div>
          )}
          {objectives.length > 0 && (
            <div>
              <h4 className="font-bold text-green-900 mb-1">Learning Objectives</h4>
              <ul className="list-disc ml-6 text-sm text-gray-800">
                {objectives.map((item, i) =>
                  <li key={i}>{item.replace(/^- /, "")}</li>)
                }
              </ul>
            </div>
          )}
        </div>
        {/* Right: Sidebar content */}
        <div className="flex-grow max-w-lg w-full">
          <div className="sticky top-24">
            <CourseContentSidebar
              chapters={chapters}
              videos={videos}
              firstVideoUrl={firstVideoUrl}
              activeVideoUrl={activeVideoUrl}
              setActiveVideoUrl={setActiveVideoUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
