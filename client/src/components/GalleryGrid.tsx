import type { PhotoWithSection } from "@shared/schema";

interface GalleryGridProps {
  photos: PhotoWithSection[];
  onPhotoClick: (photo: PhotoWithSection) => void;
}

export default function GalleryGrid({ photos, onPhotoClick }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="group cursor-pointer relative overflow-hidden rounded-lg"
          onClick={() => onPhotoClick(photo)}
        >
          <img
            src={`/api/images/${photo.filename}`}
            alt={photo.title}
            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end">
            <div className="p-4 text-white">
              <h4 className="font-medium">{photo.title}</h4>
              {photo.section && (
                <p className="text-sm opacity-90">{photo.section.name}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
