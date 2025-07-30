import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { PhotoWithSection } from "@shared/schema";

interface LightboxProps {
  photo: PhotoWithSection;
  onClose: () => void;
}

export default function Lightbox({ photo, onClose }: LightboxProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-full">
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <X className="h-6 w-6" />
        </Button>
        
        <img
          src={`/api/images/${photo.filename}`}
          alt={photo.title}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white rounded-b-lg">
          <h3 className="text-xl font-semibold mb-2">{photo.title}</h3>
          {photo.description && (
            <p className="text-gray-200">{photo.description}</p>
          )}
          {photo.section && (
            <p className="text-sm text-gray-300 mt-2">
              Category: {photo.section.name}
            </p>
          )}
          {photo.tags && photo.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {photo.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/20 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
