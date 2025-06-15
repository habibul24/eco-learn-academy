
import React from "react";

type Props = {
  userName: string;
  courseTitle: string;
  onDownload?: () => void;
  certUrl?: string; // If present, shows the generated image preview
};

// Simple certificate preview, fallback style
export default function CertificatePreview({ userName, courseTitle, onDownload, certUrl }: Props) {
  return (
    <div className="w-full flex flex-col items-center mb-6">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow border overflow-hidden mb-4">
        {certUrl ? (
          <img src={certUrl} alt="Certificate Preview" className="w-full" />
        ) : (
          <img src="/lovable-uploads/e957ac2d-caf7-4093-af3e-a1d00fea5764.png" className="w-full" alt="Template" />
        )}
      </div>
      <div className="text-center">
        <div className="font-bold text-lg mb-2">{userName}</div>
        <div className="text-green-900">{courseTitle}</div>
        <button
          className="mt-3 px-6 py-2 bg-green-700 hover:bg-green-800 text-white font-semibold rounded shadow"
          onClick={onDownload}
        >
          Download Certificate
        </button>
      </div>
    </div>
  );
}
