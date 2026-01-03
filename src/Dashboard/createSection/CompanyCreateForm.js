import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const COMPANIES_API = "http://localhost/my_app/Backend/api/companies.php";

export default function CompanyCreateForm({ showAlert }) {
  const navigate = useNavigate();
  const { companyId } = useParams();          // ✅ EDIT ke liye
  const isEdit = Boolean(companyId);

  const [form, setForm] = useState({
    companyName: "",
    contact: "",
    email: "",
    gst: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);

  /* ================= LOAD COMPANY FOR UPDATE ================= */
  useEffect(() => {
    if (!isEdit) return;

    const loadCompany = async () => {
      try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) {
          showAlert?.("error", "User not logged in");
          return;
        }

        const res = await axios.get(
          `${COMPANIES_API}?company_id=${companyId}&user_id=${user_id}`
        );

        if (res.data?.success === false) {
          showAlert?.("error", res.data.message || "Company not found");
          return;
        }

        const c = res.data;

        setForm({
          companyName: c.company_name || "",
          contact: c.contact || "",
          email: c.email || "",
          gst: c.gst || "",
          address: c.address || "",
        });
      } catch (err) {
        console.error(err);
        showAlert?.("error", "Failed to load company");
      }
    };

    loadCompany();
  }, [companyId, isEdit, showAlert]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
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
        company_name: form.companyName,
        contact: form.contact,
        email: form.email,
        gst: form.gst,
        address: form.address,
        user_id: Number(user_id),
      };

      let resp;
      if (isEdit) {
        payload.company_id = Number(companyId);
        resp = await axios.put(COMPANIES_API, payload, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        resp = await axios.post(COMPANIES_API, payload, {
          headers: { "Content-Type": "application/json" },
        });
      }

      if (resp?.data?.success) {
        showAlert?.(
          "success",
          isEdit
            ? "Company updated successfully!"
            : "Company created successfully!"
        );

        setTimeout(() => {
          navigate("/companylistpage"); // apna list route
        }, 400);
      } else {
        showAlert?.(
          "error",
          resp?.data?.message || "Operation failed"
        );
      }
    } catch (err) {
      console.error("Company save error:", err);
      showAlert?.("error", "Error saving company. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI (UNCHANGED) ================= */
  return (
    <div className="min-h-screen w-full bg-[#EEF3F8] text-[#2B3A55] px-4 py-10">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-40 flex items-center gap-2 px-3 py-2 bg-white/90 rounded-full shadow-md hover:shadow-lg transition"
      >
        <ArrowLeft size={20} className="text-[#1E3A8A]" />
        <span className="hidden md:inline text-sm font-semibold text-[#1E3A8A]">
          Back
        </span>
      </button>

      <div className="max-w-3xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1E3A8A] text-center mb-4">
            {isEdit ? "Update Company" : "Create Company"}
          </h2>

          <p className="text-sm text-[#2B3A55] text-center mb-6">
            {isEdit
              ? "Company details update karein"
              : "Add a new company record"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-[#1E3A8A] mb-1">Company Name</label>
              <input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="Enter company name"
                required
                className="bg-transparent border-b-2 border-[#E6EDF7] focus:border-[#1E3A8A] py-3 outline-none text-[#2B3A55] placeholder-[#9aa6bf]"
              />
            </div>

            {/* Contact & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-[#1E3A8A] mb-1">Contact</label>
                <input
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="Phone number"
                  required
                  className="bg-transparent border-b-2 border-[#E6EDF7] focus:border-[#1E3A8A] py-3 outline-none text-[#2B3A55] placeholder-[#9aa6bf]"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-[#1E3A8A] mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email (optional)"
                  className="bg-transparent border-b-2 border-[#E6EDF7] focus:border-[#1E3A8A] py-3 outline-none text-[#2B3A55] placeholder-[#9aa6bf]"
                />
              </div>
            </div>

            {/* GST */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-[#1E3A8A] mb-1">GST Number</label>
              <input
                name="gst"
                value={form.gst}
                onChange={handleChange}
                placeholder="Enter GST number (optional)"
                className="bg-transparent border-b-2 border-[#E6EDF7] focus:border-[#1E3A8A] py-3 outline-none text-[#2B3A55] placeholder-[#9aa6bf]"
              />
            </div>

            {/* Address */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-[#1E3A8A] mb-1">Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter address"
                rows={4}
                required
                className="bg-transparent border-b-2 border-[#E6EDF7] focus:border-[#1E3A8A] py-3 outline-none text-[#2B3A55] placeholder-[#9aa6bf] resize-none"
              />
            </div>



            <button
              type="submit"
              disabled={loading}
              className="ml-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#153072] text-white font-semibold disabled:opacity-60"
            >
              {loading
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                ? "Update Company"
                : "Create Company"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
