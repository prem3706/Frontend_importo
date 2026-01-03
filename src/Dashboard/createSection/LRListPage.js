// src/LR/LRListPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, XCircle, Menu, Search } from "lucide-react";
import axios from "axios";

const DEFAULT_API = `${process.env.REACT_APP_API_URL}/api/lrs.php`;

export default function LRListPage({
  apiUrl = DEFAULT_API,
  showConfirmDialog,
  showAlert,
}) {
  const [lrs, setLrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState("large"); // extra, large, medium, small, list
  const viewRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Success message from navigation state
  useEffect(() => {
    if (location.state?.successMessage) {
      showAlert?.("success", location.state.successMessage);
      // state clear so refresh pe repeat na ho
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showAlert]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (viewRef.current && !viewRef.current.contains(e.target)) {
        setViewOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch LR list
  useEffect(() => {
    let mounted = true;

    const fetchLRs = async () => {
      setLoading(true);
      setError(null);

      try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) {
          if (mounted) {
            setLrs([]);
            setLoading(false);
          }
          showAlert?.("error", "User not logged in");
          return;
        }

        const resp = await axios.get(`${apiUrl}?user_id=${user_id}`, {
          withCredentials: true,
        });

        if (!mounted) return;

        let list = [];
        if (Array.isArray(resp.data)) list = resp.data;
        else if (resp.data && Array.isArray(resp.data.data)) list = resp.data.data;
        else list = resp.data.data ?? resp.data ?? [];

        setLrs(list);
        setLoading(false);
      } catch (err) {
        console.error("LR fetch failed", err);
        if (mounted) {
          setError("Failed to load LR list");
          setLrs([]);
          setLoading(false);
        }
        showAlert?.("error", "Failed to load LR list");
      }
    };

    fetchLRs();

    return () => {
      mounted = false;
    };
  }, [apiUrl, showAlert]);

  // LR delete (LR + goods via DB cascade)
  const handleDelete = (lr_id) => {
    const doDelete = async () => {
      try {
        const user_id = localStorage.getItem("user_id");

        await axios.delete(`${apiUrl}?lr_id=${lr_id}&user_id=${user_id}`, {
          withCredentials: true,
        });

        setLrs((prev) =>
          prev.filter((r) => Number(r.lr_id ?? r.id) !== Number(lr_id))
        );
        showAlert?.("success", "LR deleted successfully");
      } catch (err) {
        console.error("Delete failed", err);
        showAlert?.("error", "Failed to delete LR. Try again!");
      }
    };

    if (showConfirmDialog) {
      showConfirmDialog(
        "Are you sure you want to delete this LR?",
        doDelete
      );
    } else {
      if (window.confirm("Are you sure you want to delete this LR?")) {
        doDelete();
      }
    }
  };

  // Search filter
  const filtered = lrs.filter((lr) => {
    const q = (search || "").toString().toLowerCase();
    if (!q) return true;

    const candidates = [
      lr.lr_number ?? lr.lrNumber ?? lr.lr_num ?? "",
      lr.consignor_name ?? lr.consignor ?? lr.consignorName ?? "",
      lr.consignee_name ?? lr.consignee ?? lr.consigneeName ?? "",
      lr.vehicle_no ?? lr.vehicle ?? lr.vehicleNo ?? "",
      lr.destination_branch ??
        lr.destination ??
        lr.destinationBranch ??
        lr.destination_city ??
        "",
      lr.date ?? lr.created_at ?? lr.createdAt ?? "",
      lr.total_value ?? lr.total ?? lr.totalPrice ?? 0,
    ];

    return candidates.some(
      (c) =>
        c !== null &&
        c !== undefined &&
        String(c).toLowerCase().includes(q)
    );
  });

  // Mobile-optimized view mappings
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
    list: "p-4 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between",
  };

  const lrId = (lr) => lr.lr_id ?? lr.id ?? lr.lrId;
  const lrNumber = (lr) =>
    lr.lr_number ?? lr.lrNumber ?? lr.lrNumberString ?? lr.lr_num ?? "—";
  const date = (lr) => lr.date ?? lr.created_at ?? lr.createdAt ?? "";
  const consignor = (lr) =>
    lr.consignor_name ?? lr.consignor ?? lr.consignorName ?? "";
  const consignee = (lr) =>
    lr.consignee_name ?? lr.consignee ?? lr.consigneeName ?? "";
  const vehicle = (lr) => lr.vehicle_no ?? lr.vehicle ?? lr.vehicleNo ?? "";
  const destination = (lr) =>
    lr.destination_branch ??
    lr.destination ??
    lr.destinationBranch ??
    lr.destination_city ??
    "";
  const packages = (lr) =>
    lr.total_packages ?? lr.packages ?? lr.totalPackages ?? "";
  const totalValue = (lr) =>
    lr.total_value ?? lr.total ?? lr.totalPrice ?? 0;

  const isList = viewMode === "list";

  return (
    <div className="min-h-screen bg-[#f0f4f8] relative py-4 sm:py-8">
      {/* Top Bar - Fully Responsive */}
      <div className="w-[95%] sm:w-[96%] mx-auto rounded-xl bg-white shadow-lg sm:shadow-md flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 mb-6 sm:mb-10">
        {/* Left Section */}
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto order-1 sm:order-none">
          <button
            onClick={() => navigate(`/dashboard`)}
            className="flex items-center justify-center p-2 sm:p-3 rounded-full bg-white shadow-md hover:bg-[#e3eeff] transition-transform hover:scale-105 min-w-[44px] h-[44px] sm:min-w-0 sm:h-auto"
            aria-label="Back"
          >
            <ArrowLeft size={20} className="sm:w-6 sm:h-6 text-[#2763ad]" />
          </button>

          <div className="flex items-center gap-3">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              className="text-[#3b86d1] w-7 h-7 sm:w-9 sm:h-9 flex-shrink-0"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M8 7h8M8 11h6M8 15h4" />
            </svg>
            <span className="text-[#3b86d1] flex items-center gap-2 sm:gap-4 font-bold text-xl sm:text-2xl truncate">
              LR <span className="font-medium text-[#2763ad] text-sm sm:text-lg">({filtered.length})</span>
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto order-3 sm:order-none">
          {/* Mobile Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg hover:bg-[#eef6ff] transition-colors flex-shrink-0"
          >
            <Menu size={20} className="text-[#2763ad]" />
          </button>

          {/* Search - Full width on mobile */}
          <div className="relative flex-1 sm:w-60 sm:flex-none order-2 sm:order-none w-full sm:w-auto">
            <input
              type="search"
              className="w-full rounded-lg border border-gray-300 px-10 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#3b86d1] hover:border-[#2763ad] transition bg-gray-50"
              placeholder="Search LR, consignor, consignee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* View Dropdown - Desktop only */}
          <div className="hidden lg:block relative ml-2 sm:ml-4" ref={viewRef}>
            <button
              onClick={() => setViewOpen((s) => !s)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#eef6ff] text-[#2763ad] hover:bg-[#e3f0ff] transition-all"
              title="Change view"
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2763ad" strokeWidth="1.6">
                <rect x="3" y="4" width="18" height="6" rx="1" />
                <rect x="3" y="14" width="18" height="6" rx="1" />
              </svg>
              <span className="hidden xl:inline text-sm font-medium">View</span>
            </button>

            {viewOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-gray-200">
                {["extra", "large", "medium", "small", "list"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setViewMode(mode);
                      setViewOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-[#f5f9ff] transition-colors text-sm font-medium ${
                      viewMode === mode ? "bg-[#eef6ff] text-[#2763ad]" : ""
                    }`}
                  >
                    {mode === "extra" ? "Extra Large" : 
                     mode === "list" ? "List View" : 
                     `${mode.charAt(0).toUpperCase() + mode.slice(1)} Cards`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create Button */}
          <button
            className="bg-[#3b86d1] text-white font-bold rounded-lg px-4 sm:px-5 py-2.5 sm:py-2 mx-1 shadow-lg hover:scale-105 transition-all hover:bg-[#2763ad] text-sm sm:text-base whitespace-nowrap flex-shrink-0"
            onClick={() => navigate("/lrcreateform")}
          >
            + CREATE LR
          </button>
        </div>
      </div>

      {/* Mobile View Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div 
            className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-40" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="sm:hidden fixed top-0 right-0 w-72 h-full bg-white shadow-2xl z-50 transform translate-x-0 transition-transform">
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-xl font-bold text-[#3b86d1]">View Options</h3>
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle size={24} className="text-gray-600" />
                </button>
              </div>
              <div className="space-y-2 flex-1">
                {["extra", "large", "medium", "small", "list"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setViewMode(mode);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      viewMode === mode 
                        ? "bg-[#eef6ff] border-[#3b86d1] shadow-md" 
                        : "border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    {mode === "extra" ? "Extra Large Cards" : 
                     mode === "list" ? "List View" : 
                     `${mode.charAt(0).toUpperCase() + mode.slice(1)} Cards`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Content Area */}
      <div className="container mx-auto max-w-6xl px-3 sm:px-4 w-full">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 my-6 text-center text-lg sm:text-xl text-[#3b86d1] font-semibold">
            Loading LRs...
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 my-6 text-center text-lg sm:text-xl text-red-600 font-semibold">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 my-6 text-center text-lg sm:text-xl text-[#3b86d1] font-semibold">
            No LR records found.
          </div>
        ) : (
          <div
            className={`grid gap-4 sm:gap-6 ${gridClassByMode[viewMode] || "grid-cols-1"}`}
          >
            {filtered.map((lr) => {
              const commonCard = `bg-white rounded-2xl shadow-lg sm:shadow-xl border border-[#e9f0fb] hover:shadow-2xl transition-all hover:-translate-y-1 ${cardClassByMode[viewMode] || ""}`;

              return (
                <div key={lrId(lr)} className={commonCard}>
                  {isList ? (
                    /* List View - Mobile Optimized */
                    <div className="space-y-3 p-2 sm:p-0">
                      <div className="flex items-start gap-3">
                        <div className="bg-[#2763ad] text-white rounded-full px-2 sm:px-3 py-1.5 font-semibold text-sm sm:text-lg flex-shrink-0 min-w-[60px]">
                          {lrNumber(lr)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[#2763ad] font-bold text-sm sm:text-base truncate">
                            {consignor(lr)} → {consignee(lr)}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 flex flex-wrap gap-1">
                            <span>{date(lr)}</span>
                            <span>•</span>
                            <span className="truncate max-w-[120px]">{vehicle(lr)}</span>
                            <span>•</span>
                            <span className="truncate">{destination(lr)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-2 pt-3 border-t border-gray-100">
                        <div className="text-xs sm:text-sm text-[#6b7a92] font-semibold w-full sm:w-auto text-right sm:text-left">
                          ₹ {Number(totalValue(lr)).toLocaleString("en-IN")}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end sm:justify-normal">
                          <button
                            onClick={() => navigate(`/lrcreateform/${lrId(lr)}`)}
                            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-[#eef6ff] text-[#2763ad] font-medium hover:bg-[#e0efff] text-xs sm:text-sm transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => navigate(`/lr/print/${lrId(lr)}`)}
                            className="px-3 py-2 rounded-lg bg-[#fffbe6] text-[#276300] font-medium hover:bg-[#fff2c2] text-xs sm:text-sm transition-all"
                          >
                            Print
                          </button>
                          <button
                            onClick={() => handleDelete(lrId(lr))}
                            className="p-2.5 sm:p-2 rounded-full bg-[#fff0f2] text-red-600 hover:text-red-800 hover:bg-[#fff5f7] transition-all shadow-sm hover:shadow-md"
                            title="Delete"
                          >
                            <XCircle size={18} className="sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Card View - Responsive */
                    <div className="flex flex-col h-full p-3 sm:p-4 gap-3 sm:gap-4">
                      {/* Header */}
                      <div className="flex items-start gap-3 sm:gap-4 mb-2 sm:mb-3 flex-wrap">
                        <span className="bg-[#2763ad] text-white rounded-full px-2 sm:px-3 py-1.5 font-semibold text-sm sm:text-lg flex-shrink-0">
                          {lrNumber(lr)}
                        </span>
                        <span className="text-[#3b86d1] font-bold text-xs sm:text-sm flex-1 min-w-0 truncate">
                          {date(lr)}
                        </span>
                      </div>

                      {/* Main Info */}
                      <div className="flex flex-col gap-1.5 text-gray-700 text-xs sm:text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 font-medium min-w-[70px]">Consignor:</span>
                          <span className="font-semibold text-[#2763ad] truncate">{consignor(lr)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 font-medium min-w-[70px]">Consignee:</span>
                          <span className="font-semibold text-[#3b86d1] truncate">{consignee(lr)}</span>
                        </div>
                      </div>

                      {/* Tags - Responsive */}
                      <div className="flex flex-wrap gap-2 mt-auto">
                        <span className="bg-[#f6fafd] text-xs px-2.5 py-1.5 rounded-lg border border-[#ebebeb] text-[#2763ad]">
                          {vehicle(lr)}
                        </span>
                        <span className="bg-[#f6fafd] text-xs px-2.5 py-1.5 rounded-lg border border-[#ebebeb] text-[#3b86d1]">
                          {packages(lr)}
                        </span>
                        <span className="bg-[#f6fafd] text-xs px-2.5 py-1.5 rounded-lg border border-[#ebebeb] text-[#2763ad] truncate max-w-[100px]">
                           {destination(lr)}
                        </span>
                      </div>

                      {/* Footer Actions + Total */}
                      <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-3 pt-3 sm:pt-4 border-t border-gray-100 mt-auto">
                        <div className="text-xs sm:text-sm text-[#6b7a92] order-3 sm:order-1">
                          {date(lr)}
                        </div>
                        
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-none justify-center sm:justify-end order-2">
                          <button
                            onClick={() => navigate(`/lrcreateform/${lrId(lr)}`)}
                            className="px-3 py-1.5 sm:px-3 sm:py-1 rounded-lg bg-[#eef6ff] text-[#2763ad] font-medium hover:bg-[#e0efff] text-xs sm:text-sm transition-all whitespace-nowrap flex-1 sm:flex-none"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => navigate(`/lr/print/${lrId(lr)}`)}
                            className="px-3 py-1.5 sm:px-3 sm:py-1 rounded-lg bg-[#fffbe6] text-[#276300] font-medium hover:bg-[#fff2c2] text-xs sm:text-sm transition-all whitespace-nowrap flex-1 sm:flex-none"
                          >
                            Print
                          </button>
                          <button
                            onClick={() => handleDelete(lrId(lr))}
                            className="p-2 sm:p-2 rounded-full bg-[#fff0f2] text-red-600 hover:text-red-800 hover:bg-[#fff5f7] transition-all shadow-sm hover:shadow-md flex-shrink-0"
                            title="Delete"
                          >
                            <XCircle size={16} className="sm:w-5 sm:h-5" />
                          </button>
                        </div>

                        <div className="text-right font-bold text-lg sm:text-xl text-[#2763ad] order-1 sm:order-2 min-w-[100px]">
                          ₹ {Number(totalValue(lr)).toLocaleString("en-IN")}
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
