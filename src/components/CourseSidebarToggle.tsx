
import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onToggle: () => void;
};

const CourseSidebarToggle: React.FC<Props> = ({ open, onToggle }) => (
  <Button
    variant="outline"
    className="mb-2 w-full"
    onClick={onToggle}
    aria-label={open ? "Hide course content" : "Show course content"}
  >
    {open ? "Hide Course Content" : "Show Course Content"}
  </Button>
);

export default CourseSidebarToggle;
