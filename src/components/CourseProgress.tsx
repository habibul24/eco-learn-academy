
import React from "react";
import { Progress } from "@/components/ui/progress";

type CourseProgressProps = {
  progress: number;
  allWatched: boolean;
};

const CourseProgress: React.FC<CourseProgressProps> = ({ progress, allWatched }) => (
  <div className="mb-4">
    <div className="text-sm text-green-900 font-semibold mb-1">
      Course Progress: {progress}%
    </div>
    <Progress value={progress} />
    {allWatched && (
      <div className="mt-2 text-green-800 font-bold">
        Congratulations! You have completed this course and earned a certificate.
      </div>
    )}
  </div>
);

export default CourseProgress;
