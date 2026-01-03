import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const BRANCH_API = `${process.env.REACT_APP_API_URL}/api/branches.php`;

export default function BranchForm({ showAlert }) {
  const navigate = useNavigate();
  const { branchId } = useParams();
  const isEdit = Boolean(branchId);

  const [form, setForm] = useState({
    branchName: "",
    manager: "",
    contact: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  

  /* ================= LOAD BRANCH FOR EDIT ================= */
  useEffect(() => {
    if (!isEdit) return;

    const loadBranch = async () => {
      try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) {
          showAlert?.("error", "User not logged in");
          return;
        }

        const res = await axios.get(
          `${BRANCH_API}?branch_id=${branchId}&user_id=${user_id}`
        );

        if (res.data?.success === false) {
          showAlert?.("error", res.data.message || "Branch not found");
          return;
        }

        const b = res.data;

        setForm({
          branchName: String(b.branch_name || ""),
          manager: String(b.manager || ""),
          contact: String(b.contact || ""),
          address: String(b.address || ""),
        });
      } catch (err) {
        console.error(err);
        showAlert?.("error", "Failed to load branch");
      }
    };

    loadBranch();
  }, [branchId, isEdit, showAlert]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        showAlert?.("error", "User not logged in");
        setLoading(false);
        return;
      }

      const payload = {
        branch_name: String(form.branchName || ""),
        manager: String(form.manager || ""),
        contact: String(form.contact || ""),
        address: String(form.address || ""),
        user_id: Number(user_id),
      };

      let res;
      if (isEdit) {
        payload.branch_id = Number(branchId);
        res = await axios.put(BRANCH_API, payload, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        res = await axios.post(BRANCH_API, payload, {
          headers: { "Content-Type": "application/json" },
        });
      }

      if (res.data?.success) {
        showAlert?.(
          "success",
          isEdit
            ? "Branch updated successfully!"
            : "Branch created successfully!"
        );
        navigate("/brancheslistpage");
      } else {
        showAlert?.("error", res.data?.message || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      showAlert?.("error", "Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen w-full bg-[#EEF3F8] px-4 py-10">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-40 flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow"
      >
        <ArrowLeft size={20} className="text-[#1E3A8A]" />
        <span className="hidden md:inline font-semibold text-[#1E3A8A]">
          Back
        </span>
      </button>

      <div className="max-w-3xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
          <h2 className="text-3xl font-extrabold text-[#1E3A8A] text-center mb-6">
            {isEdit ? "Update Branch" : "Create Branch"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-[#1E3A8A]">
                Branch Name
              </label>
              <input
                name="branchName"
                value={form.branchName}
                onChange={handleChange}
                placeholder="Enter branch name"
                required
                className="w-full border-b-2 py-3 outline-none bg-transparent"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1E3A8A]">
                Manager
              </label>
              <input
                name="manager"
                value={form.manager}
                onChange={handleChange}
                placeholder="Enter manager name"
                required
                className="w-full border-b-2 py-3 outline-none bg-transparent"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1E3A8A]">
                Contact
              </label>
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder="Enter contact number"
                required
                className="w-full border-b-2 py-3 outline-none bg-transparent"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1E3A8A]">
                Address
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter branch address"
                rows={4}
                required
                className="w-full border-b-2 py-3 outline-none resize-none bg-transparent"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-lg bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-full bg-[#1E3A8A] text-white font-semibold disabled:opacity-60"
              >
                {loading
                  ? isEdit
                    ? "Updating..."
                    : "Creating..."
                  : isEdit
                  ? "Update Branch"
                  : "Create Branch"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
