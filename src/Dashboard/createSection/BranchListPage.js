import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, XCircle } from "lucide-react";
import axios from "axios";

/**
 * BranchListPage with view-mode dropdown
 */
export default function BranchListPage({ showConfirmDialog, showAlert }) {
  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewMode, setViewMode] = useState("large"); // extra, large, medium, small, list
  const navigate = useNavigate();
  const viewRef = useRef(null);
  

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) return;
        const resp = await axios.get(
          `http://localhost/my_app/Backend/api/branches.php?user_id=${user_id}`
        );
        setBranches(Array.isArray(resp.data) ? resp.data : []);
      } catch (err) {
        console.error("Branch fetch failed", err);
        setBranches([]);
      }
    };
    fetchBranches();
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

  // Delete branch
  const handleDelete = async (branch_id) => {
    try {
      await axios.delete(
        `http://localhost/my_app/Backend/api/branches.php?branch_id=${branch_id}`
      );
      setBranches((prev) => prev.filter((b) => b.branch_id !== branch_id));
      showAlert && showAlert("success", "Branch deleted successfully!");
    } catch (err) {
      console.error("Branch delete failed", err);
      showAlert && showAlert("error", "Failed to delete branch. Try again!");
    }
  };

  // Filter/search (null guards)
  const filteredBranches = Array.isArray(branches)
    ? branches.filter((b) =>
        (b.branch_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (b.manager || "").toLowerCase().includes(search.toLowerCase()) ||
        (b.address || "").toLowerCase().includes(search.toLowerCase())
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
      <div className="w-[96%] mx-auto rounded-xl bg-white shadow-md flex items-center gap-4 px-6 py-5 mb-10">
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
          Branches <span className="font-medium text-[#2763ad]">({filteredBranches.length})</span>
        </span>

        {/* -- View button + dropdown (left of create) -- */}
        <div className="relative ml-4" ref={viewRef}>
          <button
            onClick={() => setViewOpen((s) => !s)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#eef6ff] text-[#2763ad] hover:bg-[#e3f0ff] transition"
            title="Change view"
          >
            {/* simple icon-like circles to indicate view */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2763ad" strokeWidth="1.6">
              <rect x="3" y="4" width="18" height="6" rx="1" />
              <rect x="3" y="14" width="18" height="6" rx="1" />
            </svg>
            <span className="hidden md:inline text-sm font-medium">View</span>
          </button>

          {viewOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
              {/* Options */}
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
          onClick={() => navigate("/branchcreateform")}
        >
          + CREATE NEW BRANCH
        </button>
      </div>

      <div className="container mx-auto max-w-6xl px-4">
        {filteredBranches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 my-6 text-center text-lg text-[#3b86d1] font-semibold">
            No branch records found.
          </div>
        ) : (
          <div className={`grid gap-6 ${gridClassByMode[viewMode] || "grid-cols-1"}`}>
            {filteredBranches.map((branch) => {
              const isList = viewMode === "list";
              const commonCard = `bg-white rounded-2xl shadow-lg border border-[#e9f0fb] ${cardClassByMode[viewMode] || ""}`;
              return (
                <div key={branch.branch_id} className={commonCard}>
                  {/* If list view show compact single-line left details & actions on right */}
                  {isList ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-[#3b86d1] text-white rounded-full px-3 py-1 font-semibold text-lg">
                          {branch.branch_id}
                        </div>
                        <div>
                          <div className="text-[#2763ad] font-bold">{branch.branch_name}</div>
                          <div className="text-sm text-gray-600">{branch.address}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(`/branch-edit/${branch.branch_id}`)}
                            className="px-3 py-1 rounded-md bg-[#eef6ff] text-[#2763ad] font-medium hover:bg-[#e0efff]"
                          >
                            Edit
                          </button>
                        <button
                          onClick={() =>
                            showConfirmDialog
                              ? showConfirmDialog(
                                  "Are you sure you want to delete this branch?",
                                  () => handleDelete(branch.branch_id)
                                )
                              : window.confirm("Delete?") && handleDelete(branch.branch_id)
                          }
                          className="text-red-600 hover:text-red-800 rounded-full p-2 transition bg-[#fff0f2] hover:bg-[#fff5f7]"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Card mode (extra/large/medium/small)
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-[#3b86d1] text-white rounded-full px-3 py-1 font-semibold text-lg">
                          {branch.branch_id}
                        </span>
                        <span className="text-[#2763ad] font-bold text-base">{branch.branch_name}</span>
                      </div>
                      <div className="flex flex-col gap-1 text-gray-700">
                        <span>
                          Manager: <span className="font-semibold text-[#3b86d1]">{branch.manager}</span>
                        </span>
                        <span>
                          Contact: <span className="font-semibold text-[#2763ad]">{branch.contact}</span>
                        </span>
                        <span>
                          Address: <span className="font-semibold">{branch.address}</span>
                        </span>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/branch-edit/${branch.branch_id}`)}
                          className="px-3 py-1 rounded-md bg-[#eef6ff] text-[#2763ad] font-medium hover:bg-[#e0efff]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            showConfirmDialog
                              ? showConfirmDialog(
                                  "Are you sure you want to delete this branch?",
                                  () => handleDelete(branch.branch_id)
                                )
                              : window.confirm("Delete?") && handleDelete(branch.branch_id)
                          }
                          className="text-red-600 hover:text-red-800 rounded-full p-2 transition bg-[#fff0f2] hover:bg-[#fff5f7]"
                        >
                          <XCircle size={22} />
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
