interface MapboxFeature {
  center: [number, number]; // [longitude, latitude]
}

interface MapboxGeocodingResponse {
  features: MapboxFeature[];
}

export const searchLocationsOnMapbox = async (query: string) => {
  if (!query) {
    return null;
  }
  //TODO take care of security here
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    }&fuzzyMatch=true`
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Failed to fetch location data from Mapbox."
    );
  }
  const data: MapboxGeocodingResponse = await response.json();
  if (data.features && data.features.length > 0) {
    return data.features[0];
  } else {
    return null;
  }
};
