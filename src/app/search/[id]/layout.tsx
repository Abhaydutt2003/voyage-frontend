import { Property, Location } from "@/types/prismaTypes";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

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

  //to add cache control headers, need to wrap this in the api routes.
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
