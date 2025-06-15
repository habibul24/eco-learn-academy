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
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SupabaseClient } from '@supabase/supabase-js';

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

  // Modal and payment method state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "stripe">("paypal");

  // Defensive: Stronger check for real Supabase client at runtime
  function checkSupabaseClient() {
    // Defensive typeof and instance checks
    if (!supabase || typeof supabase.from !== "function" || !(supabase instanceof SupabaseClient)) {
      // eslint-disable-next-line no-console
      console.error("[FATAL] The imported `supabase` is NOT a valid Supabase client instance!", { supabase, type: typeof supabase, proto: Object.getPrototypeOf(supabase), keys: Object.keys(supabase) });
      throw new Error("Invalid Supabase client! Check all imports for 'supabase' and ensure no code shadows, re-exports or assigns it from anywhere else except '@/integrations/supabase/client'.");
    }
    // Extra debug
    // eslint-disable-next-line no-console
    console.log("[debug] Verified supabase client, class:", supabase.constructor?.name, "is instance:", supabase instanceof SupabaseClient);
  }

  // Re-run strong check EVERY time you use supabase  
  useEffect(() => { checkSupabaseClient(); }, []);

  useEffect(() => {
    checkSupabaseClient();
    async function fetchDetails() {
      setLoading(true);
      const courseId = Number(id);
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
      const firstVideo = videosData.length > 0 ? videosData[0].video_url : null;
      setActiveVideoUrl(firstVideo);
      setLoading(false);
    }
    fetchDetails();
  }, [id]);

  useEffect(() => {
    checkSupabaseClient();
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const paypalOrderId = params.get("token");
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
          } else {
            toast({ title: "PayPal payment error", description: error.message || "Unable to confirm payment."});
          }
        } catch (err: any) {
          toast({ title: "PayPal capture error", description: err.message });
        }
        setPaying(false);
      })();
    }
    if (paymentStatus === "success" && !isEnrolled) {
      toast({ title: "Payment successful! Course unlocked." });
      setIsEnrolled(true);
      navigate("/my-courses");
    }
  }, [user, isEnrolled, id, navigate]);

  function startPurchase() {
    if (!user) {
      toast({ title: "Please log in first." });
      navigate("/auth");
      return;
    }
    setShowPaymentModal(true);
  }

  function pay() {
    if (paymentMethod === "paypal") {
      handlePayPalPay();
    } else {
      handleStripePay();
    }
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

  const priceFormatted = `HKD ${course.price ? course.price.toFixed(2) : "0.00"}`;
  const COURSE_LEVEL = "Beginner";
  const COURSE_MODE = "Self-paced";
  const whoFor = extractSection(course.description, "Who is this course for?");
  const objectives = extractSection(course.description, "Learning Objectives");
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
              ) : (
                <Button
                  variant="default"
                  size="lg"
                  className="w-full"
                  onClick={startPurchase}
                  disabled={paying}
                >
                  Buy Course
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
      <Dialog open={showPaymentModal} onOpenChange={open => setShowPaymentModal(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Complete Your Purchase</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-base font-semibold">
              <span>{course.title}</span>
              <span>{priceFormatted}</span>
            </div>
            <div>
              <span className="block mb-1 font-medium text-gray-700">Select Payment Method</span>
              <RadioGroup
                value={paymentMethod}
                onValueChange={val => setPaymentMethod(val as "paypal" | "stripe")}
                className="flex flex-col gap-2"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="paypal" id="pay-pal" />
                  <span>PayPal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="stripe" id="stripe-card" />
                  <span>Credit Card (Stripe)</span>
                </label>
              </RadioGroup>
            </div>
            {/* Payment Buttons */}
            <div className="flex flex-col gap-3 mt-3">
              <Button
                disabled={paying || paymentMethod !== "paypal"}
                className="bg-[#FFC439] hover:bg-yellow-400 text-black font-bold w-full py-2 rounded transition-colors text-lg"
                onClick={pay}
              >
                <span className="w-full flex justify-center">PayPal</span>
              </Button>
              <Button
                disabled={paying || paymentMethod !== "stripe"}
                className="bg-black hover:bg-gray-900 text-white w-full rounded py-2 text-lg font-bold flex items-center justify-center gap-2"
                onClick={pay}
              >
                <span>Debit or Credit Card</span>
              </Button>
              <div className="text-center text-xs mt-1 text-muted-foreground">
                Powered by <span className="font-semibold text-blue-700">PayPal</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
