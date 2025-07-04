import React, { useCallback, useEffect, useRef, useState } from "react";

import mapboxgl, { Map, Marker, LngLat } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { InfoIcon } from "lucide-react";
import { CustomFormField } from "./FormField";
import Header from "./Header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropertyLocationData, propertyLocationSchema } from "@/lib/schemas";
import { Form } from "@/components/ui/form";
import { Button } from "./ui/button";
import { toast } from "sonner";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const DEFAULT_CENTER = [78.9629, 20.5937];
const DEFAULT_ZOOM = 4;

export interface PropertyCoordinatesData {
  lon: number;
  lat: number;
}

// Helper function to make geocoding request
const getCoordinates = async (data: PropertyLocationData) => {
  const searchStrategies = [
    // Most specific: with street address
    {
      street: data.address,
      city: data.city,
      country: data.country,
      postalcode: data.postalCode,
      format: "json",
      limit: "1",
    },
    // Fallback: without street address(happens when nominatim cannot recognize the street address)
    {
      city: data.city,
      country: data.country,
      postalcode: data.postalCode,
      format: "json",
      limit: "1",
    },
  ];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const makeGeocodingRequest = async (params: Record<string, any>) => {
    const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
      params
    ).toString()}`;
    const response = await fetch(url);
    return await response.json();
  };
  let geoCodingData: {
    lat: string;
    lon: string;
  }[] = [];
  for (const strategy of searchStrategies) {
    const responseData = await makeGeocodingRequest(strategy);
    if (responseData && responseData.length > 0) {
      geoCodingData = responseData;
    }
  }
  return geoCodingData;
};

const LocationPicker = ({
  onLocationPicked,
}: {
  onLocationPicked: (
    propertyLocaitonData: PropertyLocationData,
    coordinatesData: PropertyCoordinatesData
  ) => Promise<void>;
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [currentLocation, setCurrentLocation] =
    useState<PropertyCoordinatesData | null>(null);

  const [propertyLocationData, setPropertyLocationData] =
    useState<PropertyLocationData | null>(null);

  const initializeMap = useCallback(
    (lng: number, lat: number, zoom = DEFAULT_ZOOM) => {
      if (mapRef.current) {
        mapRef.current.flyTo({ center: [lng, lat], zoom: zoom });
      } else {
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: "mapbox://styles/duttabhay/cmay2omma009a01qxcu81dcpg",
          center: [lng, lat],
          zoom,
        });
        mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-left");
      }
    },
    []
  );

  useEffect(() => {
    if (mapContainerRef.current) {
      initializeMap(DEFAULT_CENTER[0], DEFAULT_CENTER[1], DEFAULT_ZOOM);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initializeMap]);

  const form = useForm<PropertyLocationData>({
    resolver: zodResolver(propertyLocationSchema),
    defaultValues: {
      address: "",
      city: "",
      country: "",
      postalCode: "",
      state: "",
    },
  });

  const onAddressSubmit = useCallback(
    async (data: PropertyLocationData) => {
      if (!mapRef.current) {
        //return if the map has not loaded.
        return;
      }
      // Show loading toast and keep its ID
      const toastId = toast.loading("Fetching address...");

      const geoCodingData = await getCoordinates(data);
      // Dismiss the loading toast
      toast.dismiss(toastId);

      if (geoCodingData.length === 0) {
        toast.error("Please enter a valid address to locate");
        return;
      }

      //intialize the location on the map.
      const lonLat = {
        lon: Number(geoCodingData[0].lon),
        lat: Number(geoCodingData[0].lat),
      };
      mapRef.current.flyTo({
        center: [lonLat.lon, lonLat.lat],
        zoom: 14,
      });
      markerRef.current?.remove();
      markerRef.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat([lonLat.lon, lonLat.lat])
        .addTo(mapRef.current);
      markerRef.current.on("dragend", () => {
        const lngLat: LngLat = markerRef.current!.getLngLat();
        setCurrentLocation({ lon: lngLat.lng, lat: lngLat.lat });
      });
      setPropertyLocationData(data);
      setCurrentLocation({
        lon: Number(lonLat.lon),
        lat: Number(lonLat.lat),
      });
    },
    [mapRef, markerRef, setCurrentLocation]
  );

  const onCreateProperty = () => {
    setIsSubmitting(true);
    onLocationPicked(propertyLocationData!, currentLocation!);
    setIsSubmitting(false);
  };

  return (
    <>
      <Header
        title="Select Location"
        subtitle="Fill the Property Address to get the select the location."
      />
      <div className=" rounded-xl p-6 flex items-start bg-white">
        <Form {...form}>
          <form
            className=" p-4 space-y-10 flex-1"
            onSubmit={form.handleSubmit(onAddressSubmit)}
          >
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">Property Address</h2>
              <CustomFormField name="address" label="Street Address" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomFormField name="city" label="City" />
                <CustomFormField name="state" label="State/Province" />
                <CustomFormField name="postalCode" label="Postal Code" />
              </div>
              <CustomFormField name="country" label="Country" />
              <Button
                type="submit"
                className="bg-primary-700 text-white w-full cursor-pointer"
              >
                Search Address
              </Button>
              {currentLocation && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2 border-primary-700 text-primary-700 hover:bg-primary-50 font-semibold shadow cursor-pointer"
                    onClick={onCreateProperty}
                    disabled={isSubmitting}
                  >
                    Create Property
                  </Button>
                  <span className="flex items-center gap-2 text-neutral-500">
                    <InfoIcon className="size-4 " />
                    To ensure accuracy, please pinpoint the exact location on
                    the map
                  </span>
                </>
              )}
            </div>
          </form>
        </Form>
        <div
          className="relative mt-4 h-[700px] rounded-lg flex-1"
          ref={mapContainerRef}
        />
      </div>
    </>
  );
};

export default LocationPicker;
