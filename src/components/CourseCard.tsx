import { Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
  image: string;
  title: string;
  instructor: string;
  enrolled: number;
  nextRun: string;
  price: string;
  onView: () => void;
}

export default function CourseCard({
  image,
  title,
  instructor,
  enrolled,
  nextRun,
  price,
  onView,
}: CourseCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white dark:bg-background border border-border rounded-xl shadow-lg overflow-hidden flex flex-col hover:scale-105 transition-transform duration-200 cursor-pointer group"
      onClick={onView ? onView : undefined}
      tabIndex={0}
      // Make the entire card clickable, but also handle click on "View Course"
      role="button"
    >
      <div className="h-40 w-full overflow-hidden">
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="flex-1 flex flex-col p-5 gap-2">
        <h3 className="font-bold text-xl text-green-900">{title}</h3>
        <div className="text-muted-foreground text-sm">{instructor}</div>
        <div className="flex items-center gap-3 py-2">
          <span className="flex items-center gap-1 text-xs">
            <Users size={16} className="text-green-600" /> {enrolled} enrolled
          </span>
          <span className="flex items-center gap-1 text-xs">
            <Calendar size={16} className="text-green-600" /> Next: {nextRun}
          </span>
        </div>
        <div className="mt-auto flex justify-between items-end">
          <span className="font-semibold text-green-700 text-lg">{price}</span>
          <button
            onClick={e => {
              e.stopPropagation();
              if (onView) {
                onView();
              } else {
                // fallback—to props with "id"
                navigate(`/course/${title.replace(/\s+/g, "-").toLowerCase()}`);
              }
            }}
            className="bg-green-600 text-white rounded px-4 py-1 text-sm font-semibold hover:bg-green-700 transition"
          >
            View Course
          </button>
        </div>
      </div>
    </div>
  );
}
