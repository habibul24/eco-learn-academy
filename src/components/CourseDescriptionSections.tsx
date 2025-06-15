
import React from "react";

type CourseDescriptionSectionsProps = {
  description: string;
  whoFor: string[];
  objectives: string[];
};

const CourseDescriptionSections: React.FC<CourseDescriptionSectionsProps> = ({
  description,
  whoFor,
  objectives,
}) => (
  <div>
    <div className="text-base text-gray-700 mb-5 whitespace-pre-line">
      {description.split("\n\n")[0]}
    </div>
    {whoFor.length > 0 && (
      <div className="mb-5">
        <h4 className="font-bold text-green-900 mb-1">Who is this course for?</h4>
        <ul className="list-disc ml-6 text-sm text-gray-800">
          {whoFor.map((item, i) => <li key={i}>{item.replace(/^- /, "")}</li>)}
        </ul>
      </div>
    )}
    {objectives.length > 0 && (
      <div>
        <h4 className="font-bold text-green-900 mb-1">Learning Objectives</h4>
        <ul className="list-disc ml-6 text-sm text-gray-800">
          {objectives.map((item, i) => <li key={i}>{item.replace(/^- /, "")}</li>)}
        </ul>
      </div>
    )}
  </div>
);

export default CourseDescriptionSections;
