import { AmenityIcons, HighlightIcons } from "@/lib/constants";
import { formatEnumString } from "@/lib/utils";
import { useGetPropertyQuery } from "@/state/api/propertyEndpoints";
import { Amenity, Highlight } from "@/types/prismaTypes";
import { HelpCircle } from "lucide-react";
import React from "react";
import Loading from "../Loading";
// Import Checkbox and Label components
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const PropertyDetails = ({ propertyId }: PropertyDetailsProps) => {
  const {
    data: property,
    isError,
    isLoading,
  } = useGetPropertyQuery(propertyId);

  if (isLoading) return <Loading />;
  if (isError || !property) {
    return <>Property not Found</>;
  }

  return (
    <div className="mb-6">
      {/* Amenities */}
      <div>
        <h2 className="text-xl font-semibold my-3">Property Amenities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {property.amenities.map((amenity: Amenity) => {
            const Icon = AmenityIcons[amenity as Amenity] || HelpCircle;
            return (
              <div
                key={amenity}
                className="flex flex-col items-center border rounded-xl py-8 px-4"
              >
                <Icon className="w-8 h-8 mb-2 text-gray-700" />
                <span className="text-sm text-center text-gray-700">
                  {formatEnumString(amenity)}
                </span>
              </div>
            );
          })}
        </div>
        {/* Highlights */}
        <div className="mt-12 mb-16">
          <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-100">
            Highlights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-4 w-full">
            {property.highlights.map((highlight: Highlight) => {
              const Icon = HighlightIcons[highlight as Highlight] || HelpCircle;
              return (
                <div
                  key={highlight}
                  className="flex flex-col items-center border rounded-xl py-8 px-4"
                >
                  <Icon className="w-8 h-8 mb-2 text-primary-600 dark:text-primary-300" />
                  <span className="text-sm text-center text-primary-600 dark:text-primary-300">
                    {formatEnumString(highlight)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-100 mb-5">
            Policies
          </h3>

          {/* Pets Allowed */}
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="pets-allowed"
              checked={property.isPetsAllowed}
              disabled // Disable for display only
            />
            <Label htmlFor="pets-allowed" className="text-base">
              Pets Allowed
            </Label>
          </div>

          {/* Parking Available */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="parking-available"
              checked={property.isParkingIncluded}
              disabled // Disable for display only
            />
            <Label htmlFor="parking-available" className="text-base">
              Parking Available
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
