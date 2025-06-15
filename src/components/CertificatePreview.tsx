
import React, { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";

type Props = {
  userName: string;
  courseTitle: string;
  certUrl?: string; // not used anymore, cert rendered in canvas
};

// Path to the template (already uploaded)
const TEMPLATE_SRC = "/lovable-uploads/e957ac2d-caf7-4093-af3e-a1d00fea5764.png";

// Certificate size (should match the template's intrinsic size, approximate if unsure)
const CERT_WIDTH = 1200;
const CERT_HEIGHT = 850;

export default function CertificatePreview({
  userName,
  courseTitle,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Draw certificate image and dynamic text
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load the template image
    const img = new window.Image();
    img.onload = () => {
      ctx.clearRect(0, 0, CERT_WIDTH, CERT_HEIGHT);
      ctx.drawImage(img, 0, 0, CERT_WIDTH, CERT_HEIGHT);

      // User name text (centered)
      ctx.font = "bold 48px sans-serif";
      ctx.fillStyle = "#134e27";
      ctx.textAlign = "center";
      ctx.shadowColor = "#fff";
      ctx.shadowBlur = 10;
      ctx.fillText(userName, CERT_WIDTH / 2, 410);

      // Course title text
      ctx.font = "32px sans-serif";
      ctx.fillStyle = "#134e27";
      ctx.shadowBlur = 0;
      ctx.fillText(courseTitle, CERT_WIDTH / 2, 490);

      setImgLoaded(true);
    };
    img.src = TEMPLATE_SRC;
  }, [userName, courseTitle]);

  // Download the canvas as PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "certificate.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="w-full flex flex-col items-center mb-6">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow border overflow-hidden mb-4 flex justify-center">
        <canvas
          ref={canvasRef}
          width={CERT_WIDTH}
          height={CERT_HEIGHT}
          className="w-full h-auto max-w-full max-h-[60vw] border rounded"
          style={{ background: "#fff" }}
          aria-label="Certificate Preview (canvas generated)"
        />
      </div>
      <div className="text-center">
        <div className="font-bold text-lg mb-2 break-words">{userName}</div>
        <div className="text-green-900 mb-3 break-words">{courseTitle}</div>
        <button
          className="mt-1 px-6 py-2 bg-green-700 hover:bg-green-800 text-white font-semibold rounded shadow inline-flex items-center gap-2"
          onClick={handleDownload}
          disabled={!imgLoaded}
        >
          <Download className="w-5 h-5" /> Download Certificate
        </button>
      </div>
    </div>
  );
}
