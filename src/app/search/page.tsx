import { Metadata, ResolvingMetadata } from "next";
import SearchPage from "./_SearchPage";
import { Suspense } from "react";
import Loading from "@/components/Loading";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const sParams = await searchParams;
  const location = sParams.location as string;

  let title = "Property Search";
  let description = "Find your next property.";

  if (location) {
    const formattedLocation = location
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    title = `Voyage | ${formattedLocation} - Places to Stay`;
    description = `Explore properties available in ${formattedLocation}. Find houses, apartments, and more.`;
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: "website",
      images: previousImages,
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
    },
  };
}

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <SearchPage />
    </Suspense>
  );
};

export default page;
