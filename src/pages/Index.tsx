
import Navbar from "@/components/Navbar";
import CourseCard from "@/components/CourseCard";
import { Users, CheckCircle, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { testSupabaseConnection } from "@/utils/supabaseTest";

const DEFAULT_COURSE_IMAGE = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=620&q=80";

export default function Index() {
  const [featuredCourse, setFeaturedCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing connection...');
  const { user, loading: userLoading } = useAuthUser();

  useEffect(() => {
    async function fetchFeaturedCourse() {
      try {
        console.log("[Index] Starting to fetch featured course...");
        setError(null);
        setConnectionStatus('Testing database connection...');
        
        // Test connection first
        const connectionTest = await testSupabaseConnection();
        if (!connectionTest.success) {
          console.error("[Index] Connection test failed:", connectionTest.error);
          setError(connectionTest.error || "Database connection failed");
          setConnectionStatus('Connection failed');
          setLoading(false);
          return;
        }
        
        setConnectionStatus('Connection successful, fetching courses...');
        
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .order("id")
          .limit(1)
          .maybeSingle();
          
        if (error) {
          console.error("[Index] Error fetching featured course:", error);
          setError(`Database error: ${error.message}`);
          setConnectionStatus('Error fetching data');
        } else if (data) {
          console.log("[Index] Featured course fetched:", data);
          setFeaturedCourse({
            id: data.id,
            image: DEFAULT_COURSE_IMAGE,
            title: data.title,
            description: (data.description ?? "").slice(0, 100),
            price: data.price ? `USD ${(data.price as number).toFixed(2)}` : "USD 0.00",
            onView: () => window.location.href = `/course/${data.id}`,
          });
          setConnectionStatus('Data loaded successfully');
        } else {
          console.log("[Index] No courses found in database");
          setError("No courses available in the database.");
          setConnectionStatus('No courses found');
        }
      } catch (e: any) {
        console.error("[Index] Exception fetching featured course:", e);
        setError(`Network error: ${e?.message || 'Please check your internet connection'}`);
        setConnectionStatus('Network error');
      } finally {
        setLoading(false);
      }
    }
    fetchFeaturedCourse();
  }, []);

  // Check enrollment when featuredCourse and user are available
  useEffect(() => {
    async function checkEnrollment() {
      if (featuredCourse && featuredCourse.id && user) {
        try {
          const { data: enrollData } = await supabase
            .from("course_enrollments")
            .select("*")
            .eq("user_id", user.id)
            .eq("course_id", featuredCourse.id)
            .eq("status", "active")
            .maybeSingle();
          setEnrolled(!!enrollData);
        } catch (e) {
          console.error("[Index] Error checking enrollment:", e);
        }
      } else {
        setEnrolled(false);
      }
    }
    checkEnrollment();
  }, [featuredCourse, user]);

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#FCFDF7]">
      <Navbar />
      {/* Hero section */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-28 pb-14 bg-no-repeat bg-cover" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1050&q=40')",
        backgroundPosition: "center top",
        backgroundSize: "cover",
        minHeight: "375px"
      }}>
        <div className="absolute inset-0 bg-white bg-opacity-70 backdrop-blur-sm"></div>
        <div className="relative z-10 flex flex-col items-center justify-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-900 mt-2 mb-4">
            Navigate your sustainability journey with clarity
          </h1>
          <p className="text-md sm:text-lg text-gray-700 max-w-xl mx-auto mb-0">
            Explore courses that equip you with the knowledge to drive positive<br />ESG practices within your business.
          </p>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="w-full py-14 bg-green-900 flex flex-col items-center">
        <h2 className="text-2xl font-semibold text-white mb-8">Featured Courses</h2>
        <div className="w-full flex justify-center">
          <div className="max-w-xs">
            {loading || userLoading ? (
              <div className="text-white text-center">
                <div className="mb-2">Loading courses...</div>
                <div className="text-sm text-green-200">{connectionStatus}</div>
              </div>
            ) : error ? (
              <div className="text-red-300 text-center bg-red-900 bg-opacity-50 p-4 rounded-lg">
                <p className="mb-2">⚠️ {error}</p>
                <p className="text-sm text-red-200 mb-3">Status: {connectionStatus}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-yellow-400 underline hover:text-yellow-300"
                >
                  Try Again
                </button>
              </div>
            ) : featuredCourse ? (
              <CourseCard
                image={featuredCourse.image}
                title={featuredCourse.title}
                description={featuredCourse.description}
                price={featuredCourse.price}
                onView={featuredCourse.onView}
                enrolled={enrolled}
              />
            ) : (
              <div className="text-white text-center">
                <p className="mb-2">No featured courses available.</p>
                <p className="text-sm text-green-200">Please check back later or contact support.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Community section */}
      <section className="w-full py-16 px-4 bg-white flex flex-col md:flex-row items-center justify-center gap-10 md:gap-14">
        <div className="flex-1 max-w-xl text-left">
          <h3 className="text-2xl font-bold text-green-900 mb-4">Join Our Community</h3>
          <p className="mb-6 text-gray-700">
            Connect with like-minded individuals passionate about sustainability and environmental stewardship.
          </p>
          <ul className="flex flex-col gap-3 mb-8 text-green-900 text-base">
            <li className="flex items-center gap-2"><CheckCircle className="text-green-600" size={20}/> Network with sustainability professionals</li>
            <li className="flex items-center gap-2"><CheckCircle className="text-green-600" size={20}/> Participate in meaningful discussions</li>
            <li className="flex items-center gap-2"><CheckCircle className="text-green-600" size={20}/> Access exclusive events and webinars</li>
            <li className="flex items-center gap-2"><CheckCircle className="text-green-600" size={20}/> Share your sustainability journey</li>
          </ul>
          <a
            href="/about"
            className="inline-block bg-yellow-400 text-green-900 font-medium rounded-lg px-7 py-2 shadow hover:bg-yellow-300 transition"
          >
            Join Now
          </a>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <img
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=850&q=80"
            alt="Community of people collaborating"
            className="rounded-xl shadow-lg max-w-md w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="mb-6 md:mb-0">
            <span className="text-lg font-bold block">Green Data</span>
            <p className="text-sm text-green-100 mt-2 max-w-xs">
              Empowering individuals and organizations through sustainable education.
            </p>
          </div>
          <div className="mb-6 md:mb-0">
            <span className="font-medium block mb-2">Quick Links</span>
            <ul className="space-y-1 text-green-100 text-sm">
              <li><a href="/about" className="hover:underline">About Us</a></li>
              <li><a href="/courses" className="hover:underline">Courses</a></li>
              <li><a href="/contact" className="hover:underline">Contact</a></li>
              <li><a href="/privacy" className="hover:underline">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <span className="font-medium block mb-2">Connect With Us</span>
            <div className="flex gap-4 mt-1">
              <a href="#" className="hover:opacity-80" aria-label="Facebook"><Facebook className="text-green-100" /></a>
              <a href="#" className="hover:opacity-80" aria-label="Twitter"><Twitter className="text-green-100" /></a>
              <a href="#" className="hover:opacity-80" aria-label="LinkedIn"><Linkedin className="text-green-100" /></a>
              <a href="#" className="hover:opacity-80" aria-label="Instagram"><Instagram className="text-green-100" /></a>
            </div>
          </div>
        </div>
        <div className="text-center text-green-200 pt-8 text-xs opacity-80">
          &copy; {new Date().getFullYear()} Green Data. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
