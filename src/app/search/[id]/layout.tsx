import { Property, Location } from "@/types/prismaTypes";
import { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const headersList = await headers();

  // Set cache control headers for better bot caching
  headersList.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
  headersList.set("CDN-Cache-Control", "public, max-age=86400");
  headersList.set("Vercel-CDN-Cache-Control", "public, max-age=86400");

  return [];
}

type PropertyLight = Pick<
  Property,
  "name" | "description" | "pricePerNight" | "photoUrlsBaseKeys"
> & {
  location: Pick<Location, "state" | "city" | "country">;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const previousImages = (await parent).openGraph?.images || [];

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/properties/${id}/light`,
    { next: { revalidate: 3600, tags: [`property-${id}`] } }
  );

  if (!response.ok) {
    // Return fallback metadata if fetch fails
    return {
      title: "Property Listing",
      description: "Property for rent/sale",
      openGraph: {
        title: "Property Listing",
        description: `Voyage | Find your perfect property`,
        images: previousImages,
        type: "website",
      },
    };
  }

  const propertyLight: PropertyLight = await response.json();

  const propertyImages =
    propertyLight.photoUrlsBaseKeys?.length > 0
      ? propertyLight.photoUrlsBaseKeys
      : previousImages;

  const locationParts = [
    propertyLight.location?.city,
    propertyLight.location?.state,
    propertyLight.location?.country,
  ].filter(Boolean);
  const locationString =
    locationParts.length > 0 ? ` in ${locationParts.join(", ")}` : "";

  const priceString = propertyLight.pricePerNight
    ? `$${propertyLight.pricePerNight}/night`
    : "";

  const propertyMeta: Metadata = {
    title:
      `${propertyLight.name} - ${propertyLight.location.country} - ${propertyLight.location.state} - ${propertyLight.location.city} - $${propertyLight.pricePerNight}` ||
      "Property Listing",
    description:
      propertyLight.description ||
      `Find your perfect property${locationString}${
        priceString ? ` - ${priceString}` : ""
      }`,
    openGraph: {
      title: propertyLight.name || "Property Listing",
      description:
        propertyLight.description ||
        `Voyage | Find your perfect property${locationString}${
          priceString ? ` - ${priceString}` : ""
        }`,
      images: propertyImages,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: propertyLight.name || "Property Listing",
      description:
        propertyLight.description ||
        `Find your perfect property${locationString}${
          priceString ? ` - ${priceString}` : ""
        }`,
      images: propertyImages,
    },
  };

  return propertyMeta;
}

const SinglePropertyLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default SinglePropertyLayout;
