"use client";
import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useGetAuthUserQuery } from "@/state/api/authEndpoints";
import {
  useGetCurrentResidencesQuery,
  useGetTenantQuery,
} from "@/state/api/tenantEndpoints";
import React from "react";

const Residences = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant } = useGetTenantQuery(
    authUser?.cognitoInfo?.userId || "",
    {
      skip: !authUser?.cognitoInfo?.userId,
    }
  );

  const {
    data: currentResidences,
    isLoading,
    error,
  } = useGetCurrentResidencesQuery(authUser?.cognitoInfo?.userId || "", {
    skip: !authUser?.cognitoInfo?.userId,
  });

  if (isLoading) return <Loading />;
  if (error) return <div>Error loading current residences</div>;

  return (
    <div className="pt-8 pb-5 px-8">
      <Header
        title="Current Residences"
        subtitle="View and manage your current living spaces"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentResidences?.map((property) => (
          <Card
            key={property.id}
            property={property}
            isFavorite={
              tenant?.favorites?.some(
                (favoriteProperty) => favoriteProperty.id === property.id
              ) || false
            }
            onFavoriteToggle={() => {}}
            showFavoriteButton={false}
            propertyLink={`/tenants/residences/${property.id}`}
          />
        ))}
      </div>
      {(!currentResidences || currentResidences.length === 0) && (
        <p>You don&lsquo;t have any current residences</p>
      )}
    </div>
  );
};

export default Residences;
