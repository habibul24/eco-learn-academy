
import { useState, useEffect } from "react";
import CourseCard from "./CourseCard";
import { BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const DEFAULT_COURSE_IMAGE = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";

// Typing for clarity
type CourseType = {
  id: number;
  title: string;
  description: string;
  price: number;
};

export default function CourseCatalog() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        console.log("[CourseCatalog] Fetching courses...");
        setError(null);
        
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .order("id");
          
        if (error) {
          console.error("[CourseCatalog] Database error:", error);
          setError(`Unable to load courses: ${error.message}`);
        } else if (data) {
          console.log("[CourseCatalog] Courses fetched:", data.length);
          setCourses(data);
        }
      } catch (e) {
        console.error("[CourseCatalog] Exception:", e);
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const handleViewCourse = (course: CourseType) => {
    navigate(`/course/${course.id}`);
  };

  return (
    <section className="w-full px-1 py-10 xl:px-0">
      <h2 className="text-3xl font-bold mb-6 text-green-800 flex items-center gap-2">
        <BookOpen className="text-green-600" size={32} />
        Explore Our Sustainability Courses
      </h2>
      {loading ? (
        <div className="py-8">Loading courses...</div>
      ) : error ? (
        <div className="py-8 text-center">
          <p className="text-red-600 mb-4">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
          {courses.length === 0 && (
            <div className="col-span-3 text-gray-500 text-center">
              No courses available. Please check back later.
            </div>
          )}
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              image={DEFAULT_COURSE_IMAGE}
              title={course.title}
              description={course.description || ""}
              price={course.price ? `USD ${(course.price as number).toFixed(2)}` : "USD 0.00"}
              onView={() => handleViewCourse(course)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
