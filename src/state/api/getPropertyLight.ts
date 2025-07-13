import { Property, Location } from "@/types/prismaTypes";

export type PropertyLight = Pick<
  Property,
  "name" | "description" | "pricePerNight" | "photoUrlsBaseKeys"
> & {
  location: Pick<Location, "state" | "city" | "country">;
};

export async function getPropertyLight(
  id: string
): Promise<PropertyLight | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/properties/${id}/light`,
    {
      cache: "force-cache", // property data will never be changes, hence can cache the data forever.
    }
  );

  if (!res.ok) return null;

  return res.json();
}
