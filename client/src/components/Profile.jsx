import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_ME } from "../utils/queries";
import { UPDATE_PASSWORD, REMOVE_TRACK } from "../utils/mutations";

export default function Profile({ onSessionInvalid }) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const { loading, error, data } = useQuery(GET_ME);
  const [updatePassword, { error: updatePasswordError }] =
    useMutation(UPDATE_PASSWORD);

  const [removeTrack, { error: removeTrackError }] = useMutation(REMOVE_TRACK, {
    refetchQueries: [{ query: GET_ME }],
  });

  // Session invalid: call in useEffect so we don't update parent during render
  useEffect(() => {
    if (loading) return;
    if (error || !data?.me) onSessionInvalid?.();
  }, [loading, error, data?.me, onSessionInvalid]);

  if (loading)
    return (
      <div className="text-center py-20 animate-pulse text-slate-400 font-bold uppercase tracking-widest">
        Loading Runner Profile...
      </div>
    );
  if (error || !data?.me) return null;

  const { username, email, savedTracks } = data.me;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    try {
      await updatePassword({
        variables: {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setPasswordSuccess(true);
    } catch (err) {
      setPasswordError(err?.message || "Failed to update password");
    }
  };

  const handleRemoveTrack = async (trackId) => {
    try {
      await removeTrack({ variables: { trackId } });
    } catch (err) {
      console.error("Failed to remove track:", err);
    }
  };

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
          Change Password
        </h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
          <input
            type="password"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-600 outline-none"
            placeholder="Current password"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                currentPassword: e.target.value,
              })
            }
          />
          <input
            type="password"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-600 outline-none"
            placeholder="New password"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, newPassword: e.target.value })
            }
          />
          <input
            type="password"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-600 outline-none"
            placeholder="Confirm new password"
            value={passwordForm.confirmNewPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                confirmNewPassword: e.target.value,
              })
            }
          />
          {passwordError && (
            <p className="text-red-600 text-sm font-medium">{passwordError}</p>
          )}
          {updatePasswordError && (
            <p className="text-red-600 text-sm font-medium">
              {updatePasswordError.message}
            </p>
          )}
          {passwordSuccess && (
            <p className="text-green-600 text-sm font-medium">
              Password updated.
            </p>
          )}
          <button
            type="submit"
            className="bg-slate-900 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Update Password
          </button>
        </form>
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

                <p className="text-xs text-slate-500 mt-1">
                  {[track.streetAddress, track.city, track.state]
                    .filter(Boolean)
                    .join(", ")}
                </p>

                {/* Public / Private label */}
                <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">
                  {track.isPublic ? "Public" : "Private"}
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    onClick={() => handleRemoveTrack(track.id)}
                  >
                    Remove Track
                  </button>

                  <button
                    className="text-[10px] font-black uppercase text-slate-400 hover:text-orange-600 transition-colors cursor-pointer"
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
