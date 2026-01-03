// VehicleListPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, XCircle, Menu, Search } from "lucide-react";
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/api/vehicles.php`;

export default function VehicleListPage({ showConfirmDialog, showAlert }) {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState("large"); // extra, large, medium, small, list
  const viewRef = useRef(null);
  const navigate = useNavigate();

  // Fetch vehicles with useCallback for optimization
  const fetchVehicles = useCallback(async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) return;
      
      const resp = await axios.get(`${API_URL}?user_id=${user_id}`);
      setVehicles(Array.isArray(resp.data) ? resp.data : []);
    } catch (err) {
      console.error("Failed to fetch vehicles", err);
      setVehicles([]);
      showAlert?.("error", "Vehicle list fetch failed");
    }
  }, [showAlert]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Close view dropdown on outside click
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

  // Search filter
  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    return (
      (v.vehicle_no || "").toString().toLowerCase().includes(q) ||
      (v.model || "").toString().toLowerCase().includes(q) ||
      (v.driver_name || "").toString().toLowerCase().includes(q)
    );
  });

  // Mobile-optimized responsive grid
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
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#e0e7ff] py-4 sm:py-8 relative">
      {/* Top Bar - Fully Responsive */}
      <div className="w-[95%] sm:w-[96%] mx-auto rounded-3xl bg-white/90 backdrop-blur-sm shadow-xl border border-white/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5 px-4 sm:px-6 sm:px-8 py-4 sm:py-5 mb-6 sm:mb-8">
        {/* Left Section */}
        <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto">
          <button
            onClick={() => navigate(`/dashboard`)}
            className="flex items-center justify-center p-2 sm:p-3 rounded-2xl bg-white shadow-md hover:bg-[#e3eeff] transition-all hover:scale-105 hover:shadow-lg min-w-[44px] h-[44px] sm:min-w-0 sm:h-auto"
            aria-label="Back to dashboard"
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
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2.5 rounded-xl hover:bg-[#eef6ff] transition-all flex-shrink-0"
          >
            <Menu size={20} className="text-[#2763ad]" />
          </button>

          {/* Search - Full width mobile */}
          <div className="relative flex-1 sm:w-72 sm:flex-none order-2 sm:order-none">
            <input
              type="text"
              placeholder="Search vehicle no / model / driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-gray-200/70 bg-white/50 backdrop-blur-sm px-12 sm:px-4 py-3 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#3b86d1]/50 focus:border-transparent shadow-sm transition-all placeholder-gray-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* View Dropdown - Desktop only */}
          <div className="hidden xl:block relative ml-2 sm:ml-4" ref={viewRef}>
            <button
              onClick={() => setViewOpen((s) => !s)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#eef6ff]/80 hover:bg-[#e3f0ff] text-[#2763ad] transition-all shadow-sm hover:shadow-md"
              title="Change view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2763ad" strokeWidth="1.6">
                <rect x="3" y="4" width="18" height="6" rx="1" />
                <rect x="3" y="14" width="18" height="6" rx="1" />
              </svg>
              <span className="text-sm font-medium hidden 2xl:inline">View</span>
            </button>

            {viewOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200/50">
                {["extra", "large", "medium", "small", "list"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { setViewMode(mode); setViewOpen(false); }}
                    className={`w-full text-left px-5 py-3 hover:bg-[#f5f9ff]/80 transition-all text-sm font-medium ${
                      viewMode === mode ? "bg-[#eef6ff] text-[#2763ad] shadow-sm" : ""
                    }`}
                  >
                    {mode === "extra" ? "Extra Large Cards" :
                     mode === "list" ? "List View" :
                     `${mode.charAt(0).toUpperCase() + mode.slice(1)} Cards`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create Button */}
          <button
            onClick={() => navigate("/vehiclecreateform")}
            className="bg-gradient-to-r from-[#3b86d1] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white font-bold rounded-2xl px-6 sm:px-5 py-3 sm:py-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm sm:text-base whitespace-nowrap flex-shrink-0"
          >
            + CREATE VEHICLE
          </button>
        </div>
      </div>

      {/* Mobile View Menu */}
      {mobileMenuOpen && (
        <>
          <div 
            className="sm:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="sm:hidden fixed top-0 right-0 w-80 h-full bg-white/95 backdrop-blur-xl shadow-2xl z-50 transform translate-x-0 transition-all">
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-[#3b86d1]">View Options</h3>
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="p-2 hover:bg-gray-100 rounded-2xl transition-all"
                >
                  <XCircle size={24} className="text-gray-600" />
                </button>
              </div>
              <div className="space-y-3 flex-1">
                {["extra", "large", "medium", "small", "list"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setViewMode(mode);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full p-5 rounded-2xl border-2 shadow-lg transition-all hover:shadow-xl transform hover:-translate-y-1 ${
                      viewMode === mode 
                        ? "bg-gradient-to-r from-[#3b86d1] to-[#2563eb] text-white shadow-2xl border-[#3b86d1]" 
                        : "border-gray-200 hover:border-gray-300 bg-white/80 hover:bg-white"
                    }`}
                  >
                    <div className="text-left font-bold text-lg">
                      {mode === "extra" ? "🟢 Extra Large" :
                       mode === "list" ? "📋 List View" :
                       `📱 ${mode.charAt(0).toUpperCase() + mode.slice(1)}`}
                    </div>
                    <div className="text-sm opacity-90 mt-1">
                      {mode === "extra" ? "Maximum details" :
                       mode === "list" ? "Compact list" :
                       `${mode} sized cards`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Content Grid */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 w-full">
        {filtered.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 sm:p-16 text-center border border-white/50">
            <div className="text-4xl text-gray-300 mb-6">🚛</div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#3b86d1] mb-3">No Vehicles Found</h3>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Create your first vehicle or adjust your search.
            </p>
            <button
              onClick={() => navigate("/vehiclecreateform")}
              className="bg-gradient-to-r from-[#3b86d1] to-[#2563eb] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              + Add Vehicle
            </button>
          </div>
        ) : (
          <div className={`grid gap-4 sm:gap-6 ${gridClassByMode[viewMode] || "grid-cols-1"}`}>
            {filtered.map((v) => {
              const commonCard = `bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl lg:shadow-lg border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-[#3b86d1]/30 ${cardClassByMode[viewMode] || ""}`;

              return (
                <div key={v.vehicle_id} className={commonCard}>
                  {isList ? (
                    /* List View - Mobile Optimized */
                    <div className="space-y-3">
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-[#3b86d1] to-[#2563eb] text-white rounded-2xl px-3 py-2 font-bold text-sm sm:text-base flex-shrink-0 min-w-[60px]">
                          {v.vehicle_id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[#2763ad] font-black text-lg truncate">{v.vehicle_no}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            🚗 {v.model || "—"}
                          </div>
                          <div className="text-xs text-gray-500">
                            👨‍💼 {v.driver_name || "No driver assigned"}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-3 pt-4 border-t border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-3 rounded-2xl">
                        <div className="text-xs sm:text-sm text-gray-600 w-full sm:w-auto text-right sm:text-left">
                          💪 Capacity: <span className="font-bold">{v.capacity || "—"}</span>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end sm:justify-normal">
                          <button
                            onClick={() => navigate(`/vehicle-edit/${v.vehicle_id}`)}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#eef6ff] text-[#2763ad] font-semibold hover:bg-[#e0efff] shadow-sm hover:shadow-md transition-all text-xs sm:text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(v.vehicle_id)}
                            className="p-3 rounded-2xl bg-[#fee2e2] text-red-600 hover:text-red-700 hover:bg-[#fecaca] shadow-sm hover:shadow-md transition-all flex-shrink-0"
                            aria-label="Delete vehicle"
                          >
                            <XCircle size={18} className="sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Card View - Fully Responsive */
                    <div className="flex flex-col h-full p-4 sm:p-6 gap-4 lg:gap-3">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4 lg:mb-2 flex-wrap">
                        <div className="bg-gradient-to-br from-[#3b86d1] to-[#2563eb] text-white rounded-2xl px-4 py-2.5 font-bold text-base sm:text-lg flex-shrink-0 shadow-lg">
                          {v.vehicle_id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[#2763ad] font-black text-xl sm:text-2xl truncate">{v.vehicle_no}</div>
                          <div className="text-sm sm:text-base text-gray-600 bg-gray-100/50 px-3 py-1 rounded-xl inline-block">
                            🚗 {v.model || "Model not specified"}
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm sm:text-base text-gray-700 flex-1">
                        <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-2xl">
                          <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-bold text-sm">👨‍💼</span>
                          </div>
                          <div>
                            <div className="font-semibold text-[#3b86d1]">Driver</div>
                            <div className="text-lg font-bold text-gray-900">{v.driver_name || "—"}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/50 rounded-2xl">
                          <div>
                            <div className="text-xs text-gray-600 uppercase font-medium tracking-wide">Capacity</div>
                            <div className="text-lg font-bold text-gray-900">{v.capacity || "—"}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600 uppercase font-medium tracking-wide">Note</div>
                            <div className="text-sm font-medium text-gray-800 truncate max-h-12 overflow-hidden" title={v.note}>
                              {v.note || "No notes"}
                            </div>
                          </div>
                        </div>

                        {v.created_at && (
                          <div className="text-xs text-gray-500 text-center p-2 bg-gray-50/50 rounded-xl font-medium">
                            Created: {v.created_at.split(" ")[0]}
                          </div>
                        )}
                      </div>

                      {/* Actions Footer */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200/50 mt-auto bg-gradient-to-r from-blue-50/70 to-indigo-50/70 p-3 rounded-2xl">
                        <button
                          onClick={() => navigate(`/vehicle-edit/${v.vehicle_id}`)}
                          className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-[#eef6ff] to-[#e0f2fe] text-[#2763ad] font-bold hover:from-[#e0f2fe] hover:to-[#dbeafe] shadow-sm hover:shadow-md transition-all text-sm"
                        >
                          Edit Details
                        </button>
                        <button
                          onClick={() => handleDelete(v.vehicle_id)}
                          className="p-3.5 rounded-2xl bg-gradient-to-r from-[#fee2e2] to-[#fecaca] text-red-600 hover:from-[#fecaca] hover:to-[#fed7d7] shadow-sm hover:shadow-md transition-all flex-shrink-0"
                        >
                          <XCircle size={20} />
                        </button>
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
