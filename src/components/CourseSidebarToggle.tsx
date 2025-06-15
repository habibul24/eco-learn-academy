
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  open: boolean;
  onToggle: () => void;
};

const CourseSidebarToggle: React.FC<Props> = ({ open, onToggle }) => (
  <div className="flex items-center justify-center h-10">
    <Button
      variant="outline"
      size="icon"
      className="shadow border border-gray-300 bg-white"
      onClick={onToggle}
      aria-label={open ? "Hide course content" : "Show course content"}
      style={{ minWidth: 36, minHeight: 36 }}
    >
      {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </Button>
  </div>
);

export default CourseSidebarToggle;
