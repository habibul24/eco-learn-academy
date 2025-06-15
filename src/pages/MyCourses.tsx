
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CourseCard from "@/components/CourseCard"; // import Card

const DEFAULT_COURSE_IMAGE =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";

export default function MyCourses() {
  const { user, loading } = useAuthUser();
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoadingCourses(true);
      // Fetch enrolled courses joined with course data
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("course_id, courses (id, title, description, price)")
        .eq("user_id", user.id)
        .eq("status", "active");
      if (data) {
        setCourses(
          (data as any[]).map(
            (row) =>
              row.courses && {
                id: row.courses.id,
                title: row.courses.title,
                description: row.courses.description,
                price: row.courses.price,
              }
          ).filter(Boolean)
        );
      }
      setLoadingCourses(false);
    })();
  }, [user]);

  if (loading || loadingCourses) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white w-full flex justify-center items-center">
        <Navbar />
        <div className="py-20 text-xl text-green-900 font-semibold">Loading enrolled courses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white w-full">
      <Navbar />
      <main className="pt-32 pb-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-white rounded-xl shadow-lg px-10 py-8 max-w-2xl w-full flex flex-col gap-5">
          <h1 className="text-2xl font-bold text-green-800 mb-2 flex gap-2 items-center">
            <BookOpen className="text-green-600" size={26} />
            My Courses
          </h1>
          {courses.length === 0 ? (
            <p className="text-muted-foreground">You have not enrolled in any courses yet.</p>
          ) : (
            <div className="grid gap-4">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  image={DEFAULT_COURSE_IMAGE}
                  title={course.title}
                  description={course.description || ""}
                  price={course.price ? `USD ${(course.price).toFixed(2)}` : "USD 0.00"}
                  enrolled={true}
                  onView={() => navigate(`/enrolled-course/${course.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
