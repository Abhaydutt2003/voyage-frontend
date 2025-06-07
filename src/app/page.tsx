"use client";
import Loading from "@/components/Loading";
import Navbar from "@/components/Navbar";
import RouteGaurd from "@/components/RouteGaurd";
import CallToActionSection from "@/components/landing/CallToActionSection";
import DiscoverSection from "@/components/landing/DiscoverSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import FooterSection from "@/components/landing/FooterSection";
import HeroSection from "@/components/landing/HeroSection";
import { useGetAuthUserQuery } from "@/state/api/authEndpoints";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();

  useEffect(() => {
    if (!authLoading && authUser) {
      const userRole = authUser.userRole?.toLowerCase();
      //if the user is already authenticated, make sure that the user does not see the landing page.
      if (userRole == "manager") {
        router.push("/managers/properties");
      } else {
        router.push("/tenants/favorites");
      }
    }
  }, [authUser, authLoading, router]);

  if (authLoading) {
    return <Loading></Loading>;
  }

  return (
    <RouteGaurd>
      <div className="h-full w-full">
        <Navbar />
        <main className={`h-full flex w-full flex-col`}>
          <HeroSection />
          <FeaturesSection />
          <DiscoverSection />
          <CallToActionSection />
          <FooterSection />
        </main>
      </div>
    </RouteGaurd>
  );
}
