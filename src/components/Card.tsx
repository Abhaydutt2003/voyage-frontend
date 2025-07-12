import React, { useState } from "react";
import Image from "next/image";
import { Bath, Bed, Heart, House, Star, Share2 } from "lucide-react";
import Link from "next/link";
import { handleShare } from "@/lib/utils";

const Card = ({
  property,
  isFavorite,
  onFavoriteToggle,
  showFavoriteButton = true,
  propertyLink,
}: CardProps) => {
  const [imgSrc, setImgSrc] = useState(
    property.photoUrlsBaseKeys?.[0] || "/placeholder.jpg"
  );

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg w-full mb-5">
      <div className="relative">
        <div className="w-full h-48 relative">
          <Image
            src={imgSrc}
            alt={property.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc("/placeholder.jpg")}
          />
        </div>
        <div className="absolute bottom-4 left-4 flex gap-2">
          {property.isPetsAllowed && (
            <span className="bg-white/80 text-black text-xs font-semibold px-2 py-1 rounded-full">
              Pets Allowed
            </span>
          )}
          {property.isParkingIncluded && (
            <span className="bg-white/80 text-black text-xs font-semibold px-2 py-1 rounded-full">
              Parking Included
            </span>
          )}
        </div>
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            className="bg-white hover:bg-white/90 rounded-full p-2 cursor-pointer"
            onClick={async () => {
              await handleShare(property.id.toString());
            }}
            title="Share property"
          >
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
          {showFavoriteButton && (
            <button
              className="bg-white hover:bg-white/90 rounded-full p-2 cursor-pointer"
              onClick={onFavoriteToggle}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"
                }`}
              />
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-1">
          {propertyLink ? (
            <Link
              href={propertyLink}
              className="hover:underline hover:text-blue-600"
              scroll={false}
            >
              {property.name}
            </Link>
          ) : (
            property.name
          )}
        </h2>
        <p className="text-gray-600 mb-2">
          {property?.location?.address}, {property?.location?.city}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center mb-2">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            {property.averageRating && (
              <span className="font-semibold">
                {property.averageRating.toFixed(1)}
              </span>
            )}
            {property.numberOfReviews && (
              <span className="font-semibold">
                ({property.numberOfReviews} Reviews)
              </span>
            )}
          </div>
          <p className="text-lg font-bold mb-3">
            ${property.pricePerNight.toFixed(0)}{" "}
            <span className="text-gray-600 text-base font-normal"> /night</span>
          </p>
        </div>
        <hr />
        <div className="flex justify-between items-center gap-4 text-gray-600 mt-5">
          <span className="flex items-center">
            <Bed className="w-5 h-5 mr-2" />
            {property.beds} Bed{`${property.beds > 1 ? "s" : ""}`}
          </span>
          <span className="flex items-center">
            <Bath className="w-5 h-5 mr-2" />
            {property.baths} Bath{`${property.baths > 1 ? "s" : ""}`}
          </span>
          <span className="flex items-center">
            <House className="w-5 h-5 mr-2" />
            {property.squareFeet} sq ft
          </span>
        </div>
      </div>
    </div>
  );
};

export default Card;
