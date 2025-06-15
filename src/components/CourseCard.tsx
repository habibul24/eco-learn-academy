
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
  image: string;
  title: string;
  // show first 100 chars of desc as subtitle
  description: string;
  price: string;
  enrolled?: boolean; // show "Continue learning" if true
  onView: () => void;
}

export default function CourseCard({
  image,
  title,
  description,
  price,
  enrolled = false,
  onView,
}: CourseCardProps) {
  const navigate = useNavigate();

  // Extract first 100 chars for card subtitle
  const descriptionSnippet = description
    ? (description.length > 100 ? description.substring(0, 100) + "..." : description)
    : "";

  return (
    <div
      className="bg-white border border-border rounded-xl shadow-lg overflow-hidden flex flex-col hover:scale-105 transition-transform duration-200 cursor-pointer group"
      onClick={onView ? onView : undefined}
      tabIndex={0}
      role="button"
      aria-label={title}
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
        {/* Description snippet as subtitle */}
        <div className="text-muted-foreground text-sm">{descriptionSnippet}</div>
        {/* Tags: Beginner + Self-paced */}
        <div className="flex items-center gap-2 py-2">
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">Beginner</span>
          <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs">Self paced</span>
        </div>
        <div className="mt-auto flex justify-between items-end">
          <span className="font-semibold text-green-700 text-lg">{price}</span>
          <button
            onClick={e => {
              e.stopPropagation();
              if (onView) {
                onView();
              } else {
                navigate(`/course/${title.replace(/\s+/g, "-").toLowerCase()}`);
              }
            }}
            className={
              enrolled
                ? "bg-green-600 text-white rounded px-4 py-1 text-sm font-semibold hover:bg-green-700 transition"
                : "bg-green-600 text-white rounded px-4 py-1 text-sm font-semibold hover:bg-green-700 transition"
            }
            style={{
              minWidth: 140,
            }}
          >
            {enrolled ? "Continue learning" : "View Course"}
          </button>
        </div>
      </div>
    </div>
  );
}
