import { useGetAuthUserQuery } from "@/state/api/authEndpoints";
import { useGetTenantQuery } from "@/state/api/tenantEndpoints";
import React from "react";

const Favorites = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant } = useGetTenantQuery(
    authUser?.cognitoInfo?.userId || "",
    {
      skip: !authUser?.cognitoInfo?.userId,
    }
  );

  return <div>page</div>;
};

export default Favorites;
