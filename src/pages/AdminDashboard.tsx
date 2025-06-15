
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminSummaryCards from "@/components/AdminSummaryCards";
import AdminSearchTable from "@/components/AdminSearchTable";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

// Only fetch courses, enrollments, completions, and now count non-admin users for stats
async function fetchAdminStats() {
  const [
    { data: courses },
    { data: enrollments },
    { data: completions },
    { data: userRoles }
  ] = await Promise.all([
    supabase.from("courses").select("*"),
    supabase.from("course_enrollments").select("*"),
    supabase.from("user_progress").select("*"),
    supabase.from("user_roles").select("*") // We count 'user' role below
  ]);
  // Count only users with role 'user', not 'admin'
  const totalUsers = userRoles ? userRoles.filter(r => r.role === 'user').length : 0;
  return {
    courses: courses ?? [],
    enrollments: enrollments ?? [],
    completions: completions ?? [],
    totalUsers
  };
}

export default function AdminDashboard() {
  const { user, loading } = useAuthUser();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // 1. Check role - if not admin, redirect
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["my-roles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      return data?.map((d) => d.role) || [];
    },
    enabled: !!user?.id,
  });

  const isAdmin = !!rolesData && rolesData.includes("admin");

  React.useEffect(() => {
    if (!loading && rolesData && !rolesData.includes("admin")) {
      navigate("/");
    }
  }, [rolesData, loading, navigate]);

  // 2. Fetch stats for cards/table, only after rolesData confirmed
  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
    enabled: !!isAdmin, // Only run when isAdmin is true
  });

  React.useEffect(() => {
    if (
      !loading &&
      isAdmin &&
      statsQuery.data &&
      !statsQuery.isLoading &&
      statsQuery.data.enrollments &&
      statsQuery.data.enrollments.length === 0
    ) {
      toast({
        title: "Heads up!",
        description:
          "No enrollments found. If you expected enrollments, verify RLS and test in the Supabase SQL console.",
        variant: "default",
      });
    }
    // Debug: See what data the admin sees
    if (statsQuery.data) {
      // eslint-disable-next-line no-console
      console.log('ADMIN ENROLLMENTS DATA', statsQuery.data.enrollments);
    }
  }, [loading, isAdmin, statsQuery.data, statsQuery.isLoading, toast]);

  if (loading || rolesLoading || statsQuery.isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Admin Dashboard...</div>;
  }

  const { courses = [], enrollments = [], completions = [], totalUsers = 0 } = statsQuery.data || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white pt-20 pb-10 px-2 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-green-900">Admin Dashboard</h1>
        <AdminSummaryCards
          totalUsers={totalUsers}
          totalCourses={courses.length}
          totalEnrollments={enrollments.length}
          completions={completions}
        />
        <div className="mt-10 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-semibold text-green-800">All Courses & Enrollments</h2>
          <input
            className="border border-yellow-300 rounded px-4 py-2 shadow w-full sm:w-96 text-green-900 focus:ring-2 focus:ring-yellow-400"
            placeholder="Search courses, enrollments..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <AdminSearchTable
          search={search}
          users={[]} // Not fetching user data, only counting users now
          courses={courses}
          enrollments={enrollments}
        />
      </div>
    </div>
  );
}
