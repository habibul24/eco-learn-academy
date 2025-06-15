
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

export default function AdminSearchTable({ search, users, courses, enrollments }: Props) {
  // For this first version just list users, courses and enrollments.
  // We'll display all, but filter by search string.
  // Admins might want better grouping, but this is a start.
  const userRows = (users ?? []).filter(u => matchesSearch(u, search));
  const courseRows = (courses ?? []).filter(c => matchesSearch(c, search));
  const enrollmentRows = (enrollments ?? []).filter(e => matchesSearch(e, search));

  return (
    <div className="bg-white rounded-xl p-4 shadow border">
      <div className="overflow-x-auto">
        <h3 className="text-lg font-bold mb-3 text-green-900">Users</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              {Object.keys(userRows[0] ?? {}).filter(k => k !== "id").map(k => (
                <TableHead key={k}>{k}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {userRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="italic text-gray-500">No users found</TableCell>
              </TableRow>
            )}
            {userRows.map(u => (
              <TableRow key={u.id ?? u.user_id ?? Math.random()}>
                <TableCell>{u.id ?? u.user_id ?? "-"}</TableCell>
                {Object.keys(u).filter(k => k !== "id").map(k => (
                  <TableCell key={k}>{String(u[k])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <h3 className="text-lg font-bold mt-8 mb-3 text-green-900">Courses</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course ID</TableHead>
              {Object.keys(courseRows[0] ?? {}).filter(k => k !== "id").map(k => (
                <TableHead key={k}>{k}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {courseRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="italic text-gray-500">No courses found</TableCell>
              </TableRow>
            )}
            {courseRows.map(c => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                {Object.keys(c).filter(k => k !== "id").map(k => (
                  <TableCell key={k}>{String(c[k])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <h3 className="text-lg font-bold mt-8 mb-3 text-green-900">Enrollments</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Enrollment ID</TableHead>
              {Object.keys(enrollmentRows[0] ?? {}).filter(k => k !== "id").map(k => (
                <TableHead key={k}>{k}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollmentRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="italic text-gray-500">No enrollments found</TableCell>
              </TableRow>
            )}
            {enrollmentRows.map(e => (
              <TableRow key={e.id}>
                <TableCell>{e.id}</TableCell>
                {Object.keys(e).filter(k => k !== "id").map(k => (
                  <TableCell key={k}>{String(e[k])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
