import { useState } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { GET_NEARBY_TRACKS } from "../utils/queries.js";
import { getCoordinates, findNearbyStadiums } from "../utils/geoUtils.js";

export default function TrackSearch({ onSearchSuccess }) {
  const [address, setAddress] = useState("");

  const [getTracks, { loading, data }] = useLazyQuery(GET_NEARBY_TRACKS);

  const handleSearch = async (e) => {
    e.preventDefault();
    const coordinates = await getCoordinates(address);

    if (coordinates) {
      onSearchSuccess?.(coordinates);
      getTracks({
        variables: {
          lat: coordinates.lat,
          lng: coordinates.lng,
          radius: 10,
        },
      });

      const nearbyStadiums = await findNearbyStadiums(
        coordinates.lat,
        coordinates.lng,
      );

      onSearchSuccess(coordinates, nearbyStadiums);
    }
  };

  return (
    <div className="p-6 max-w-md">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="track-search" className="sr-only">
            City or Zip Code
          </label>
          <input
            id="track-search"
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter city or zip"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-600 active:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? "Searching..." : "Search Tracks"}
          </button>
        </div>
      </form>

      {loading && (
        <p className="mt-3 text-gray-500 text-sm">Loading tracks...</p>
      )}

      <div className="mt-4">
        {(data?.tracksNearby ?? []).map((track) => (
          <div key={track.id} className="border-b border-gray-200 py-2">
            <h3 className="font-bold">{track.name}</h3>
            <p className="text-sm text-gray-600">
              {[track.streetAddress, track.city].filter(Boolean).join(", ") ||
                "-"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
