"use client";
import { useGetAuthUserQuery } from "@/state/api/authEndpoints";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import Loading from "./Loading";

const RouteGaurd = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { data: authUser, isLoading } = useGetAuthUserQuery();

  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && authUser) {
      const userRole = authUser.userRole?.toLowerCase();
      if (userRole === "manager" && pathname == "/") {
        router.push("/managers/properties");
      } else if (userRole === "tanant" && pathname == "/") {
        router.push("/tenants/favorites");
      }
    }
  }, [authUser, isLoading, router, pathname]);

  if (isLoading) {
    return <Loading />;
  }
  if (authUser) {
    return <Loading />;
  }

  return <>{children}</>;
};

export default RouteGaurd;
