import { useState } from "react";
import Auth from "./components/Auth";
import DashBoard from "./components/Dashboard";
import Profile from "./components/Profile";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("id_token"),
  );
  const [currentView, setCurrentView] = useState("discover");
  const [loginError, setLoginError] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("id_token");
    setIsLoggedIn(false);
    setLoginError(null);
  };

  const handleSessionInvalid = () => {
    localStorage.removeItem("id_token");
    setIsLoggedIn(false);
    setLoginError("Session expired or invalid. Please log in again.");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center jusitfy-center p-6">
        <header className="mb-8 text-center">
          <h1 className="text-6xl font-black tracking-tighter italic uppercase text-slate-900 leading-none">
            run
          </h1>
          <span className="text-orange-600">WRLD</span>
        </header>
        <Auth
          onLoginSuccess={() => {
            setLoginError(null);
            setIsLoggedIn(true);
          }}
          loginError={loginError}
          onClearLoginError={() => setLoginError(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-[1000] shadow-sm">
        <div className="max-w-7xl mx-auto flex justfiy-between items-center">
          <h1
            className="text-2xl font-black tracking-tighter italic uppercase cursor-pointer"
            onClick={() => setCurrentView("discovery")}
          >
            run<span className="text-orange-600">WRLD</span>
          </h1>

          <nav className="flex items-center justify-end gap-6 ml-auto">
            <button
              onClick={() => setCurrentView("discovery")}
              className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${currentView === "discovery" ? "text-orange-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              Discovery
            </button>
            <button
              onClick={() => setCurrentView("profile")}
              className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${currentView === "profile" ? "text-orange-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-8">
        {currentView === "discover" ? (
          <DashBoard />
        ) : (
          <Profile onSessionInvalid={handleSessionInvalid} />
        )}
      </main>
    </div>
  );
}
