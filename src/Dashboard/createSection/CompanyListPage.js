import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, XCircle } from "lucide-react";
import axios from "axios";

/**
 * CompanyListPage with view-mode dropdown
 *
 * Props:
 *  - showConfirmDialog(prompt, onConfirm)  // optional
 *  - showAlert(type, message)              // optional
 *
 * Replace COMPANIES_API with your real endpoint if needed.
 */
export default function CompanyListPage({ showConfirmDialog, showAlert }) {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewMode, setViewMode] = useState("large"); // extra, large, medium, small, list
  const viewRef = useRef(null);
  const navigate = useNavigate();

  const COMPANIES_API = "http://localhost/my_app/Backend/api/companies.php";
  const DELETE_COMPANY_API = "http://localhost/my_app/Backend/api/companies.php";

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) return;
        const resp = await axios.get(`${COMPANIES_API}?user_id=${user_id}`);
        setCompanies(Array.isArray(resp.data) ? resp.data : []);
      } catch (err) {
        console.error("Company fetch failed", err);
        setCompanies([]);
      }
    };
    fetchCompanies();
  }, []);

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

  // Delete company
  const handleDelete = async (company_id) => {
    try {
      await axios.delete(`${DELETE_COMPANY_API}?company_id=${company_id}`);
      setCompanies((prev) => prev.filter((c) => c.company_id !== company_id));
      showAlert && showAlert("success", "Company deleted successfully!");
    } catch (err) {
      console.error("Company delete failed", err);
      showAlert && showAlert("error", "Failed to delete company. Try again!");
    }
  };

  // Filter / search (safe guards for missing fields)
  const filtered = Array.isArray(companies)
    ? companies.filter((c) =>
        (
          (c.company_name || "")
            .toString()
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (c.contact || "").toString().toLowerCase().includes(search.toLowerCase()) ||
          (c.address || "").toString().toLowerCase().includes(search.toLowerCase()) ||
          (c.gst || "").toString().toLowerCase().includes(search.toLowerCase())
        )
      )
    : [];

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
    <div className="min-h-screen bg-[#f0f4f8] relative py-8">
      {/* Top bar */}
      <div className="w-[96%] mx-auto rounded-xl bg-white shadow-md flex items-center gap-5 px-8 py-5 mb-10">
        <button
          onClick={() => navigate(`/dashboard`)}
          className="flex items-center justify-start p-3 rounded-full bg-white shadow-md hover:bg-[#e3eeff] transition-transform hover:scale-105"
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
          Companies <span className="font-medium text-[#2763ad]">({filtered.length})</span>
        </span>

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
          className="rounded-lg border border-gray-300 px-4 py-2 w-60 text-base focus:outline-none focus:ring-2 focus:ring-[#3b86d1] hover:border-[#2763ad] transition ml-auto"
          placeholder="Type to Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className="bg-[#3b86d1] text-white font-bold rounded-lg px-5 py-2 mx-1 shadow hover:scale-105 transition hover:bg-[#2763ad]"
          onClick={() => navigate("/companycreateform")}
        >
          + CREATE NEW COMPANY
        </button>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-5xl px-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 my-6 text-center text-lg text-[#3b86d1] font-semibold">
            No company records found.
          </div>
        ) : (
          <div className={`grid gap-6 ${gridClassByMode[viewMode] || "grid-cols-1"}`}>
            {filtered.map((company) => {
              const isList = viewMode === "list";
              const commonCard = `bg-white rounded-2xl shadow-lg border border-[#e9f0fb] ${cardClassByMode[viewMode] || ""}`;

              return (
                <div key={company.company_id} className={commonCard}>
                  {isList ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-[#3b86d1] text-white rounded-full px-3 py-1 font-semibold text-lg">
                          {company.company_id}
                        </div>
                        <div>
                          <div className="text-[#2763ad] font-bold">{company.company_name}</div>
                          <div className="text-sm text-gray-600">{company.address}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/company-edit/${company.company_id}`)}
                          className="px-3 py-1 rounded-md bg-[#eef6ff] text-[#2763ad] font-medium hover:bg-[#e0efff]"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            showConfirmDialog
                              ? showConfirmDialog(
                                  "Are you sure you want to delete this company?",
                                  () => handleDelete(company.company_id)
                                )
                              : window.confirm("Delete?") && handleDelete(company.company_id)
                          }
                          className="text-red-600 hover:text-red-800 rounded-full p-2 transition bg-[#fff0f2] hover:bg-[#fff5f7]"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-[#3b86d1] text-white rounded-full px-3 py-1 font-semibold text-lg">
                          {company.company_id}
                        </span>
                        <span className="text-[#2763ad] font-bold text-base">{company.company_name}</span>
                      </div>

                      <div className="flex flex-col gap-1 text-gray-700">
                        <span>
                          Contact: <span className="font-semibold text-[#3b86d1]">{company.contact || "—"}</span>
                        </span>
                        <span>
                          Address: <span className="font-semibold">{company.address || "—"}</span>
                        </span>
                        {company.gst && (
                          <span>
                            GST: <span className="font-semibold text-[#2763ad]">{company.gst}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-[#6b7a92]">Created: {company.created_at ? company.created_at.split(" ")[0] : "—"}</div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigate(`/company-edit/${company.company_id}`)}
                            className="px-3 py-1 rounded-md bg-[#eef6ff] text-[#2763ad] font-medium hover:bg-[#e0efff]"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              showConfirmDialog
                                ? showConfirmDialog(
                                    "Are you sure you want to delete this company?",
                                    () => handleDelete(company.company_id)
                                  )
                                : window.confirm("Delete?") && handleDelete(company.company_id)
                            }
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
