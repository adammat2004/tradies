"use client";

import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

interface MapWithAddressProps {
  address: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

const MapWithAddress: React.FC<MapWithAddressProps> = ({ address }) => {
  //const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [coordinates, setCoordinates] = useState({ lat: 39.8283, lng: -98.5795 });
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    if (address && isLoaded) {
      geocodeAddress(address);
    }
  }, [address, isLoaded]);

  const geocodeAddress = (address: string) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        setCoordinates({ lat: location.lat(), lng: location.lng() });
      } else {
        console.error("Geocoding failed: ", status);
      }
    });
  };

  if (!isLoaded) return <div>Loading map...</div>;
  if (!coordinates) return <div>Finding address...</div>;

  return (
    <GoogleMap
      center={coordinates}
      zoom={15}
      mapContainerStyle={{ width: "100%", height: "500px" }}
    >
      <Marker position={coordinates} />
    </GoogleMap>
  );
};

export default MapWithAddress;
