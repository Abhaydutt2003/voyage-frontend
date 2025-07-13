import { getPropertyLight } from "@/state/api/getPropertyLight";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const previousImages = (await parent).openGraph?.images || [];

  const propertyLight = await getPropertyLight(id);

  if (!propertyLight) {
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
