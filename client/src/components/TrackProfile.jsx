export default function TrackProfile({ track, onBack }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-left duration-300">
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

      <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase italic leading-tight">
            {track.name}
          </h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {track.address}
          </p>
        </div>

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
      </div>
    </div>
  );
}
