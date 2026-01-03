// GoodsListPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, XCircle, Menu, Search } from "lucide-react";
import axios from "axios";

/**
 * GoodsListPage
 * - Same style & view system as BranchListPage (colors, view dropdown, cards)
 * - Fully responsive for mobile devices
 *
 * Props:
 *  - showConfirmDialog(prompt, onConfirm) optional
 *  - showAlert(type, message) optional
 *
 * Update API_URL if your backend path is different.
 */
const API_URL = `${process.env.REACT_APP_API_URL}/api/goods.php`;

export default function GoodsListPage({ showConfirmDialog, showAlert }) {
  const [goods, setGoods] = useState([]);
  const [search, setSearch] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState("large"); // extra, large, medium, small, list
  const viewRef = useRef(null);
  const navigate = useNavigate();

  // fetch goods list
  const fetchGoods = useCallback(async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) return;

      const resp = await axios.get(`${API_URL}?user_id=${user_id}`);
      setGoods(Array.isArray(resp.data) ? resp.data : []);
    } catch (err) {
      console.error("Failed to fetch goods", err);
      setGoods([]);
      showAlert?.("error", "Goods fetch failed");
    }
  }, [showAlert]);

  useEffect(() => {
    fetchGoods();
  }, [fetchGoods]);

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

  // delete goods
  const handleDelete = (goods_id) => {
    const doDelete = async () => {
      try {
        await axios.delete(`${API_URL}?goods_id=${goods_id}`);
        setGoods((prev) => prev.filter((g) => g.goods_id !== goods_id));
        showAlert?.("success", "Goods deleted");
      } catch (err) {
        console.error("Delete failed", err);
        showAlert?.("error", "Failed to delete goods");
      }
    };

    if (showConfirmDialog) {
      showConfirmDialog("Kya aap sure hain goods delete karne ke liye?", doDelete);
    } else {
      if (window.confirm("Kya aap sure hain goods delete karne ke liye?")) doDelete();
    }
  };

  // filter/search
  const filtered = Array.isArray(goods)
    ? goods.filter((g) =>
        (
          (g.name || "") +
          " " +
          (g.weight || "") +
          " " +
          (g.description || "")
        ).toLowerCase().includes(search.toLowerCase())
      )
    : [];

  // view mappings (mobile optimized)
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

  const isMobile = window.innerWidth < 768;

  return (
    <div className="min-h-screen bg-[#f0f4f8] relative py-4 sm:py-8">
      {/* Top bar - Mobile responsive */}
      <div className="w-[95%] sm:w-[96%] mx-auto rounded-xl bg-white shadow-md flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 mb-6 sm:mb-10">
        {/* Left section - Back + Title */}
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate(`/dashboard`)}
            className="flex items-center justify-center p-2 sm:p-3 rounded-full bg-white shadow-md hover:bg-[#e3eeff] transition-transform hover:scale-105 min-w-[44px] h-[44px] sm:min-w-0 sm:h-auto"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="sm:w-6 sm:h-6 text-[#2763ad]" />
          </button>

          <div className="flex items-center gap-3">
            <svg
              width="28"
              height="28"
              smWidth="36"
              smHeight="36"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              className="text-[#3b86d1] w-7 h-7 sm:w-9 sm:h-9"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M8 7h8M8 11h6M8 15h4" />
            </svg>
            <span className="text-[#3b86d1] flex items-center gap-2 sm:gap-4 font-bold text-xl sm:text-2xl truncate">
              Goods <span className="font-medium text-[#2763ad] text-sm sm:text-lg">({filtered.length})</span>
            </span>
          </div>
        </div>

        {/* Right section - Mobile menu + Search + Actions */}
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg hover:bg-[#eef6ff] transition"
          >
            <Menu size={20} className="text-[#2763ad]" />
          </button>

          {/* Search - Full width on mobile */}
          <div className="relative flex-1 sm:w-60 sm:flex-none">
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#3b86d1] hover:border-[#2763ad] transition pl-10"
              placeholder="Search goods..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* View dropdown - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:block relative" ref={viewRef}>
            <button
              onClick={() => setViewOpen((s) => !s)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#eef6ff] text-[#2763ad] hover:bg-[#e3f0ff] transition"
              title="Change view"
              aria-haspopup="true"
              aria-expanded={viewOpen}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2763ad" strokeWidth="1.6">
                <rect x="3" y="4" width="18" height="6" rx="1" />
                <rect x="3" y="14" width="18" height="6" rx="1" />
              </svg>
              <span className="hidden lg:inline text-sm font-medium">View</span>
            </button>

            {viewOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
                <button
                  onClick={() => { setViewMode("extra"); setViewOpen(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-[#f5f9ff] ${viewMode === "extra" ? "bg-[#eef6ff]" : ""}`}
                >
                  Extra large
                </button>
                <button
                  onClick={() => { setViewMode("large"); setViewOpen(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-[#f5f9ff] ${viewMode === "large" ? "bg-[#eef6ff]" : ""}`}
                >
                  Large
                </button>
                <button
                  onClick={() => { setViewMode("medium"); setViewOpen(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-[#f5f9ff] ${viewMode === "medium" ? "bg-[#eef6ff]" : ""}`}
                >
                  Medium
                </button>
                <button
                  onClick={() => { setViewMode("small"); setViewOpen(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-[#f5f9ff] ${viewMode === "small" ? "bg-[#eef6ff]" : ""}`}
                >
                  Small
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

          {/* Create button */}
          <button
            className="bg-[#3b86d1] text-white font-bold rounded-lg px-4 sm:px-5 py-2 text-sm sm:text-base shadow hover:scale-105 transition hover:bg-[#2763ad] whitespace-nowrap"
            onClick={() => navigate("/goodscreateform")}
          >
            + CREATE
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileMenuOpen(false)} />
      )}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed top-0 right-0 w-64 h-full bg-white shadow-2xl z-50 transform transition-transform">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-[#3b86d1]">View Options</h3>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle size={24} className="text-gray-600" />
              </button>
            </div>
            <div className="space-y-2">
              {["extra", "large", "medium", "small", "list"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => { setViewMode(mode); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-lg border ${viewMode === mode ? "bg-[#eef6ff] border-[#3b86d1]" : "hover:bg-[#f5f9ff] border-gray-200"}`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1).replace(/^\w/, (c) => c.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto max-w-6xl px-3 sm:px-4 w-full">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 sm:p-10 my-6 text-center text-base sm:text-lg text-[#3b86d1] font-semibold">
            No goods found.
          </div>
        ) : (
          <div className={`grid gap-4 sm:gap-6 ${gridClassByMode[viewMode] || "grid-cols-1"}`}>
            {filtered.map((g) => {
              const isList = viewMode === "list";
              const commonCard = `bg-white rounded-2xl shadow-lg border border-[#e9f0fb] hover:shadow-xl transition-shadow ${cardClassByMode[viewMode] || ""}`;

              return (
                <div key={g.goods_id} className={commonCard}>
                  {isList ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-[#3b86d1] text-white rounded-full px-2 sm:px-3 py-1 font-semibold text-base sm:text-lg flex-shrink-0">
                          {g.goods_id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[#2763ad] font-bold text-base truncate">{g.name}</div>
                          <div className="text-sm text-gray-600">{g.weight || "—"}</div>
                        </div>
                      </div>
                      <div className="flex justify-end pt-2 border-t border-gray-100">
                        <button
                          onClick={() =>
                            showConfirmDialog
                              ? showConfirmDialog(
                                  "Are you sure you want to delete this goods?",
                                  () => handleDelete(g.goods_id)
                                )
                              : window.confirm("Delete?") && handleDelete(g.goods_id)
                          }
                          className="text-red-600 hover:text-red-800 rounded-full p-2 transition bg-[#fff0f2] hover:bg-[#fff5f7]"
                          aria-label="Delete goods"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:gap-4 h-full">
                      <div className="flex items-start gap-3 sm:gap-4 mb-2 sm:mb-3 flex-wrap">
                        <span className="bg-[#3b86d1] text-white rounded-full px-2 sm:px-3 py-1 font-semibold text-sm sm:text-lg flex-shrink-0">
                          {g.goods_id}
                        </span>
                        <span className="text-[#2763ad] font-bold text-sm sm:text-base flex-1 min-w-0 truncate">
                          {g.name}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <span>Weight:</span>
                          <span className="font-semibold text-[#3b86d1]">{g.weight || "—"}</span>
                        </span>
                        <span className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <span>Description:</span>
                          <span className="font-semibold text-[#2763ad] truncate max-w-full">{g.description || "—"}</span>
                        </span>
                        <span className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <span>Created:</span>
                          <span className="font-semibold">{g.created_at ? g.created_at.split(" ")[0] : "—"}</span>
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-0 border-t border-gray-100 sm:border-t-0">
                        <button
                          onClick={() => navigate(`/goods-edit/${g.goods_id}`)}
                          className="w-full sm:w-auto px-3 py-2 rounded-md bg-[#eef6ff] text-[#2763ad] font-medium hover:bg-[#e0efff] text-sm transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            showConfirmDialog
                              ? showConfirmDialog(
                                  "Are you sure you want to delete this goods?",
                                  () => handleDelete(g.goods_id)
                                )
                              : window.confirm("Delete?") && handleDelete(g.goods_id)
                          }
                          className="text-red-600 hover:text-red-800 rounded-full p-2 sm:p-2.5 transition bg-[#fff0f2] hover:bg-[#fff5f7] self-end sm:self-auto"
                          aria-label="Delete goods"
                        >
                          <XCircle size={18} className="sm:w-5 sm:h-5" />
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
