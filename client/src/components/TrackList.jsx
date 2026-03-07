export default function TrackList({ tracks, onSaveTrack, onViewOnMap }) {
  if (!tracks || tracks.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
        <p className="text-sm text-gray-400 italic">
          Search a location to see suggested tracks!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-full overflow-hidden flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-slate-900 flex items-center gap-2">
        <span className="w-2 h-6 bg-orange-600 rounded-full"></span>
        Suggested Tracks
      </h2>

      <div className="overflow-y-auto flex-grow pr-2 custom-scrollbar">
        <ul className="divide-y divide-gray-100">
          {tracks.map((track) => (
            <li
              key={track.id}
              className="py-4 group transition-all hover:bg-slate-50 rounded-lg px-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                    {track.name}
                  </h3>
                  <p className="text-xs text-gray-500 leading-tight mt-1">
                    {track.address}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight mt-1">
                    {track.isPublic ? "Public" : "Private"}
                  </p>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onViewOnMap(track)}
                    className="text-[10px] bg-slate-200 text-slate-700 px-3 py-1 rounded-full font-bold hover:bg-slate-300 transition-colors"
                  >
                    View on Map
                  </button>

                  <button
                    onClick={() => onSaveTrack(track)}
                    className="text-[10px] bg-orange-600 text-white px-3 py-1 rounded-full font-bold hover:bg-orange-700 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
