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
    <div className="p-4">
      <form onSubmit={handleSearch}>
        <input
          className="border p-2 rounded"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter city or zip"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Search Tracks
        </button>
      </form>

      {loading && <p>Loading...</p>}

      <div className="mt-4">
        {(data?.tracksNearby ?? []).map((track) => (
          <div key={track.id} className="border-b py-2">
            <h3 className="font-bold">{track.name}</h3>
            <p className="text-sm text-gray-600">
              {[track.streetAddress, track.city].filter(Boolean).join(", ") ||
                "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
