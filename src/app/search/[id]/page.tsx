"use client";

import { useParams } from "next/navigation";
import React, { useState } from "react";
import ImagePreviews from "@/components/search/ImagePreviews";
import PropertyOverview from "@/components/search/PropertyOverview";
import PropertyDetails from "@/components/search/PropertyDetails";
import PropertyLocation from "@/components/search/PropertyLocation";
import ContactWidget from "@/components/search/ContactWidget";
import ApplicationModal from "@/components/search/ApplicationModal";
import { useGetAuthUserQuery } from "@/state/api/authEndpoints";
import { useGetPropertyQuery } from "@/state/api/propertyEndpoints";
import Loading from "@/components/Loading";

const SingleListing = () => {
  const { id } = useParams();
  const propertyId = Number(id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: authUser } = useGetAuthUserQuery();
  const {
    data: property,
    isError,
    isLoading,
  } = useGetPropertyQuery(propertyId);

  const propertyImages =
    property?.photoUrlsBaseKeys && property?.photoUrlsBaseKeys?.length > 0
      ? property?.photoUrlsBaseKeys
      : ["/singlelisting-2.jpg", "/singlelisting-3.jpg"];

  if (isLoading) {
    return <Loading></Loading>;
  }

  if (isError) {
    return <>Failed to load the property...</>;
  }

  return (
    <div>
      <ImagePreviews images={propertyImages} />
      <div className="flex flex-col md:flex-row justify-center gap-10 mx-10 md:w-2/3 md:mx-auto mt-16 mb-8 ">
        <div className="order-2 md:order-1">
          <PropertyOverview propertyId={propertyId} />
          <PropertyDetails propertyId={propertyId} />
          <PropertyLocation propertyId={propertyId} />
        </div>

        <div className="order-1 md:order-2 ">
          <ContactWidget
            propertyId={propertyId}
            onOpenModal={() => setIsModalOpen(true)}
          />
        </div>
      </div>

      {authUser && (
        <ApplicationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          propertyId={propertyId}
        />
      )}
    </div>
  );
};

export default SingleListing;
