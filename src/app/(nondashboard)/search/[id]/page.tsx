"use client";

import { useGetAuthUserQuery } from "@/state/api/authEndpoints";
import { useParams } from "next/navigation";
import { useState } from "react";
import ImagePreviews from "./ImagePreviews";

const SingleListing = () => {
  const { id } = useParams();
  const propertyId = Number(id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: authUser } = useGetAuthUserQuery();
  return (
    <div>
      <ImagePreviews
        images={["/singlelisting-2.jpg", "/singlelisting-3.jpg"]}
      />
      
    </div>
  );
};

export default SingleListing;
