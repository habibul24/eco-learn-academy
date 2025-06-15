import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CourseVideoPlayer from "@/components/CourseVideoPlayer";
import CourseContentSidebar from "@/components/CourseContentSidebar";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useCourseDetailData } from "@/hooks/useCourseDetailData";
import { useCoursePayment } from "@/hooks/useCoursePayment";
import CourseMetaInfo from "@/components/CourseMetaInfo";
import CoursePaymentDialog from "@/components/CoursePaymentDialog";

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
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  // Sync current video
  React.useEffect(() => {
    setActiveVideoUrl(videos.length > 0 ? videos[0].video_url : null);
  }, [videos]);

  const payment = useCoursePayment(course ? course.id : 0, user, isEnrolled);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const paypalOrderId = params.get("token");
    if (paymentStatus === "success" && paypalOrderId && user && !isEnrolled) {
      (async () => {
        payment.setPaying(true);
        try {
          const { error } = await (window as any).supabase.functions.invoke("paypal-pay-course", {
            body: { action: "capture", course_id: course.id, order_id: paypalOrderId },
          });
          if (!error) {
            toast({ title: "Payment confirmed, enrolled!" });
            navigate("/my-courses");
          } else {
            toast({ title: "PayPal payment error", description: error.message || "Unable to confirm payment." });
          }
        } catch (err: any) {
          toast({ title: "PayPal capture error", description: err.message });
        }
        payment.setPaying(false);
      })();
    }
    if (paymentStatus === "success" && !isEnrolled) {
      toast({ title: "Payment successful! Course unlocked." });
      navigate("/my-courses");
    }
  }, [user, isEnrolled, course, navigate, payment]);

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
          <CourseMetaInfo priceFormatted={priceFormatted} />
          <div className="text-base text-gray-700 mb-5 whitespace-pre-line">{course.description.split("\n\n")[0]}</div>
          {whoFor.length > 0 && (
            <div className="mb-5">
              <h4 className="font-bold text-green-900 mb-1">Who is this course for?</h4>
              <ul className="list-disc ml-6 text-sm text-gray-800">
                {whoFor.map((item, i) => <li key={i}>{item.replace(/^- /, "")}</li>)}
              </ul>
            </div>
          )}
          {objectives.length > 0 && (
            <div>
              <h4 className="font-bold text-green-900 mb-1">Learning Objectives</h4>
              <ul className="list-disc ml-6 text-sm text-gray-800">
                {objectives.map((item, i) => <li key={i}>{item.replace(/^- /, "")}</li>)}
              </ul>
            </div>
          )}
          {!payment.loading && (
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
                  onClick={payment.startPurchase}
                  disabled={payment.paying}
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
