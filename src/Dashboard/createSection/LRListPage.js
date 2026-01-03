// src/LR/LRListPage.jsx
import React, { useEffect, useState } from "react";

import { useNavigate ,useLocation} from "react-router-dom";
import { ArrowLeft, XCircle } from "lucide-react";
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
  const [viewMode, setViewMode] = useState("large"); // extra, large, medium, small, list
  const location = useLocation();


  const navigate = useNavigate();
  useEffect(() => {
  if (location.state?.successMessage) {
    showAlert?.("success", location.state.successMessage);

    // state clear so refresh pe repeat na ho
    window.history.replaceState({}, document.title);
  }
}, [location.state, showAlert]);


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
    <div className="min-h-screen bg-[#f0f4f8] relative py-8">
      {/* Top bar */}
      <div className="w-[96%] mx-auto rounded-xl bg-white shadow-md flex items-center gap-4 px-6 py-5 mb-10">
        <button
          onClick={() => navigate(`/dashboard`)}
          className="flex items-center justify-start p-3 rounded-full bg-white shadow-md hover:bg-[#e3eeff] transition-transform hover:scale-105"
          aria-label="Back"
        >
          <ArrowLeft size={24} className="text-[#2763ad]" />
        </button>

        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          className="text-[#3b86d1]"
        >
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M8 7h8M8 11h6M8 15h4" />
        </svg>

        <span className="text-[#3b86d1] flex items-center gap-4 font-bold text-2xl">
          LR{" "}
          <span className="font-medium text-[#2763ad]">
            ({filtered.length})
          </span>
        </span>

        {/* View dropdown */}
        <div className="relative ml-4">
          <button
            onClick={() => setViewOpen((s) => !s)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#eef6ff] text-[#2763ad] hover:bg-[#e3f0ff] transition"
            title="Change view"
            type="button"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2763ad"
              strokeWidth="1.6"
            >
              <rect x="3" y="4" width="18" height="6" rx="1" />
              <rect x="3" y="14" width="18" height="6" rx="1" />
            </svg>
            <span className="hidden md:inline text-sm font-medium">
              View
            </span>
          </button>

          {viewOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
              <button
                onClick={() => {
                  setViewMode("extra");
                  setViewOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-[#f5f9ff] ${
                  viewMode === "extra" ? "bg-[#eef6ff]" : ""
                }`}
              >
                Extra large icons
              </button>
              <button
                onClick={() => {
                  setViewMode("large");
                  setViewOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-[#f5f9ff] ${
                  viewMode === "large" ? "bg-[#eef6ff]" : ""
                }`}
              >
                Large icons
              </button>
              <button
                onClick={() => {
                  setViewMode("medium");
                  setViewOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-[#f5f9ff] ${
                  viewMode === "medium" ? "bg-[#eef6ff]" : ""
                }`}
              >
                Medium icons
              </button>
              <button
                onClick={() => {
                  setViewMode("small");
                  setViewOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-[#f5f9ff] ${
                  viewMode === "small" ? "bg-[#eef6ff]" : ""
                }`}
              >
                Small icons
              </button>
              <button
                onClick={() => {
                  setViewMode("list");
                  setViewOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-[#f5f9ff] ${
                  viewMode === "list" ? "bg-[#eef6ff]" : ""
                }`}
              >
                List
              </button>
            </div>
          )}
        </div>

        <input
          type="search"
          className="rounded-lg border border-gray-300 px-4 py-2 w-60 text-base focus:outline-none focus:ring-2 focus:ring-[#3b86d1] hover:border-[#2763ad] transition ml-auto"
          placeholder="Search LR, consignor, consignee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className="bg-[#3b86d1] text-white font-bold rounded-lg px-5 py-2 mx-1 shadow hover:scale-105 transition hover:bg-[#2763ad]"
          onClick={() => navigate("/lrcreateform")}
        >
          + CREATE NEW LR
        </button>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-6xl px-4">
        {loading ? (
          <div className="bg-white rounded-2xl shadow p-10 my-6 text-center text-lg text-[#3b86d1] font-semibold">
            Loading...
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow p-10 my-6 text-center text-lg text-red-600 font-semibold">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 my-6 text-center text-lg text-[#3b86d1] font-semibold">
            No LR records found.
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              gridClassByMode[viewMode] || "grid-cols-1"
            }`}
          >
            {filtered.map((lr) => {
              const isList = viewMode === "list";
              const commonCard = `bg-white rounded-2xl shadow-lg border border-[#e9f0fb] ${
                cardClassByMode[viewMode] || ""
              }`;

              const lrId = lr.lr_id ?? lr.id ?? lr.lrId;
              const lrNumber =
                lr.lr_number ??
                lr.lrNumber ??
                lr.lrNumberString ??
                lr.lr_num ??
                "—";
              const date = lr.date ?? lr.created_at ?? lr.createdAt ?? "";
              const consignor =
                lr.consignor_name ?? lr.consignor ?? lr.consignorName ?? "";
              const consignee =
                lr.consignee_name ?? lr.consignee ?? lr.consigneeName ?? "";
              const vehicle =
                lr.vehicle_no ?? lr.vehicle ?? lr.vehicleNo ?? "";
              const destination =
                lr.destination_branch ??
                lr.destination ??
                lr.destinationBranch ??
                lr.destination_city ??
                "";
              const packages =
                lr.total_packages ?? lr.packages ?? lr.totalPackages ?? "";
              const totalValue =
                lr.total_value ?? lr.total ?? lr.totalPrice ?? 0;

              return (
                <div key={lrId} className={commonCard}>
                  {isList ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-[#2763ad] text-white rounded-full px-3 py-1 font-semibold text-lg select-none">
                          {lrNumber}
                        </div>
                        <div>
                          <div className="text-[#2763ad] font-bold">
                            {consignor} → {consignee}
                          </div>
                          <div className="text-sm text-gray-600">
                            {date} • {vehicle} • {destination}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-sm text-[#6b7a92] mr-4">
                          ₹ {Number(totalValue).toFixed(2)}
                        </div>

                        <button
                          onClick={() => navigate(`/lrcreateform/${lrId}`)}
                          className="px-3 py-1 rounded-md bg-[#eef6ff] text-[#2763ad] font-medium hover:bg-[#e0efff]"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => navigate(`/lr/print/${lrId}`)}
                          className="px-3 py-1 rounded-md bg-[#fffbe6] text-[#276300] font-medium hover:bg-[#fff2c2]"
                        >
                          Print
                        </button>

                        <button
                          onClick={() => handleDelete(lrId)}
                          className="text-red-600 hover:text-red-800 rounded-full p-2 transition bg-[#fff0f2] hover:bg-[#fff5f7]"
                          title="Delete"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-[#2763ad] text-white rounded-full px-3 py-1 font-semibold text-lg select-none">
                          {lrNumber}
                        </span>
                        <span className="text-[#3b86d1] font-bold text-base">
                          {date}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 text-gray-700">
                        <span>
                          Consignor:{" "}
                          <span className="font-semibold text-[#2763ad]">
                            {consignor}
                          </span>
                        </span>
                        <span>
                          Consignee:{" "}
                          <span className="font-semibold text-[#3b86d1]">
                            {consignee}
                          </span>
                        </span>
                      </div>

                      <div className="flex gap-4 mt-1 text-sm">
                        <span className="bg-[#f6fafd] rounded-lg px-3 py-1 border border-[#ebebeb] text-[#2763ad]">
                          Vehicle: {vehicle}
                        </span>
                        <span className="bg-[#f6fafd] rounded-lg px-3 py-1 border border-[#ebebeb] text-[#3b86d1]">
                          Packages: {packages}
                        </span>
                        <span className="bg-[#f6fafd] rounded-lg px-3 py-1 border border-[#ebebeb] text-[#2763ad]">
                          Destination: {destination}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-[#6b7a92]">
                          Date: {date}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigate(`/lrcreateform/${lrId}`)}
                            className="px-3 py-1 rounded-md bg-[#eef6ff] text-[#2763ad] font-medium hover:bg-[#e0efff] mr-3"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => navigate(`/lr/print/${lrId}`)}
                            className="px-3 py-1 rounded-md bg-[#fffbe6] text-[#276300] font-medium hover:bg-[#fff2c2]"
                          >
                            Print
                          </button>

                          <button
                            onClick={() => handleDelete(lrId)}
                            className="text-red-600 hover:text-red-800 rounded-full p-2 transition bg-[#fff0f2] hover:bg-[#fff5f7]"
                            title="Delete"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      </div>

                      <div className="text-right font-bold mt-1 text-[#2763ad]">
                        ₹ {Number(totalValue).toFixed(2)}
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
