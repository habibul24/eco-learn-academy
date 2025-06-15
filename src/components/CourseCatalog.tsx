
import { useState, useEffect } from "react";
import CourseCard from "./CourseCard";
import { Dialog } from "@/components/ui/dialog";
import { BookOpen, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_COURSE_IMAGE = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";

// Typing for clarity
type CourseType = {
  id: number;
  title: string;
  description: string;
  price: number;
};

type ActiveCourseType = CourseType & {
  image: string;
  instructor: string;
  enrolled: number;
  nextRun: string;
  curriculum: string[];
};

export default function CourseCatalog() {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [activeCourse, setActiveCourse] = useState<ActiveCourseType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase.from("courses").select("*").order("id");
      if (data) setCourses(data);
      setLoading(false);
    }
    fetchCourses();
  }, []);

  const handleViewCourse = async (course: CourseType) => {
    // Fetch chapters as "curriculum"
    const { data: chaptersData } = await supabase
      .from("chapters")
      .select("title")
      .eq("course_id", course.id)
      .order("order_index");
    // Build "active" course props for the dialog
    setActiveCourse({
      ...course,
      image: DEFAULT_COURSE_IMAGE,
      instructor: "Sustainable Team",
      enrolled: 125,
      nextRun: "Jul 6",
      curriculum: chaptersData ? chaptersData.map((c) => c.title) : [],
    });
  };

  return (
    <section className="w-full px-1 py-10 xl:px-0">
      <h2 className="text-3xl font-bold mb-6 text-green-800 flex items-center gap-2">
        <BookOpen className="text-green-600" size={32} />
        Explore Our Sustainability Courses
      </h2>
      {loading ? (
        <div className="py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
          {courses.length === 0 && (
            <div className="col-span-3 text-gray-500">No courses available.</div>
          )}
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              image={DEFAULT_COURSE_IMAGE}
              title={course.title}
              instructor="Sustainable Team"
              enrolled={125}
              nextRun="Jul 6"
              price={course.price ? `USD ${parseFloat(course.price as any).toFixed(2)}` : "USD 0.00"}
              onView={() => handleViewCourse(course)}
            />
          ))}
        </div>
      )}

      {activeCourse && (
        <Dialog open={!!activeCourse} onOpenChange={() => setActiveCourse(null)}>
          <div className="fixed inset-0 bg-black/20 z-[100][100] flex justify-center items-center">
            <div className="bg-white dark:bg-background rounded-xl shadow-xl w-full max-w-lg p-8 relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-green-600"
                aria-label="Close"
                onClick={() => setActiveCourse(null)}
              >
                &times;
              </button>
              <div className="flex gap-6 mb-4">
                <img
                  src={activeCourse.image}
                  alt={activeCourse.title}
                  className="rounded-lg w-28 h-28 object-cover"
                />
                <div>
                  <h3 className="font-bold text-2xl text-green-900">{activeCourse.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                    <User size={16} className="text-green-600" />
                    {activeCourse.instructor}
                  </div>
                </div>
              </div>
              <p className="text-lg mb-2">{activeCourse.description}</p>
              <div>
                <h4 className="font-semibold mb-2">Curriculum</h4>
                <ul className="list-disc list-inside text-sm pl-2 mb-4">
                  {activeCourse.curriculum.map((topic, idx) => (
                    <li key={idx}>{topic}</li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between items-end">
                <span className="font-bold text-green-700 text-2xl">
                  {activeCourse.price ? `USD ${parseFloat(activeCourse.price as any).toFixed(2)}` : "USD 0.00"}
                </span>
                <button
                  className="bg-green-600 text-white rounded px-8 py-2 text-base font-semibold hover:bg-green-800 transition pulse"
                  onClick={() => alert("Connect Supabase & Stripe to enable checkout!")}
                >
                  Purchase Course
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </section>
  );
}
