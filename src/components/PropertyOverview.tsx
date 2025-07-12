import { useGetPropertyQuery } from "@/state/api/propertyEndpoints";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Loading from "./Loading";
import Image from "next/image";
import { Bath, Bed, Home, MapPin, Users, Share2 } from "lucide-react";
import { handleShare } from "@/lib/utils";

const PropertyOverview = () => {
  const { id } = useParams();
  const {
    data: property,
    isLoading: propertyLoading,
    error: propertyError,
  } = useGetPropertyQuery(Number(id));

  const [imgSrc, setImgSrc] = useState("/placeholder.jpg");

  useEffect(() => {
    if (property?.photoUrlsBaseKeys?.[0]) {
      setImgSrc(property?.photoUrlsBaseKeys?.[0]);
    }
  }, [property]);

  if (propertyLoading) return <Loading />;
  if (propertyError || !property) return <div>Error loading property</div>;

  return (
    <div className="flex gap-5 flex-1">
      <Image
        src={imgSrc}
        alt={property.name}
        width={500}
        height={250}
        className="rounded-xl object-cover w-full lg:w-[500px] h-[250px]"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={() => setImgSrc("/placeholder.jpg")}
      />
      <div className="flex flex-col justify-between flex-1">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-bold">{property.name}</h2>
            <button
              className={`bg-white border border-gray-300 text-gray-700 py-2
              px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50 transition-colors cursor-pointer`}
              onClick={async () => handleShare(id?.toString() || "")}
            >
              <Share2 className="w-4 h-4 mr-2" />
              <span>Share This Property</span>
            </button>
          </div>
          <div className="flex items-center mb-2 text-gray-600">
            <MapPin className="w-5 h-5 mr-1" />
            <span>
              {property.location.city}, {property.location.state},{" "}
              {property.location.country}
            </span>
          </div>
          <p className="text-gray-600 mb-3">{property.description}</p>
          <div className="flex flex-wrap gap-4 mb-3">
            <div className="flex items-center text-gray-600">
              <Home className="w-4 h-4 mr-1" />
              <span className="text-sm">{property.propertyType}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Bed className="w-4 h-4 mr-1" />
              <span className="text-sm">{property.beds} beds</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Bath className="w-4 h-4 mr-1" />
              <span className="text-sm">{property.baths} baths</span>
            </div>
            {property.squareFeet && (
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-1" />
                <span className="text-sm">{property.squareFeet} sq ft</span>
              </div>
            )}
          </div>
          <div className="text-xl font-bold text-green-600">
            ${property.pricePerNight.toFixed(2)}{" "}
            <span className="text-gray-500 text-sm font-normal">/ night</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyOverview;
