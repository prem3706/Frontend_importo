import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const GOODS_API = `${process.env.REACT_APP_API_URL}/api/goods.php`;

export default function GoodsCreateForm({ showAlert }) {
  const navigate = useNavigate();
  const { goods_id } = useParams(); // 👈 edit ke time milega
  const isEdit = Boolean(goods_id);

  const [form, setForm] = useState({
    name: "",
    weight: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ================= LOAD GOODS (EDIT MODE) ================= */
  useEffect(() => {
    if (!isEdit) return;

    const loadGoods = async () => {
      setLoading(true);
      try {
        const resp = await axios.get(`${GOODS_API}?goods_id=${goods_id}`);
        const data = resp.data?.data ?? resp.data;

        if (data) {
          setForm({
            name: data.name ?? "",
            weight: data.weight ?? "",
            description: data.description ?? "",
          });
        } else {
          showAlert?.("error", "Goods not found");
        }
      } catch (err) {
        console.error(err);
        showAlert?.("error", "Failed to load goods");
      } finally {
        setLoading(false);
      }
    };

    loadGoods();
  }, [goods_id, isEdit, showAlert]);

  /* ================= CHANGE HANDLER ================= */
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const user_id = Number(localStorage.getItem("user_id"));
      if (!user_id) {
        showAlert?.("error", "User not logged in");
        setSaving(false);
        return;
      }

      const payload = {
        name: form.name,
        weight: form.weight,
        description: form.description,
        user_id,
      };

      let resp;

      if (isEdit) {
        // 🔥 UPDATE
        resp = await axios.put(
          GOODS_API,
          { goods_id: Number(goods_id), ...payload },
          { headers: { "Content-Type": "application/json" } }
        );
      } else {
        // 🔥 CREATE
        resp = await axios.post(
          GOODS_API,
          payload,
          { headers: { "Content-Type": "application/json" } }
        );
      }

      if (resp.data?.success) {
        showAlert?.(
          "success",
          isEdit ? "Goods updated successfully!" : "Goods added successfully!"
        );

        // update ke baad data input me hi rahe
        if (isEdit && resp.data.data) {
          const d = resp.data.data;
          setForm({
            name: d.name ?? "",
            weight: d.weight ?? "",
            description: d.description ?? "",
          });
        } else {
          setForm({ name: "", weight: "", description: "" });
        }
      } else {
        showAlert?.("error", resp.data?.message || "Operation failed");
      }
    } catch (err) {
      console.error("Save goods failed:", err);
      showAlert?.("error", "Server error! Try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI (UNCHANGED) ================= */
  return (
    <div className="min-h-screen w-full bg-[#EEF3F8] text-[#2B3A55] px-4 py-10">
      {/* Floating Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-40 flex items-center gap-2 px-3 py-2 bg-white/90 rounded-full shadow-md hover:shadow-lg transition"
      >
        <ArrowLeft size={20} className="text-[#1E3A8A]" />
        <span className="hidden md:inline text-sm font-semibold text-[#1E3A8A]">
          Back
        </span>
      </button>

      {/* Centered Card */}
      <div className="max-w-3xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1E3A8A] text-center mb-4">
            {isEdit ? "Update Goods" : "Add Goods"}
          </h2>

          <p className="text-sm text-[#2B3A55] text-center mb-6">
            {isEdit
              ? "Update goods details — clean & professional style."
              : "Add new goods details — clean & professional style."}
          </p>

          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Goods Name */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-[#1E3A8A] mb-1">
                  Goods Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter goods name"
                  value={form.name}
                  onChange={handleChange}
                  className="bg-transparent border-b-2 border-[#E6EDF7] focus:border-[#1E3A8A] py-3 outline-none"
                  required
                />
              </div>

              {/* Weight */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-[#1E3A8A] mb-1">
                  Weight
                </label>
                <input
                  type="number"
                  name="weight"
                  placeholder="Enter weight"
                  value={form.weight}
                  onChange={handleChange}
                  className="bg-transparent border-b-2 border-[#E6EDF7] focus:border-[#1E3A8A] py-3 outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-[#1E3A8A] mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Enter description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="bg-transparent border-b-2 border-[#E6EDF7] focus:border-[#1E3A8A] py-3 outline-none resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 rounded-lg bg-white text-[#1E3A8A] shadow-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="ml-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#153072] text-white font-semibold shadow-lg disabled:opacity-60"
                >
                  {saving
                    ? isEdit
                      ? "Updating..."
                      : "Saving..."
                    : isEdit
                    ? "Update Goods"
                    : "Save Goods"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
