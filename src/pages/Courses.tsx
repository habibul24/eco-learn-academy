
import Navbar from "@/components/Navbar";
import CourseCatalog from "@/components/CourseCatalog";
import React from "react";

export default function Courses() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white w-full">
      <Navbar />
      <main className="pt-28 max-w-[1400px] mx-auto pb-20">
        <CourseCatalog />
      </main>
    </div>
  );
}
