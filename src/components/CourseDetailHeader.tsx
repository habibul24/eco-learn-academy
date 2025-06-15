
import React from "react";
import CourseMetaInfo from "./CourseMetaInfo";

type CourseDetailHeaderProps = {
  title: string;
  priceFormatted: string;
};

const CourseDetailHeader: React.FC<CourseDetailHeaderProps> = ({ title, priceFormatted }) => (
  <div className="mb-4">
    <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 mb-4">{title}</h1>
    <CourseMetaInfo priceFormatted={priceFormatted} />
  </div>
);

export default CourseDetailHeader;
