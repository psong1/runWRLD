import { useState } from "react";
import Map from "./Map";
import TrackSearch from "./TrackSearch";
import TrackList from "./TrackList";
import TrackProfile from "./TrackProfile";

export default function Dashboard() {
  const [mapCenter, setMapCenter] = useState({
    lat: 33.749,
    lng: -84.388,
  });

  const [activeTrack, setActiveTrack] = useState(null);
  const [externalTracks, setExternalTracks] = useState([]);
  const [viewedTrack, setViewedTrack] = useState(null);

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

  const handleAddTrack = (track) => {
    console.log("Preparing to save to MongoDB:", track);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <aside className="lg:col-span-1 space-y-6">
        <div className="sticky top-24 space-y-6">
          <TrackSearch onSearchSuccess={handleSearchSuccess} />

          <div className="h-[calc(100vh-320px)] min-h-[450px]">
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

      <section className="lg:col-span-3">
        <div className="bg-white p-2 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden sticky top-24 h-[calc(100vh-160px)]">
          <Map
            centerCoords={mapCenter}
            externalTracks={externalTracks}
            activeTrack={activeTrack}
          />
        </div>
      </section>

      <section className="mt-4 flex items-center justify-between px-2">
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
