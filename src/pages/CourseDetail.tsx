import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CourseVideoPlayer from "@/components/CourseVideoPlayer";
import CourseContentSidebar from "@/components/CourseContentSidebar";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useCourseDetailData } from "@/hooks/useCourseDetailData";
import { useCoursePayment } from "@/hooks/useCoursePayment";
import CoursePaymentDialog from "@/components/CoursePaymentDialog";
import { useAuthUser } from "@/hooks/useAuthUser";
import { supabase } from "@/integrations/supabase/client";
import CourseDetailHeader from "@/components/CourseDetailHeader";
import CourseProgress from "@/components/CourseProgress";
import CourseDescriptionSections from "@/components/CourseDescriptionSections";
import { sendEmail } from "@/utils/sendEmail";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";

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

export default function CourseDetail() {
  const { course, chapters, videos, loading, isEnrolled, user } = useCourseDetailData();
  const [activeVideoUrl, setActiveVideoUrl] = React.useState<string | null>(null);
  const navigate = useNavigate();

  // Progress calculation logic — ensure hooks are defined top-level
  const [progress, setProgress] = React.useState(0);
  const [allWatched, setAllWatched] = React.useState(false);
  
  // Add a Ref to avoid double-email
  const [sentEnrollmentEmail, setSentEnrollmentEmail] = React.useState(false);
  const [sentCertificateEmail, setSentCertificateEmail] = React.useState(false);
  const [userRoles, setUserRoles] = React.useState<string[]>([]); // <-- New: For role checks

  // If enrolled, redirect to EnrolledCourse
  React.useEffect(() => {
    if (isEnrolled && course && user) {
      navigate(`/enrolled-course/${course.id}`);
    }
  }, [isEnrolled, course, user, navigate]);

  // Sync current video
  React.useEffect(() => {
    console.log("[CourseDetail] Setting activeVideoUrl:", {
      videosLength: videos.length,
      firstVideoUrl: videos.length > 0 ? videos[0].video_url : null,
      currentActiveVideoUrl: activeVideoUrl
    });
    setActiveVideoUrl(videos.length > 0 ? videos[0].video_url : null);
  }, [videos]);

  const payment = useCoursePayment(course ? course.id : 0, user, isEnrolled);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const stripeSessionId = params.get("session_id");
    const paypalOrderId = params.get("token");
    if (paymentStatus === "success" && (paypalOrderId || stripeSessionId) && user && !isEnrolled && !sentEnrollmentEmail) {
      (async () => {
        payment.setPaying(true);
        try {
          let enrollResult;
          if (paypalOrderId) {
            enrollResult = await supabase.functions.invoke("paypal-pay-course", {
              body: { action: "capture", course_id: course.id, order_id: paypalOrderId },
            });
          } else if (stripeSessionId) {
            enrollResult = await supabase.functions.invoke("stripe-enroll-course", {
              body: { course_id: course.id, stripe_session_id: stripeSessionId },
            });
          }
          const { error } = enrollResult || {};
          if (!error) {
            toast({ title: "Payment confirmed, enrolled!" });
            // Send Enrollment Email
            try {
              await sendEmail({
                event: "enrollment",
                to: user.email,
                userName: user.user_metadata?.full_name || "",
                courseTitle: course.title,
              });
              setSentEnrollmentEmail(true);
            } catch (e: any) {
              console.error("sendEmail enrollment error:", e);
            }
            navigate("/my-courses");
          } else {
            toast({ title: "Payment error", description: error.message || "Unable to confirm payment." });
          }
        } catch (err: any) {
          toast({ title: "Payment capture error", description: err.message });
        }
        payment.setPaying(false);
      })();
    }
    // Fallback, unknown provider
    if (paymentStatus === "success" && !isEnrolled && !paypalOrderId && !stripeSessionId) {
      toast({ title: "Payment successful! Course unlocked." });
      navigate("/my-courses");
    }
  }, [user, isEnrolled, course, navigate, payment, sentEnrollmentEmail]);

  React.useEffect(() => {
    async function fetchProgress() {
      if (!user || !course) return;
      const { data: watched } = await supabase
        .from("user_progress")
        .select("video_id")
        .eq("user_id", user.id)
        .eq("watched", true);
      const watchedIds = (watched || []).map((w) => w.video_id);
      const total = videos.length;
      const completed = videos.filter(v => watchedIds.includes(v.id)).length;
      const pct = total ? Math.round((completed / total) * 100) : 0;
      setProgress(pct);
      setAllWatched(completed === total && total > 0);
      if (completed === total && total > 0 && user && !sentCertificateEmail) {
        console.log("[Certificate Generation] User object:", user);
        const certRes = await supabase
          .from("certificates")
          .select("*")
          .eq("user_id", user.id)
          .eq("course_id", course.id);
        if (!certRes.data?.length) {
          const certNumber = `CERT-${Date.now()}-${user.id.slice(-6)}`;
          // Fix: Always pass user_full_name when inserting certificate
          const userFullName =
            user.user_metadata?.full_name?.trim?.() ||
            user.user_metadata?.name?.trim?.() ||
            user.email ||
            "";
          const { error } = await supabase.from("certificates").insert({
            user_id: user.id,
            course_id: course.id,
            certificate_number: certNumber,
            user_full_name: userFullName,
          });
          if (!error) {
            // Send Certificate Email
            try {
              await sendEmail({
                event: "certificate",
                to: user.email,
                userName: userFullName,
                courseTitle: course.title,
                certificateLink: `${window.location.origin}/my-certificates`,
              });
              setSentCertificateEmail(true);
            } catch (e: any) {
              console.error("sendEmail certificate error:", e);
            }
          }
        }
      }
    }
    fetchProgress();
  }, [user, course, videos, sentCertificateEmail]);

  React.useEffect(() => {
    // Fetch user roles for "Buy Course" button display logic
    async function fetchRoles() {
      if (user?.id) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);
        setUserRoles(data ? data.map((r: any) => r.role) : []);
      } else {
        setUserRoles([]);
      }
    }
    fetchRoles();
  }, [user]);

  const isAdmin = userRoles.includes("admin");
  const isLearner = userRoles.includes("user") && !isAdmin;

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
  const whoFor = extractSection(course.description, "Who is this course for?");
  const objectives = extractSection(course.description, "Learning Objectives");
  const firstVideoUrl = videos.length > 0 ? videos[0].video_url : null;
  
  // Determine if current video is the first video - more robust logic
  const currentVideoIndex = videos.findIndex(v => v.video_url === activeVideoUrl);
  const isFirstVideo = currentVideoIndex === 0; // First video is at index 0
  
  // Debug logging
  console.log("[CourseDetail DEBUG]", {
    videosLength: videos.length,
    firstVideoUrl,
    activeVideoUrl,
    isFirstVideo,
    currentVideoIndex,
    firstVideoIndex: videos.findIndex(v => v.video_url === activeVideoUrl)
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F8F3]">
      <Navbar />
      <div className="max-w-7xl w-full mx-auto px-2 md:px-8 flex-1 flex flex-col lg:flex-row gap-10 pt-24 pb-12">
        {/* Left: Main Content */}
        <div className="w-full lg:w-3/5">
          <CourseDetailHeader title={course.title} priceFormatted={priceFormatted} />
          <CourseVideoPlayer
            videoUrl={activeVideoUrl}
            courseTitle={course.title}
            fallbackImage={DEFAULT_IMAGE}
            videoId={videos.find(v => v.video_url === activeVideoUrl)?.id}
            isFirstVideo={isFirstVideo}
          />
          <CourseDescriptionSections
            description={course.description}
            whoFor={whoFor}
            objectives={objectives}
          />
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
              isEnrolled={isEnrolled}
              paying={payment.paying}
              onBuyCourse={payment.startPurchase} // FIXED: Pass correct handler
            />
            {/* REMOVED: The large Buy This Course button here, handled solely by sidebar */}
          </div>
        </div>
      </div>
      {/* Payment dialog remains as before */}
      <CoursePaymentDialog
        open={payment.showPaymentModal}
        onOpenChange={payment.setShowPaymentModal}
        paying={payment.paying}
        paymentMethod={payment.paymentMethod}
        setPaymentMethod={payment.setPaymentMethod}
        pay={payment.pay}
        courseTitle={course.title}
        priceFormatted={priceFormatted}
      />
    </div>
  );
}
