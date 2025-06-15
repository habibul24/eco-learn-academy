
import { useState } from "react";
import CourseCard from "./CourseCard";
import { Dialog } from "@/components/ui/dialog";
import { BookOpen, User } from "lucide-react";

// Dummy course data
const courses = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    title: "Introduction to Sustainable Living",
    instructor: "Jane Yuen",
    enrolled: 340,
    nextRun: "Jul 8, 2025",
    price: "$29",
    description:
      "Learn the basics of sustainability in daily life—from consuming less to reusing and recycling efficiently. This is your gateway to a greener tomorrow.",
    curriculum: [
      "Understanding Sustainability",
      "Eco-friendly Home Habits",
      "Composting & Recycling 101",
      "Sustainable Shopping",
    ],
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80",
    title: "Urban Gardening & Community Food",
    instructor: "Carlos Verde",
    enrolled: 210,
    nextRun: "Aug 21, 2025",
    price: "$49",
    description:
      "Transform city spaces with practical skills for urban gardening. Grow food, build community plots, and contribute to local sustainability.",
    curriculum: [
      "Basics of Urban Gardening",
      "Building a Community Plot",
      "Seasonal Planting Schedules",
      "Sharing & Harvesting",
    ],
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=800&q=80",
    title: "Corporate Sustainability Certification",
    instructor: "Avni Sharma",
    enrolled: 120,
    nextRun: "Sep 2, 2025",
    price: "$149",
    description:
      "Get certified! This expert-led course empowers companies and employees to implement impactful sustainability initiatives at scale.",
    curriculum: [
      "Sustainability in the Workplace",
      "Measuring Impact",
      "Regulatory Landscape",
      "Certification Exam & Project",
    ],
  },
];

// Typing for clarity
interface ActiveCourseType extends (typeof courses)[number] {}

export default function CourseCatalog() {
  const [activeCourse, setActiveCourse] = useState<ActiveCourseType | null>(null);

  return (
    <section className="w-full px-1 py-10 xl:px-0">
      <h2 className="text-3xl font-bold mb-6 text-green-800 flex items-center gap-2">
        <BookOpen className="text-green-600" size={32} />
        Explore Our Sustainability Courses
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            image={course.image}
            title={course.title}
            instructor={course.instructor}
            enrolled={course.enrolled}
            nextRun={course.nextRun}
            price={course.price}
            onView={() => setActiveCourse(course)}
          />
        ))}
      </div>

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
                <span className="font-bold text-green-700 text-2xl">{activeCourse.price}</span>
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
