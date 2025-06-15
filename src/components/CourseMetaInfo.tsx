
import React from "react";

type Props = {
  level?: string;
  mode?: string;
  priceFormatted: string;
};

export default function CourseMetaInfo({ level = "Beginner", mode = "Self-paced", priceFormatted }: Props) {
  return (
    <div className="flex items-center gap-4 flex-wrap mb-4">
      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">{level}</span>
      <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs">{mode}</span>
      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">{priceFormatted}</span>
    </div>
  );
}
