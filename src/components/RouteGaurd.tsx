"use client";
import { useGetAuthUserQuery } from "@/state/api/authEndpoints";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import Loading from "./Loading";

//route gaurd will only come after the user has authenticated , see auth provider component
const RouteGaurd = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { data: authUser, isLoading } = useGetAuthUserQuery();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && authUser) {
      const userRole = authUser.userRole?.toLowerCase();
      if (pathname.startsWith("/search") && userRole === "manager") {
        //manager does not have access to search page
        router.push("/managers/properties", { scroll: false });
      }
    }
  }, [authUser, isLoading, pathname, router]);

  if (isLoading) {
    return <Loading />;
  }

  // Only render children if we're not redirecting
  if (
    authUser?.userRole?.toLowerCase() === "manager" &&
    pathname.startsWith("/search")
  ) {
    return <Loading />;
  }

  return <>{children}</>;
};

export default RouteGaurd;
