
import React from "react";

export const AuthWarning: React.FC = () => {
  return (
    <div className="rounded-lg overflow-hidden mb-4 aspect-video bg-yellow-50 border border-yellow-300 flex flex-col items-center justify-center p-8">
      <div className="text-yellow-900 font-semibold mb-2">
        You must be signed in to track your course progress.
      </div>
      <div className="text-yellow-700 text-sm">
        Please <b>log in</b> to continue tracking your earned progress.
      </div>
    </div>
  );
};
