// VehicleListPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, XCircle, Menu, Search } from "lucide-react";
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/api/vehicles.php`;

export default function VehicleListPage({ showConfirmDialog, showAlert }) {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState("large");
  const viewRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      const resp = await axios.get(`${API_URL}?user_id=${user_id}`);
      setVehicles(Array.isArray(resp.data) ? resp.data : []);
    } catch (err) {
      console.error("Failed to fetch vehicles", err);
      setVehicles([]);
      showAlert?.("error", "Vehicle list fetch failed");
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (viewRef.current && !viewRef.current.contains(e.target)) {
        setViewOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleDelete = (vehicle_id) => {
    const doDelete = async () => {
      try {
        await axios.delete(`${API_URL}?vehicle_id=${vehicle_id}`);
        setVehicles((prev) => prev.filter((v) => v.vehicle_id !== vehicle_id));
        showAlert?.("success", "Vehicle deleted");
      } catch (err) {
        console.error("Delete failed", err);
        showAlert?.("error", "Failed to delete vehicle");
      }
    };

    if (showConfirmDialog) {
      showConfirmDialog("Kya aap sure hain vehicle delete karne ke liye?", doDelete);
    } else {
      if (window.confirm("Kya aap sure hain vehicle delete karne ke liye?")) doDelete();
    }
  };

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    return (
      (v.vehicle_no || "").toString().toLowerCase().includes(q) ||
      (v.model || "").toString().toLowerCase().includes(q) ||
      (v.driver_name || "").toString().toLowerCase().includes(q)
    );
  });

  // Responsive grid classes
  const gridClassByMode = {
    extra: "grid-cols-1",
    large: "grid-cols-1 sm:grid-cols-2",
    medium: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    small: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    list: "grid-cols-1",
  };

  const cardClassByMode = {
    extra: "p-6 sm:p-8 text-base sm:text-lg",
    large: "p-4 sm:p-6",
    medium: "p-3 sm:p-4",
    small: "p-2 sm:p-3 text-xs sm:text-sm",
    list: "p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between",
  };

  const isList = viewMode === "list";

  return (
    <div className="min-h-screen bg-[#f0f4f8] py-4 sm:py-8">
      {/* Top Bar - Responsive */}
      <div className="w-[95%] sm:w-[96%] mx-auto rounded-xl bg-white shadow-md flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5 px-4 sm:px-8 py-5 mb-6 sm:mb-8">
        {/* Left Section */}
        <div className="flex items-center gap-4 w-full sm:w-auto order-1">
          <button
            onClick={() => navigate(`/dashboard`)}
            className="flex items-center p-2.5 sm:p-3 rounded-full bg-white shadow-md hover:bg-[#e3eeff] transition-all hover:scale-105 min-w-[44px] h-[44px]"
            aria-label="Back"
          >
            <ArrowLeft size={20} className="sm:w-6 sm:h-6 text-[#2763ad]" />
          </button>

          <div className="flex items-center gap-3">
            <svg 
              width="28" 
              height="28" 
              className="sm:w-9 sm:h-9 text-[#3b86d1] flex-shrink-0"
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              fill="none" 
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M8 7h8M8 11h6M8 15h4" />
            </svg>
            <h2 className="text-[#3b86d1] flex items-center gap-2 sm:gap-4 font-bold text-xl sm:text-2xl truncate">
              Vehicles <span className="font-medium text-[#2763ad] text-sm sm:text-lg">({filtered.length})</span>
            </h2>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto order-3">
          {/* Mobile menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2.5 rounded-lg hover:bg-[#eef6ff] transition-all"
          >
            <Menu size={20} className="text-[#2763ad]" />
          </button>

          {/* Search - Full width on mobile */}
          <div className="relative flex-1 sm:w-72 order-2 sm:order-none">
            <input
              type="text"
              placeholder="Search vehicle no / model / driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-10 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#3b86d1] hover:border-[#2763ad] transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* View dropdown - Desktop */}
          <div className="hidden md:block relative ml-2 sm:ml-4" ref={viewRef}>
            <button
              onClick={() => setViewOpen((s) => !s)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#eef6ff] text-[#2763ad] hover:bg-[#e3f0ff] transition-all"
              title="Change view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2763ad" strokeWidth="1.6">
                <rect x="3" y="4" width="18" height="6" rx="1" />
                <rect x="3" y="14" width="18" height="6" rx="1" />
              </svg>
              <span className="hidden lg:inline text-sm font-medium">View</span>
            </button>

            {viewOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 overflow-hidden border border-gray-200">
                <button
                  onClick={() => { setViewMode("extra"); setViewOpen(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-[#f5f9ff] ${viewMode === "extra" ? "bg-[#eef6ff]" : ""}`}
                >
                  Extra large icons
                </button>
                <button
                  onClick={() => { setViewMode("large"); setViewOpen(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-[#f5f9ff] ${viewMode === "large" ? "bg-[#eef6ff]" : ""}`}
                >
                  Large icons
                </button>
                <button
                  onClick={() => { setViewMode("medium"); setViewOpen(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-[#f5f9ff] ${viewMode === "medium" ? "bg-[#eef6ff]" : ""}`}
                >
                  Medium icons
                </button>
                <button
                  onClick={() => { setViewMode("small"); setViewOpen(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-[#f5f9ff] ${viewMode === "small" ? "bg-[#eef6ff]" : ""}`}
                >
                  Small icons
                </button>
                <button
                  onClick={() => { setViewMode("list"); setViewOpen(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-[#f5f9ff] ${viewMode === "list" ? "bg-[#eef6ff]" : ""}`}
                >
                  List
                </button>
              </div>
            )}
          </div>

          {/* Create Button */}
          <button
            onClick={() => navigate("/vehiclecreateform")}
            className="bg-[#3b86d1] hover:bg-[#2763ad] text-white font-bold rounded-lg px-5 py-2.5 sm:py-2 shadow-md hover:shadow-lg transition-all hover:scale-105 whitespace-nowrap flex-shrink-0 text-sm sm:text-base"
          >
            + CREATE VEHICLE
          </button>
        </div>
      </div>

      {/* Mobile View Menu */}
      {mobileMenuOpen && (
        <>
          <div className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileMenuOpen(false)} />
          <div className="sm:hidden fixed top-0 right-0 w-72 h-full bg-white shadow-2xl z-50">
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-xl font-bold text-[#3b86d1]">View Options</h3>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <XCircle size={24} className="text-gray-600" />
                </button>
              </div>
              <div className="space-y-2 flex-1">
                {["extra", "large", "medium", "small", "list"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { setViewMode(mode); setMobileMenuOpen(false); }}
                    className={`w-full text-left px-4 py-4 rounded-xl border-2 font-medium transition-all ${
                      viewMode === mode 
                        ? "bg-[#eef6ff] border-[#3b86d1] shadow-md" 
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Content */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 sm:p-16 text-center text-lg sm:text-xl text-[#3b86d1] font-semibold border border-gray-200/50">
            No vehicles found.
          </div>
        ) : (
          <div className={`grid gap-4 sm:gap-6 ${gridClassByMode[viewMode] || "grid-cols-1"}`}>
            {filtered.map((v) => {
              const commonCard = `bg-white rounded-2xl shadow-lg border border-[#e9f0fb] hover:shadow-xl hover:-translate-y-1 transition-all ${cardClassByMode[viewMode] || ""}`;

              return (
                <div key={v.vehicle_id} className={commonCard}>
                  {isList ? (
                    /* List View - Responsive */
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-2 sm:p-0">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="bg-[#3b86d1] text-white rounded-full px-2.5 sm:px-3 py-1.5 font-semibold text-sm sm:text-lg flex-shrink-0">
                          {v.vehicle_id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[#2763ad] font-bold text-base sm:text-lg truncate">{v.vehicle_no}</div>
                          <div className="text-sm text-gray-600 truncate">{v.model}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end sm:justify-normal pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                        <button
                          onClick={() => navigate(`/vehicle-edit/${v.vehicle_id}`)}
                          className="px-3 py-1.5 sm:px-3 sm:py-1 rounded-md bg-[#eef6ff] text-[#2763ad] font-medium hover:bg-[#e0efff] text-xs sm:text-sm flex-1 sm:flex-none transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(v.vehicle_id)}
                          className="text-red-600 hover:text-red-800 rounded-full p-2 sm:p-2 transition-all bg-[#fff0f2] hover:bg-[#fff5f7] shadow-sm hover:shadow-md flex-shrink-0"
                          aria-label="Delete vehicle"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Card View - Responsive */
                    <div className="flex flex-col gap-3 p-4 sm:p-6 h-full">
                      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-2">
                        <span className="bg-[#3b86d1] text-white rounded-full px-3 py-1.5 font-semibold text-base sm:text-lg flex-shrink-0">
                          {v.vehicle_id}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[#2763ad] font-bold text-lg sm:text-xl truncate">{v.vehicle_no}</div>
                          <div className="text-sm sm:text-base text-gray-600">{v.model}</div>
                        </div>
                      </div>

                      <div className="text-sm sm:text-base text-gray-700 space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-[#3b86d1] rounded-full flex-shrink-0"></span>
                          Driver: <span className="font-semibold text-[#3b86d1]">{v.driver_name || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></span>
                          Capacity: <span className="font-semibold text-emerald-600">{v.capacity || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>
                          Note: <span className="font-semibold text-orange-600 truncate" title={v.note}>{v.note || "—"}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-3 pt-4 border-t border-gray-200 mt-auto">
                        <div className="text-xs sm:text-sm text-[#6b7a92] order-3 sm:order-1">
                          Created: {v.created_at ? v.created_at.split(" ")[0] : "—"}
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto order-2">
                          <button
                            onClick={() => navigate(`/vehicle-edit/${v.vehicle_id}`)}
                            className="flex-1 sm:flex-none px-4 py-2 sm:px-3 sm:py-1 rounded-md bg-[#eef6ff] text-[#2763ad] font-medium hover:bg-[#e0efff] transition-all text-xs sm:text-sm shadow-sm hover:shadow-md"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(v.vehicle_id)}
                            className="text-red-600 hover:text-red-800 rounded-full p-2.5 sm:p-2 transition-all bg-[#fff0f2] hover:bg-[#fff5f7] shadow-sm hover:shadow-md flex-shrink-0"
                          >
                            <XCircle size={18} className="sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
