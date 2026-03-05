import { useQuery } from "@apollo/client/react";
import { GET_ME } from "../utils/queries";

export default function Profile() {
  const { loading, error, data } = useQuery(GET_ME);

  if (loading)
    return (
      <div className="text-center py-20 animate-pulse text-slate-400 font-bold uppercase tracking-widest">
        Loading Runner Profile...
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">
        Error loading profile.
      </div>
    );

  const { username, email, savedTracks } = data.me;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center text-white text-4xl font-black italic shadow-inner">
          {username[0].toUpperCase()}
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">
            {username}
          </h2>
          <p className="text-slate-500 font-medium">{email}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
        <h3 className="text-xl font-bold mb-6 text-slate-900 flex items-center gap-2">
          <span className="w-2 h-6 bg-orange-600 rounded-full"></span>
          Saved Tracks
        </h3>

        {savedTracks?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedTracks.map((track) => (
              <div
                key={track.id}
                className="p-4 border border-slate-100 rounded-2xl hover:border-orange-200 transition-colors group"
              >
                <h4 className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                  {track.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1">{track.address}</p>
                <button className="mt-4 text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors">
                  Remove Track
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-400 italic">
              No tracks saved.yet. Go to discovery to find your next favorite
              track!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
