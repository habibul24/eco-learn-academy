
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminSummaryCards from "@/components/AdminSummaryCards";
import AdminSearchTable from "@/components/AdminSearchTable";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useNavigate } from "react-router-dom";

// No "list_all_users" function in DB, so just return an empty array for users column/stats for now
async function fetchAdminStats() {
  // Get all stats: courses, enrollments, completions, and users if available
  // TODO: Replace this when user list is in DB
  const [
    { data: courses },
    { data: enrollments },
    { data: completions }
  ] = await Promise.all([
    supabase.from("courses").select("*"),
    supabase.from("course_enrollments").select("*"),
    supabase.from("user_progress").select("*"),
  ]);
  // Try to fetch users table, fallback empty:
  let users = [];
  try {
    const { data: usersData } = await supabase.rpc("list_all_users"); // Only works if function exists
    if (usersData) users = usersData;
  } catch {
    // fallback: no users table
    users = [];
  }
  return {
    users,
    courses: courses ?? [],
    enrollments: enrollments ?? [],
    completions: completions ?? [],
  };
}

export default function AdminDashboard() {
  const { user, loading } = useAuthUser();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // 1. Check role - if not admin, redirect
  const { data: rolesData } = useQuery({
    queryKey: ["my-roles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      return data?.map(d => d.role) || [];
    },
    enabled: !!user?.id,
  });

  React.useEffect(() => {
    if (!loading && rolesData && !rolesData.includes("admin")) {
      navigate("/");
    }
  }, [rolesData, loading, navigate]);

  // 2. Fetch stats for cards/table
  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
  });

  if (loading || statsQuery.isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Admin Dashboard...</div>;
  }

  const { users = [], courses = [], enrollments = [], completions = [] } = statsQuery.data || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white pt-20 pb-10 px-2 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-green-900">Admin Dashboard</h1>
        {statsQuery.data && (
          <AdminSummaryCards
            totalUsers={users.length}
            totalCourses={courses.length}
            totalEnrollments={enrollments.length}
            completions={completions}
          />
        )}
        <div className="mt-10 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-semibold text-green-800">All Users, Courses & Enrollments</h2>
          <input
            className="border border-yellow-300 rounded px-4 py-2 shadow w-full sm:w-96 text-green-900 focus:ring-2 focus:ring-yellow-400"
            placeholder="Search users, courses, enrollments..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <AdminSearchTable
          search={search}
          users={users}
          courses={courses}
          enrollments={enrollments}
        />
      </div>
    </div>
  );
}
