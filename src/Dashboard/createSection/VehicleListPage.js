// VehicleListPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, XCircle } from "lucide-react";
import axios from "axios";

/**
 * Props:
 *  - showConfirmDialog(prompt, onConfirm) optional
 *  - showAlert(type, message) optional
 *
 * CHANGE API_URL constant below to your backend endpoint.
 */
const API_URL = `${process.env.REACT_APP_API_URL}/api/vehicles.php`;

export default function VehicleListPage({ showConfirmDialog, showAlert }) {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewMode, setViewMode] = useState("large"); // extra, large, medium, small, list
  const viewRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // close view dropdown on outside click
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

  // mapping viewMode -> grid classes & card styles
  const gridClassByMode = {
    extra: "grid-cols-1",
    large: "grid-cols-1 md:grid-cols-2",
    medium: "grid-cols-2 md:grid-cols-3",
    small: "grid-cols-2 md:grid-cols-4",
    list: "grid-cols-1",
  };

  const cardClassByMode = {
    extra: "p-8 text-lg",
    large: "p-6",
    medium: "p-4",
    small: "p-3 text-sm",
    list: "p-4 flex flex-row items-center justify-between",
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] py-8">
      <div className="w-[96%] mx-auto rounded-xl bg-white shadow-md flex items-center gap-5 px-8 py-5 mb-8">
        <button
          onClick={() => navigate(`/dashboard`)}
          className="flex items-center p-3 rounded-full bg-white shadow-md hover:bg-[#e3eeff] transition-transform hover:scale-105"
        >
          <ArrowLeft size={24} className="text-[#2763ad]" />
        </button>

        <svg width="36" height="36" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" className="text-[#3b86d1]">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M8 7h8M8 11h6M8 15h4" />
        </svg>

        <h2 className="text-[#3b86d1] flex items-center gap-4 font-bold text-2xl">
          Vehicles <span className="font-medium text-[#2763ad]">({filtered.length})</span>
        </h2>

        {/* View control (left of create) */}
        <div className="relative ml-4" ref={viewRef}>
          <button
            onClick={() => setViewOpen((s) => !s)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#eef6ff] text-[#2763ad] hover:bg-[#e3f0ff] transition"
            title="Change view"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2763ad" strokeWidth="1.6">
              <rect x="3" y="4" width="18" height="6" rx="1" />
              <rect x="3" y="14" width="18" height="6" rx="1" />
            </svg>
            <span className="hidden md:inline text-sm font-medium">View</span>
          </button>

          {viewOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
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

        <input
          type="text"
          placeholder="Search vehicle no / model / driver..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto rounded-lg border border-gray-300 px-4 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-[#3b86d1]"
        />

        <button
          onClick={() => navigate("/vehiclecreateform")}
          className="bg-[#3b86d1] text-white font-bold rounded-lg px-5 py-2 mx-1 shadow hover:scale-105 transition"
        >
          + CREATE VEHICLE
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center text-lg text-[#3b86d1] font-semibold">
            No vehicles found.
          </div>
        ) : (
          <div className={`grid gap-6 ${gridClassByMode[viewMode] || "grid-cols-1"}`}>
            {filtered.map((v) => {
              const isList = viewMode === "list";
              const commonCard = `bg-white rounded-2xl shadow-lg border border-[#e9f0fb] ${cardClassByMode[viewMode] || ""}`;

              return (
                <div key={v.vehicle_id} className={commonCard}>
                  {isList ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-[#3b86d1] text-white rounded-full px-3 py-1 font-semibold text-lg">
                          {v.vehicle_id}
                        </div>
                        <div>
                          <div className="text-[#2763ad] font-bold">{v.vehicle_no}</div>
                          <div className="text-sm text-gray-600">{v.model}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/vehicle-edit/${v.vehicle_id}`)}
                          className="px-3 py-1 rounded-md bg-[#eef6ff] text-[#2763ad] font-medium hover:bg-[#e0efff]"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(v.vehicle_id)}
                          className="text-red-600 hover:text-red-800 rounded-full p-2 transition bg-[#fff0f2] hover:bg-[#fff5f7]"
                          aria-label="Delete vehicle"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-[#3b86d1] text-white rounded-full px-3 py-1 font-semibold text-lg">
                          {v.vehicle_id}
                        </span>
                        <div>
                          <div className="text-[#2763ad] font-bold text-lg">{v.vehicle_no}</div>
                          <div className="text-sm text-gray-600">{v.model}</div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-700">
                        <div>
                          Driver: <span className="font-semibold text-[#3b86d1]">{v.driver_name || "—"}</span>
                        </div>
                        <div>
                          Capacity: <span className="font-semibold">{v.capacity || "—"}</span>
                        </div>
                        <div>
                          Note: <span className="font-semibold">{v.note || "—"}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-[#6b7a92]">Created: {v.created_at ? v.created_at.split(" ")[0] : "—"}</div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigate(`/vehicle-edit/${v.vehicle_id}`)}
                            className="px-3 py-1 rounded-md bg-[#eef6ff] text-[#2763ad] font-medium hover:bg-[#e0efff]"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(v.vehicle_id)}
                            className="text-red-600 hover:text-red-800 rounded-full p-2 transition bg-[#fff0f2] hover:bg-[#fff5f7]"
                          >
                            <XCircle size={22} />
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
