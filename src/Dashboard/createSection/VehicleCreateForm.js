// VehicleForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/api/vehicles.php`;

export default function VehicleForm({ showAlert }) {
  const navigate = useNavigate();
  const { vehicle_id } = useParams(); // ✅ route param MUST be :vehicle_id
  const isEdit = Boolean(vehicle_id);

  const [form, setForm] = useState({
    vehicle_no: "",
    model: "",
    capacity: "",
    driver_name: "",
    driver_contact: "",
    note: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ================= LOAD VEHICLE (EDIT MODE) ================= */
  useEffect(() => {
    if (!isEdit) return;

    const loadVehicle = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_URL}?vehicle_id=${vehicle_id}`
        );

        const data = res.data?.data;
        if (!data) {
          showAlert?.("error", "Vehicle not found");
          return;
        }

        // ✅ VERY IMPORTANT: form ko backend data se fill karo
        setForm({
          vehicle_no: data.vehicle_no || "",
          model: data.model || "",
          capacity: data.capacity || "",
          driver_name: data.driver_name || "",
          driver_contact: data.driver_contact || "",
          note: data.note || "",
        });
      } catch (err) {
        console.error(err);
        showAlert?.("error", "Failed to load vehicle");
      } finally {
        setLoading(false);
      }
    };

    loadVehicle();
  }, [vehicle_id, isEdit, showAlert]);

  /* ================= CHANGE HANDLER ================= */
  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
        vehicle_no: form.vehicle_no,
        model: form.model,
        capacity: form.capacity,
        driver_name: form.driver_name,
        driver_contact: form.driver_contact,
        note: form.note,
        user_id,
      };

      let res;

      if (isEdit) {
        // ✅ UPDATE
        res = await axios.put(
          API_URL,
          { vehicle_id: Number(vehicle_id), ...payload },
          { headers: { "Content-Type": "application/json" } }
        );
      } else {
        // ✅ CREATE
        res = await axios.post(
          API_URL,
          payload,
          { headers: { "Content-Type": "application/json" } }
        );
      }

      if (!res.data?.success) {
        showAlert?.("error", res.data?.message || "Operation failed");
        return;
      }

      showAlert?.(
        "success",
        isEdit ? "Vehicle updated successfully" : "Vehicle created successfully"
      );

      if (isEdit && res.data.data) {
        // ✅ update ke baad bhi input filled rahe
        const d = res.data.data;
        setForm({
          vehicle_no: d.vehicle_no || "",
          model: d.model || "",
          capacity: d.capacity || "",
          driver_name: d.driver_name || "",
          driver_contact: d.driver_contact || "",
          note: d.note || "",
        });
      } else {
        navigate("/vehiclelistpage");
      }
    } catch (err) {
      console.error(err);
      showAlert?.("error", "Server error while saving vehicle");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-[#EEF3F8] p-6">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-5 left-5 bg-white shadow rounded-full p-2"
      >
        <ArrowLeft className="text-blue-700" />
      </button>

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-8">
        <h1 className="text-2xl font-bold text-[#1E3A8A] mb-2 text-center">
          {isEdit ? "Edit Vehicle" : "Create Vehicle"}
        </h1>

        <p className="text-sm text-[#6B7A92] mb-6 text-center">
          Vehicle details
        </p>


        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-[#1E3A8A]">
                Vehicle Number
              </label>
              <input
                value={form.vehicle_no}
                placeholder="Enter vehicle number"
                onChange={(e) => setField("vehicle_no", e.target.value)}
                required
                className="w-full border-b-2 py-3 bg-transparent outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#1E3A8A]">
                Model / Type
              </label>
              <input
                value={form.model}
                placeholder="Truck / Tempo / Mini"
                onChange={(e) => setField("model", e.target.value)}
                className="w-full border-b-2 py-3 bg-transparent outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-[#1E3A8A]">
                  Capacity
                </label>
                <input
                  value={form.capacity}
                  placeholder="2 ton"
                  onChange={(e) => setField("capacity", e.target.value)}
                  className="w-full border-b-2 py-3 bg-transparent outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1E3A8A]">
                  Driver Name
                </label>
                <input
                  value={form.driver_name}
                  placeholder="Driver name"
                  onChange={(e) => setField("driver_name", e.target.value)}
                  className="w-full border-b-2 py-3 bg-transparent outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-[#1E3A8A]">
                  Driver Contact
                </label>
                <input
                  value={form.driver_contact}
                  placeholder="Mobile number"
                  onChange={(e) => setField("driver_contact", e.target.value)}
                  className="w-full border-b-2 py-3 bg-transparent outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1E3A8A]">
                  Note
                </label>
                <input
                  value={form.note}
                  placeholder="Optional note"
                  onChange={(e) => setField("note", e.target.value)}
                  className="w-full border-b-2 py-3 bg-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-lg bg-white border shadow-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#153072] text-white font-semibold shadow"
              >
                {saving
                  ? isEdit
                    ? "Updating..."
                    : "Creating..."
                  : isEdit
                    ? "Update Vehicle"
                    : "Create Vehicle"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
