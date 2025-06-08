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

      // Manager trying to access tenant routes
      if (userRole === "manager" && pathname.startsWith("/tenant")) {
        router.push("/managers/properties", { scroll: false });
        return;
      }

      // Tenant trying to access manager routes
      if (userRole === "tenant" && pathname.startsWith("/managers")) {
        router.push("/tenants/favorites", { scroll: false });
        return;
      }

      // Manager trying to access search page
      if (pathname.startsWith("/search") && userRole === "manager") {
        router.push("/managers/properties", { scroll: false });
      }
    }
  }, [authUser, isLoading, pathname, router]);

  if (isLoading) {
    return <Loading />;
  }

  // Prevent rendering children if unauthorized access is attempted
  if (authUser) {
    const userRole = authUser.userRole?.toLowerCase();
    if (
      (userRole === "manager" &&
        (pathname.startsWith("/tenant") || pathname.startsWith("/search"))) ||
      (userRole === "tenant" && pathname.startsWith("/managers"))
    ) {
      return <Loading />;
    }
  }

  return <>{children}</>;
};

export default RouteGaurd;
