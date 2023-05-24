import React from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { WIDTH_RATIO, HEIGHT_RATIO } from "../constants";
import '../styles.css';

const MAP_SIZE = 150 * 1.8;
const MAP_CENTER_LAT = 40;
const MAP_CENTER_LNG = -100;
const MAP_ZOOM = 4;

const GOOGLE_MAPS_API_KEY = "AIzaSyDmmQdWZDkfvNeQ24Mh5dsNVUMPyEX6mBY";
const ICONS_BASE = "http://maps.google.com/mapfiles/ms/icons/";

const icons = {
  marker: ICONS_BASE + "blue-dot.png",
  selectedMarker: ICONS_BASE + "red-dot.png",
}; 

export function GoogleMaps(props) {
  const containerStyle = {
    width: MAP_SIZE * WIDTH_RATIO,
    height: MAP_SIZE * HEIGHT_RATIO,
  };
  const center = {
    lat: MAP_CENTER_LAT,
    lng: MAP_CENTER_LNG,
  };
  const { locsArray, selectedId, setSelectedId } = props;

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const handleMarkerClick = (idx) => {
    setSelectedId(idx);
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={MAP_ZOOM}
    >
      {locsArray.map((loc, idx) => {
        return (
          <Marker
            onClick={() => handleMarkerClick(idx)}
            position={{ lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) }}
            icon={idx === selectedId ? icons.selectedMarker : icons.marker}
          />
        );
      })}
    </GoogleMap>
  ) : (
    <></>
  );
}