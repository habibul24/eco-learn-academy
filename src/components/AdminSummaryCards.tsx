
import React from "react";

type Props = {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  completions: any[];
};

export default function AdminSummaryCards({ totalUsers, totalCourses, totalEnrollments, completions }: Props) {
  // Calculate total completions (user_progress where watched is true)
  const completed = Array.isArray(completions) ? completions.filter(c => c.watched === true).length : 0;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
      <div className="bg-yellow-400 text-green-900 rounded-xl shadow-lg p-6 flex flex-col items-center">
        <div className="text-3xl font-bold">{totalUsers}</div>
        <div className="text-lg font-semibold mt-1">Total Users</div>
      </div>
      <div className="bg-yellow-400 text-green-900 rounded-xl shadow-lg p-6 flex flex-col items-center">
        <div className="text-3xl font-bold">{totalCourses}</div>
        <div className="text-lg font-semibold mt-1">Total Courses</div>
      </div>
      <div className="bg-yellow-400 text-green-900 rounded-xl shadow-lg p-6 flex flex-col items-center">
        <div className="text-3xl font-bold">{totalEnrollments}</div>
        <div className="text-lg font-semibold mt-1">Enrollments</div>
      </div>
      <div className="bg-yellow-100 text-green-900 rounded-xl shadow-lg p-6 flex flex-col items-center">
        <div className="text-3xl font-bold">{completed}</div>
        <div className="text-lg font-semibold mt-1">Completions</div>
      </div>
    </div>
  );
}
