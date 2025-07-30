import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import GalleryGrid from "@/components/GalleryGrid";
import Lightbox from "@/components/Lightbox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { PhotoWithSection, Section } from "@shared/schema";

export default function Gallery() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoWithSection | null>(null);

  const { data: photos = [], isLoading: photosLoading } = useQuery<PhotoWithSection[]>({
    queryKey: ["/api/photos"],
  });

  const { data: sections = [], isLoading: sectionsLoading } = useQuery<Section[]>({
    queryKey: ["/api/sections"],
  });

  const isLoading = photosLoading || sectionsLoading;

  const filteredPhotos = selectedFilter === "all" 
    ? photos 
    : photos.filter(photo => photo.section?.slug === selectedFilter);

  const handlePhotoClick = (photo: PhotoWithSection) => {
    setLightboxPhoto(photo);
    // Increment view count
    fetch(`/api/photos/${photo.id}/view`, { method: 'POST' }).catch(console.error);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-16">
          <div className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <Skeleton className="h-10 w-64 mx-auto mb-4" />
                <Skeleton className="h-6 w-96 mx-auto" />
              </div>
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-24 rounded-full" />
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <Skeleton key={i} className="h-80 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-16">
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-light mb-4">Photography Gallery</h1>
              <p className="text-xl text-gray-600">Explore my work across different photography styles</p>
            </div>

            {/* Gallery Categories */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Button
                variant={selectedFilter === "all" ? "default" : "outline"}
                onClick={() => setSelectedFilter("all")}
                className="rounded-full"
              >
                All Work
              </Button>
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant={selectedFilter === section.slug ? "default" : "outline"}
                  onClick={() => setSelectedFilter(section.slug)}
                  className="rounded-full"
                >
                  {section.name}
                </Button>
              ))}
            </div>

            {/* Gallery Grid */}
            {filteredPhotos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600">No photos found in this category.</p>
              </div>
            ) : (
              <GalleryGrid 
                photos={filteredPhotos} 
                onPhotoClick={handlePhotoClick}
              />
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <Lightbox
          photo={lightboxPhoto}
          onClose={() => setLightboxPhoto(null)}
        />
      )}
    </div>
  );
}
