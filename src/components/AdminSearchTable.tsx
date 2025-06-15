
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * Expect users, courses, enrollments as arrays of objects.
 * Only show a few relevant fields for each type (hide created_at, description, etc).
 */
type User = any;
type Course = any;
type Enrollment = any;

type Props = {
  search: string;
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
};

function matchesSearch(obj: any, search: string) {
  if (!search) return true;
  const s = search.toLowerCase();
  return Object.values(obj).some(val => String(val ?? "").toLowerCase().includes(s));
}

function getUserName(u: any) {
  // Prefer full_name, then name, then email, then ID
  return u.full_name || u.name || u.email || u.id || "-";
}

export default function AdminSearchTable({ search, users, courses, enrollments }: Props) {
  const userRows = (users ?? []).filter(u => matchesSearch(u, search));
  const courseRows = (courses ?? []).filter(c => matchesSearch(c, search));
  const enrollmentRows = (enrollments ?? []).filter(e => matchesSearch(e, search));

  return (
    <div className="bg-white rounded-xl p-4 shadow border animate-fade-in">
      <div className="overflow-x-auto">
        <h3 className="text-lg font-bold mb-3 text-green-900">Users</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="italic text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            )}
            {userRows.map(u => (
              <TableRow key={u.id ?? u.user_id ?? Math.random()}>
                <TableCell>{u.id ?? u.user_id ?? "-"}</TableCell>
                <TableCell>{getUserName(u)}</TableCell>
                <TableCell>{u.email || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <h3 className="text-lg font-bold mt-8 mb-3 text-green-900">Courses</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courseRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="italic text-gray-500">No courses found</TableCell>
              </TableRow>
            )}
            {courseRows.map(c => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.title}</TableCell>
                <TableCell>
                  {c.price !== undefined && c.price !== null
                    ? (+c.price).toLocaleString("en-US", { style: "currency", currency: "USD" })
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <h3 className="text-lg font-bold mt-8 mb-3 text-green-900">Enrollments</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Enroll. ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Course ID</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollmentRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="italic text-gray-500">No enrollments found</TableCell>
              </TableRow>
            )}
            {enrollmentRows.map(e => (
              <TableRow key={e.id}>
                <TableCell>{e.id}</TableCell>
                <TableCell>{e.user_id}</TableCell>
                <TableCell>{e.course_id}</TableCell>
                <TableCell>{e.status || "active"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
