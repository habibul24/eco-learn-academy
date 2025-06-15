
import React from "react";
import Navbar from "@/components/Navbar";

export default function MyCourses() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white w-full">
      <Navbar />
      <main className="pt-32 pb-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-white rounded-xl shadow-lg px-10 py-8 max-w-xl w-full flex flex-col gap-5">
          <h1 className="text-2xl font-bold text-green-800 mb-2">My Courses</h1>
          <p className="text-muted-foreground">
            Here you'll find a list of all courses you are enrolled in. (Coming soon!)
          </p>
        </div>
      </main>
    </div>
  );
}
