import Navbar from "@/components/Navbar";
import CallToActionSection from "@/components/landing/CallToActionSection";
import DiscoverSection from "@/components/landing/DiscoverSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import FooterSection from "@/components/landing/FooterSection";
import HeroSection from "@/components/landing/HeroSection";

export default function Home() {
  return (
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
  );
}
