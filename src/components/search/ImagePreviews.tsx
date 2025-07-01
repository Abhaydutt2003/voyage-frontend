import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Note: Adjust this import path to match your project structure

const ImagePreviews = ({ images }: ImagePreviewsProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevents the dialog from opening on button click
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevents the dialog from opening on button click
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Dialog>
      <div className="relative h-[450px] w-full cursor-pointer">
        {images.map((image, index) => (
          <DialogTrigger asChild key={image}>
            <div
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={image}
                alt={`Property Image ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover bg-accent"
              />
            </div>
          </DialogTrigger>
        ))}

        {/* Dialog content for the enlarged image */}
        <DialogContent className="sm:max-w-[900px] h-auto ">
          <DialogTitle className=" font-bold">Property Image</DialogTitle>
          <Image
            src={images[currentImageIndex]}
            alt={`Enlarged property Image ${currentImageIndex + 1}`}
            width={900}
            height={600}
            className="object-contain w-full h-full"
          />
        </DialogContent>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 z-10"
          aria-label="Previous image"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 z-10"
          aria-label="Next image"
        >
          <ChevronRight />
        </button>
      </div>
    </Dialog>
  );
};

export default ImagePreviews;
