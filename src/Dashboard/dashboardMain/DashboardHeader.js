// DashboardHeader.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Menu, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import SettingsPanel from "./SettingsPanel";

const navLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Profile", href: "/userprofile" },
  { name: "Settings", href: "/dashboard/settings" },
];

function getInitials(fullName = "") {
  const words = fullName.trim().split(/\s+/);
  if (!fullName || words.length === 0) return "UN";
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + (words[1][0] || "")).toUpperCase();
}

export default function DashboardHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState({ transportName: "", photo_url: null });
  const [imgError, setImgError] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // fetch session/profile info
    axios
      .get("http://localhost/my_app/Backend/api/check_session.php", {
        withCredentials: true,
      })
      .then((res) => {
        const d = res.data || {};
        if (d.loggedIn) {
          setUser({
            transportName: d.transportName || "",
            photo_url: d.photo_url || null,
          });
          setImgError(false); // reset any previous image error
        }
      })
      .catch((err) => {
        // optional: console.log(err);
      });
  }, []);

  // When user changes (photo_url update), reset imgError to reattempt
  useEffect(() => {
    setImgError(false);
  }, [user.photo_url]);

  const handleImgError = () => {
    setImgError(true);
  };

  const Avatar = () => {
    const initials = getInitials(user.transportName || "");
    // if photo exists and no error, show image
    if (user.photo_url && !imgError) {
      return (
        <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
          <img
            src={user.photo_url}
            alt={user.transportName || "User"}
            onError={handleImgError}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    // fallback: initials circle
    return (
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#3b86d1] text-white text-lg font-bold border-4 border-white shadow-lg">
        {initials || "UN"}
      </div>
    );
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-[90px] bg-white shadow-md border-b border-gray-200 z-30">
        <div className="container px-6 flex items-center justify-between h-full relative">
          {/* Left Logo / Title */}
          <h1 className="font-bold text-2xl px-5 py-2 select-none text-[#3b86d1]">
            My Dashboard
          </h1>

          {/* Center Navigation (Desktop Only) */}
          <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="relative font-medium text-[#3b86d1] transition-colors duration-300 hover:text-[#21bf06] group"
                onClick={(e) => {
                  if (link.href === "/dashboard/settings") {
                    e.preventDefault();
                    setShowSettings(true);
                  }
                }}
              >
                {link.name}
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#21bf06] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right: Mobile Menu + Profile */}
          <div className="flex items-center space-x-6">
            {/* Mobile Toggle */}
            <button
              className="md:hidden mr-2"
              onClick={() => setIsOpen(!isOpen)}
              style={{ color: "#e6687a" }}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Profile (clickable) */}
            <button
              onClick={() => navigate("/userprofile")}
              className="focus:outline-none rounded-full ring-2 ring-transparent focus:ring-[#3b86d1] hover:scale-105 shadow-sm transition"
              title="Account"
            >
              <Avatar />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t bg-white/95 backdrop-blur">
            <nav className="flex flex-col space-y-4 p-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={(e) => {
                    if (link.href === "/dashboard/settings") {
                      e.preventDefault();
                      setShowSettings(true);
                    }
                    setIsOpen(false);
                  }}
                  className="font-medium text-[#3b86d1] hover:text-[#21bf06] text-left py-2 px-2 rounded-xl transition"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Settings Panel (pass user so panel can show photo/name) */}
      <SettingsPanel
        show={showSettings}
        onClose={() => setShowSettings(false)}
        navigate={navigate}
        user={{ transportName: user.transportName, photo_url: user.photo_url }}
      />

      {/* Background Blur */}
      {showSettings && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-30 backdrop-blur"
          onClick={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
