"use client";
import { useGetPropertiesQuery } from "@/state/api/propertyEndpoints";
import { useAppSelector } from "@/state/redux";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { Property } from "@/types/prismaTypes";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const Map = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const filters = useAppSelector((state) => state.global.filters);
  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/duttabhay/cmay2omma009a01qxcu81dcpg",
      center: filters.coordinates || [-74.5, 40],
      zoom: 9,
    });

    map.addControl(
      new mapboxgl.NavigationControl({
        showCompass: false,
        showZoom: true,
        visualizePitch: false,
      }),
      "top-right"
    );

    mapRef.current = map;

    const resizeMap = () => {
      if (map) setTimeout(() => map.resize(), 700);
    };
    resizeMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Empty dependency array - initialize only once

  // Update map center when coordinates change
  useEffect(() => {
    if (mapRef.current && filters.coordinates) {
      mapRef.current.setCenter(filters.coordinates);
    }
  }, [filters.coordinates]);

  // Update markers when properties change
  useEffect(() => {
    if (isLoading || isError || !properties || !mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    properties.forEach((property) => {
      const marker = createPropertyMarker(property, mapRef.current!);
      const markerElement = marker.getElement();
      const path = markerElement.querySelector("path[fill='#3FB1CE']");
      if (path) path.setAttribute("fill", "#000000");

      markersRef.current.push(marker);
    });
  }, [isLoading, isError, properties]);

  if (isLoading) return <>Loading...</>;
  if (isError || !properties) return <div>Failed to fetch properties</div>;

  return (
    <div className="basis-5/12 grow relative rounded-xl">
      <div
        className="map-container rounded-xl"
        ref={mapContainerRef}
        style={{
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
};

const createPropertyMarker = (property: Property, map: mapboxgl.Map) => {
  const marker = new mapboxgl.Marker()
    .setLngLat([
      property.location.coordinates.longitude,
      property.location.coordinates.latitude,
    ])
    .setPopup(
      new mapboxgl.Popup().setHTML(
        `
        <div class="marker-popup">
          <div class="marker-popup-image"></div>
          <div>
            <a href="/search/${
              property.id
            }" target="_blank" class="marker-popup-title">${property.name}</a>
            <p class="marker-popup-price">
              $${property.pricePerNight.toFixed(2)}
              <span class="marker-popup-price-unit"> / night</span>
            </p>
          </div>
        </div>
        `
      )
    )
    .addTo(map);

  return marker;
};

export default Map;
