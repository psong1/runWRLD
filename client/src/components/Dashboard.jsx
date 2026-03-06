import { useState } from "react";
import Map from "./Map";
import TrackSearch from "./TrackSearch";
import TrackList from "./TrackList";
import TrackProfile from "./TrackProfile";
import { useQuery, useMutation } from "@apollo/client/react";
import { SAVE_TRACK, ADD_TRACK } from "../utils/mutations";
import { GET_ME } from "../utils/queries";

export default function Dashboard() {
  const [mapCenter, setMapCenter] = useState({
    lat: 33.749,
    lng: -84.388,
  });

  const [activeTrack, setActiveTrack] = useState(null);
  const [externalTracks, setExternalTracks] = useState([]);
  const [viewedTrack, setViewedTrack] = useState(null);

  const { data: meData } = useQuery(GET_ME);

  const [saveExistingTrack] = useMutation(SAVE_TRACK, {
    refetchQueries: [{ query: GET_ME }],
  });

  const [addNewTrack] = useMutation(ADD_TRACK, {
    refetchQueries: [{ query: GET_ME }],
  });

  const handleSearchSuccess = (coords, suggestedTracks) => {
    setMapCenter(coords);
    setExternalTracks(suggestedTracks || []);
    setActiveTrack(null);
    setViewedTrack(null);
  };

  const handleViewOnMap = (track) => {
    setMapCenter({ lat: track.lat, lng: track.lng });
    setActiveTrack(track);
    setViewedTrack(track);
  };

  const handleAddTrack = async (track) => {
    try {
      const isValidMongoId = (id) => /^[a-fA-F0-9]{24}$/.test(id);
      const savedTracks = meData?.me?.savedTracks ?? [];

      // DB track: already saved if its id is in savedTracks
      const isDbTrackAlreadySaved =
        track.id &&
        isValidMongoId(track.id) &&
        savedTracks.some((s) => s.id === track.id);

      // Geoapify track: already saved if we have a saved track with same name + location
      const isSuggestedAlreadySaved =
        !isValidMongoId(track?.id) &&
        savedTracks.some(
          (s) =>
            s.name === track.name &&
            s.lat != null &&
            s.lng != null &&
            Math.abs(s.lat - parseFloat(track.lat)) < 1e-5 &&
            Math.abs(s.lng - parseFloat(track.lng)) < 1e-5,
        );

      if (isDbTrackAlreadySaved || isSuggestedAlreadySaved) {
        alert("Track already saved to profile");
        return;
      }

      if (track.id && isValidMongoId(track.id)) {
        await saveExistingTrack({
          variables: { trackId: track.id },
        });
      } else {
        const addressParts = track.address.split(", ");
        const street = addressParts[0];
        const rest = addressParts[1]
          ? addressParts[1].split(" ")
          : ["Unknown", "", "00000"];

        await addNewTrack({
          variables: {
            input: {
              name: track.name,
              streetAddress: street,
              city: rest[0] || "Unknown",
              state: rest[1] || "Unknown",
              zipCode: rest[2] || "00000",
              surfaceType: track.surface || "Synthetic",
              isPublic: track.isPublic ?? true,
              lighting: false,
              lat: parseFloat(track.lat),
              lng: parseFloat(track.lng),
            },
          },
        });
      }

      alert("Track saved to your profile!");
    } catch (err) {
      console.error("Error saving track:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <aside className="lg:col-span-2">
        <div className="sticky top-24">
          <TrackSearch onSearchSuccess={handleSearchSuccess} />
        </div>
      </aside>

      <aside className="lg:col-span-2 lg:row-start-2 space-y-6">
        <div className="sticky top-24 space-y-6">
          <div className="h-[calc(100vh-320px)] min-h-[400px]">
            {viewedTrack ? (
              <TrackProfile
                track={viewedTrack}
                onBack={() => setViewedTrack(null)}
              />
            ) : (
              <TrackList
                tracks={externalTracks}
                onViewOnMap={handleViewOnMap}
                onAddTrack={handleAddTrack}
              />
            )}
          </div>
        </div>
      </aside>

      <section className="lg:col-span-3 lg:row-start-2">
        <div className="bg-white p-2 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden sticky top-24 h-[70vh] min-h-[320px] max-h-[700px]">
          <Map
            centerCoords={mapCenter}
            externalTracks={externalTracks}
            activeTrack={activeTrack}
          />
        </div>
      </section>

      <section className="mt-4 flex items-center justify-between px-2 lg:col-span-5">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-tight">
          Location: {mapCenter.lat.toFixed(4)}N / {mapCenter.lng.toFixed(4)}W
        </div>
        <div className="flex gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            Synchronized
          </span>
        </div>
      </section>
    </div>
  );
}
