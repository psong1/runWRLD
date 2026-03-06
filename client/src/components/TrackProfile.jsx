import React from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { SAVE_TRACK, ADD_TRACK } from "../utils/mutations";
import { GET_ME } from "../utils/queries";

export default function TrackProfile({ track, onBack }) {
  const { data: meData } = useQuery(GET_ME);
  const [saveExistingTrack] = useMutation(SAVE_TRACK);
  const [addNewTrack] = useMutation(ADD_TRACK);

  const handleSave = async () => {
    try {
      // Only use saveTrack for DB tracks with valid MongoDB ObjectId (24 hex chars).
      // Geoapify/Place IDs are long hex strings and must go through addNewTrack.
      const isValidMongoId = (id) => /^[a-fA-F0-9]{24}$/.test(id);

      const isAlreadySaved =
        track.id &&
        isValidMongoId(track.id) &&
        meData?.me?.savedTracks?.some((saved) => saved.id === track.id);

      if (isAlreadySaved) {
        alert("Track is already saved to your profile!");
        return;
      }

      if (track.id && isValidMongoId(track.id)) {
        await saveExistingTrack({
          variables: { trackId: track.id },
        });
      } else {
        // Otherwise, it's a Suggested Track from Geoapify
        // Use ADD_TRACK which has your "Find or Create" logic on the backend
        const addressParts = track.address.split(", ");
        const street = addressParts[0] || "Unknown";
        const rest = addressParts[1]
          ? addressParts[1].split(" ")
          : ["Unknown", "Unknown", "00000"];

        await addNewTrack({
          variables: {
            input: {
              name: track.name,
              streetAddress: street,
              city: rest[0] || "Unknown",
              state: rest[1] || "GA",
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
      console.error("Error saving track: ", err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-left duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 flex items-center gap-2 transition-colors"
        >
          <span>←</span> Back to List
        </button>
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          Track Info
        </span>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase italic leading-tight">
            {track.name}
          </h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {track.address}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase">
              Surface
            </p>
            <p className="text-xs font-bold text-slate-700">
              {track.surface || "Unknown"}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase">
              Access
            </p>
            <p className="text-xs font-bold text-slate-700">
              {track.isPublic ? "Public" : "Private"}
            </p>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-orange-600 text-white text-[12px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
          >
            Save to Profile
          </button>

          <button
            className="w-full py-3 bg-slate-100 text-slate-600 text-[12px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
            onClick={() =>
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${track.lat},${track.lng}`,
                "_blank",
              )
            }
          >
            Get Directions
          </button>
        </div>
      </div>
    </div>
  );
}
