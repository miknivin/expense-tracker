// src/components/expenses/ExpenseLightbox.tsx
"use client";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Image from "next/image";

interface ExpenseLightboxProps {
  open: boolean;
  onClose: () => void;
  src: string | null;
}

export default function ExpenseLightbox({ open, onClose, src }: ExpenseLightboxProps) {
  if (!src) return null;

  return (
    <Lightbox
      open={open}
      close={onClose}
      slides={[{ src }]}
      carousel={{ finite: true }}
      toolbar={{
        buttons: ["close"],
      }}
      // Override the root container's z-index to be extremely high
      styles={{
        root: { zIndex: 999999999999999 },
        container: { backgroundColor: "rgba(0, 0, 0, 0.9)" }, // Optional: darker backdrop for better visibility
      }}
      render={{
        slide: ({ slide }) => (
          <div className="flex items-center justify-center h-full">
            {src.endsWith(".pdf") ? (
              <iframe src={src} className="w-full h-full" title="Bill PDF" />
            ) : (
              <Image
                src={slide.src}
                alt="Bill"
                width={900}
                height={600}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        ),
      }}
    />
  );
}