
import React from "react";
import { Users, Book, ListCheck, Check } from "lucide-react";

type Props = {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  completions: any[];
};

export default function AdminSummaryCards({
  totalUsers,
  totalCourses,
  totalEnrollments,
  completions,
}: Props) {
  const completed =
    Array.isArray(completions)
      ? completions.filter((c) => c.watched === true).length
      : 0;
  // Only show available summary stats; users not available
  const cards = [
    // Optionally: Show users count card but display "N/A"
    {
      icon: <Users className="w-7 h-7 mb-3 text-green-900" />,
      value: totalUsers === null ? "N/A" : totalUsers,
      label: "Total Users",
      color: "from-yellow-400 to-yellow-300 border-yellow-300",
    },
    {
      icon: <Book className="w-7 h-7 mb-3 text-green-900" />,
      value: totalCourses,
      label: "Total Courses",
      color: "from-yellow-400 to-green-200 border-yellow-400",
    },
    {
      icon: <ListCheck className="w-7 h-7 mb-3 text-green-900" />,
      value: totalEnrollments,
      label: "Enrollments",
      color: "from-green-100 to-yellow-200 border-green-200",
    },
    {
      icon: <Check className="w-7 h-7 mb-3 text-green-900" />,
      value: completed,
      label: "Completions",
      color: "from-green-200 to-green-100 border-green-200",
    },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
      {cards.map(({ icon, value, label, color }, idx) => (
        <div
          key={label}
          className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-6 flex flex-col items-center border hover-scale transition-transform`}
        >
          {icon}
          <div className="text-3xl font-bold text-green-900">{value}</div>
          <div className="text-base font-semibold mt-1 text-green-900">{label}</div>
        </div>
      ))}
    </div>
  );
}
