import { useQuery } from "@apollo/client/react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import { GET_NEARBY_TRACKS } from "../utils/queries.js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapController({ centerCoords, activeTrack }) {
  const map = useMap();

  useEffect(() => {
    // If we have a specific active track, prioritize flying to that
    if (activeTrack) {
      map.flyTo([activeTrack.lat, activeTrack.lng], 16, {
        animate: true,
        duration: 1.5,
      });
    }
    // Otherwise, fly to the general search center
    else if (centerCoords) {
      map.flyTo([centerCoords.lat, centerCoords.lng], 13, {
        animate: true,
        duration: 1.0,
      });
    }
  }, [centerCoords, activeTrack, map]); // Triggers when either search or specific track selection changes

  return null;
}

export default function Map({
  centerCoords,
  externalTracks = [],
  activeTrack,
}) {
  const { loading, error, data } = useQuery(GET_NEARBY_TRACKS, {
    variables: {
      lat: centerCoords.lat,
      lng: centerCoords.lng,
      radius: 10,
    },
    skip: !centerCoords.lat,
  });

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Syncing Database...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[centerCoords.lat, centerCoords.lng]}
        zoom={13}
        className="h-full w-full"
        zoomControl={true} // Re-enabling temporarily to verify map is interactive
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Updated Controller passes both state pieces */}
        <MapController centerCoords={centerCoords} activeTrack={activeTrack} />

        {/* 1. Verified Tracks */}
        {(data?.tracksNearby ?? []).map((track) => (
          <Marker
            key={`db-${track.id}`}
            position={[
              track.location.coordinates[1],
              track.location.coordinates[0],
            ]}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold">{track.name}</h3>
                <p className="text-xs text-orange-600 font-bold">Verified</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 2. Suggested Tracks */}
        {externalTracks.map((track) => (
          <Marker key={`ext-${track.id}`} position={[track.lat, track.lng]}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold">{track.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase">
                  Suggested
                </p>
                <p className="text-xs mt-1 text-slate-500">{track.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 3. The Active Marker - Using a different icon or simple logic */}
        {activeTrack && (
          <Marker position={[activeTrack.lat, activeTrack.lng]}>
            <Popup autoOpen>
              <div className="p-1">
                <h3 className="font-bold text-orange-600">
                  {activeTrack.name}
                </h3>
                <p className="text-xs text-slate-500">{activeTrack.address}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
