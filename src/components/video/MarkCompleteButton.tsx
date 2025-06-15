
import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type MarkCompleteButtonProps = {
  onClick: () => void;
  loading?: boolean;
};

const MarkCompleteButton: React.FC<MarkCompleteButtonProps> = ({ onClick, loading }) => (
  <div className="absolute bottom-5 right-5 z-20">
    <Button onClick={onClick} disabled={loading} variant="default" size="lg" className="flex items-center gap-2 shadow">
      {loading ? "Saving..." : (
        <>
          <Check className="text-green-800" />
          Mark as Complete
        </>
      )}
    </Button>
  </div>
);

export default MarkCompleteButton;
