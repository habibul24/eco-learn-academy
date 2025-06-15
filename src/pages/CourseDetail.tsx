
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import CourseVideoPlayer from "@/components/CourseVideoPlayer";
import CourseContentSidebar from "@/components/CourseContentSidebar";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAuthUser } from "@/hooks/useAuthUser";

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
  const { user, loading: authLoading } = useAuthUser();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [paying, setPaying] = useState(false);

  // Phase 1: Load course + chapters + videos on mount (or id changes)
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

  // Phase 2: Enrollment check - only after both user and course are actually loaded
  useEffect(() => {
    async function checkEnrollment() {
      if (user && course) {
        const { data } = await supabase
          .from("course_enrollments")
          .select("*")
          .eq("user_id", user.id)
          .eq("course_id", course.id)
          .maybeSingle();
        setIsEnrolled(!!data);
      } else {
        setIsEnrolled(false);
      }
    }
    checkEnrollment();
  }, [user, course]);

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

  // Payment flows
  async function handleStripePay() {
    if (!user) {
      toast({ title: "Please log in first." });
      navigate("/auth");
      return;
    }
    setPaying(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-pay-course", {
        body: { course_id: Number(id) },
      });
      if (error || !data?.url) {
        toast({ title: "Stripe payment failed", description: error?.message || "Unable to initiate payment." });
      } else {
        window.location.href = data.url; // Stripe will redirect to success/cancel
      }
    } catch (err: any) {
      toast({ title: "Stripe payment error", description: err.message });
    } finally {
      setPaying(false);
    }
  }

  async function handlePayPalPay() {
    if (!user) {
      toast({ title: "Please log in first." });
      navigate("/auth");
      return;
    }
    setPaying(true);
    try {
      // Step 1: Create the PayPal order via edge function
      const { data, error } = await supabase.functions.invoke("paypal-pay-course", {
        body: { action: "create", course_id: Number(id) }
      });
      if (error || !data?.url) {
        toast({ title: "PayPal error", description: error?.message || "Unable to start payment." });
      } else {
        window.location.href = data.url; // PayPal will redirect on approval
      }
    } catch (err: any) {
      toast({ title: "PayPal payment error", description: err.message });
    } finally {
      setPaying(false);
    }
  }

  // Optional: detect PayPal payment success/cancel from query string and finalize
  useEffect(() => {
    // If user comes back with payment=success and PayPal order id in hash/query, capture
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const paypalOrderId = params.get("token"); // PayPal sends ?token=ORDER_ID on success
    if (paymentStatus === "success" && paypalOrderId && user && !isEnrolled) {
      (async () => {
        setPaying(true);
        try {
          const { error } = await supabase.functions.invoke("paypal-pay-course", {
            body: { action: "capture", course_id: Number(id), order_id: paypalOrderId },
          });
          if (!error) {
            toast({ title: "Payment confirmed, enrolled!" });
            setIsEnrolled(true);
            navigate("/my-courses");
          }
        } catch {}
        setPaying(false);
      })();
    }
    // ...stripe will auto-redirect after success session to the same page
    if (paymentStatus === "success" && !isEnrolled) {
      toast({ title: "Payment successful! Course unlocked." });
      setIsEnrolled(true);
      navigate("/my-courses");
    }
    // eslint-disable-next-line
  }, [user, isEnrolled]);

  // Prepare meta and parsed description sections
  const priceFormatted = `HKD ${course.price ? course.price.toFixed(2) : "0.00"}`;
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
          {!authLoading && (
            <div className="mb-6">
              {isEnrolled ? (
                <Button variant="secondary" size="lg" className="w-full" disabled>
                  You are enrolled in this course!
                </Button>
              ) : user ? (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full"
                    onClick={handleStripePay}
                    disabled={paying}
                  >
                    {paying ? "Processing..." : "Buy with Stripe"}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handlePayPalPay}
                    disabled={paying}
                  >
                    {paying ? "Processing..." : "Buy with PayPal"}
                  </Button>
                </div>
              ) : (
                <Button variant="default" size="lg" className="w-full" onClick={() => navigate("/auth")}>
                  Login to purchase this course
                </Button>
              )}
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
