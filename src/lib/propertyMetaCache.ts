"use server"; //to make sure that all the functions here are executed on the server.
import { Location, Property } from "@/types/prismaTypes";

type PropertyLight = Pick<
  Property,
  "name" | "description" | "pricePerNight" | "photoUrlsBaseKeys"
> & {
  location: Pick<Location, "state" | "city" | "country">;
};

type PropertyMeta = PropertyLight & {
  seoTitle: string;
  metaDescription: string;
};

type CacheValue = { data: PropertyMeta; timestamp: number };

class PropertyMetaCache {
  private cache: Map<string, CacheValue>;
  private cacheTTL: number;
  private maxCacheSize: number;

  constructor() {
    this.cache = new Map();
    this.cacheTTL = 15 * 60 * 1000; // 15 minutes in milliseconds
    this.maxCacheSize = 1000;
  }

  #getCacheKey(propertyId: string) {
    return `property_meta_${propertyId}`;
  }

  #isExpired(entry: CacheValue) {
    return Date.now() - entry.timestamp > this.cacheTTL;
  }

  get(propertyId: string) {
    const key = this.#getCacheKey(propertyId);
    const entry = this.cache.get(key);

    if (!entry || this.#isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(propertyId: string, data: PropertyMeta) {
    const key = this.#getCacheKey(propertyId);

    // Implement LRU by removing oldest entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}

const propertyMetaCache = new PropertyMetaCache();

export async function getPropertyMeta(propertyId: string) {
  const cached = propertyMetaCache.get(propertyId);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/properties/${propertyId}/light`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch property data`);
    }

    const propertyLight: PropertyLight = await response.json();
    const formattedMeta: PropertyMeta = {
      name: propertyLight.name || "Property Listing",
      description: propertyLight.description || "Property for rent",
      photoUrlsBaseKeys: propertyLight.photoUrlsBaseKeys || ["./splash.jpg"],
      pricePerNight: propertyLight.pricePerNight,
      location: propertyLight.location,
      seoTitle: `${propertyLight.name} - ${propertyLight.location.country} - ${propertyLight.location.state} - ${propertyLight.location.city} - $${propertyLight.pricePerNight}`,
      metaDescription:
        propertyLight.description?.substring(0, 160) + "..." ||
        `${propertyLight.name} in ${propertyLight.location} for $${propertyLight.pricePerNight}`,
    };
    propertyMetaCache.set(propertyId, formattedMeta);
    return formattedMeta;
  } catch (error) {
    console.error(error);
    //fallback meta
    const fallbackMeta: PropertyMeta = {
      name: "Property Listing",
      description: "Property for rent/sale",
      seoTitle: "Property Listing",
      photoUrlsBaseKeys: ["/default-property.jpg"],
      metaDescription: "Find your perfect property",
      location: {
        state: "",
        city: "",
        country: "",
      },
      pricePerNight: 0,
    };
    return fallbackMeta;
  }
}
