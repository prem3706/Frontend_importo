// UserProfile.jsx (stacked, nicely designed action boxes)
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import DLoader from "../dashboardComponent/DLoader";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const initialState = {
  transportName: "",
  transportArea: "",
  city: "",
  state: "",
  country: "",
  email: "",
  mobile: "",
};

function getInitials(name) {
  if (!name) return "UN";
  const words = name.split(" ");
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function UserProfile({ showAlert }) {
  const [profile, setProfile] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // per-field editable state
  const [editable, setEditable] = useState({
    transportName: false,
    transportArea: false,
    city: false,
    state: false,
    country: false,
    mobile: false,
  });

  // refs to focus when enabling edit
  const refs = {
    transportName: useRef(null),
    transportArea: useRef(null),
    city: useRef(null),
    state: useRef(null),
    country: useRef(null),
    mobile: useRef(null),
  };

  const navigate = useNavigate();
  

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost/my_app/Backend/api/user_profile.php", {
          credentials: "include",
        });
        const data = await res.json();
        const payload = (data && typeof data === "object")
          ? (data.data ?? data.user ?? data)
          : {};
        const mobileVal = payload.mobile ?? payload.phone ?? payload.contact ?? "";
        const photoUrl = payload.photo_url ?? payload.photo ?? payload.avatar ?? null;
        setProfile((p) => ({ ...p, ...payload, mobile: mobileVal }));
        setPhotoPreview(photoUrl);
      } catch (err) {
        console.error("fetch profile error:", err);
        showAlert?.("error", "Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const toggleEdit = (field) => {
    setEditable((prev) => {
      const next = { ...prev, [field]: !prev[field] };
      if (!prev[field]) setTimeout(() => refs[field]?.current?.focus?.(), 60);
      return next;
    });
  };

  const normalizePhoneTo10 = (phone) => {
    if (!phone && phone !== "") return null;
    const cleaned = (phone || "").replace(/[\s\-()]+/g, "");
    const withoutPlus = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
    let digits = withoutPlus;
    if (digits.startsWith("91") && digits.length > 10) digits = digits.slice(2);
    digits = digits.replace(/\D/g, "");
    if (/^[6-9]\d{9}$/.test(digits)) return digits;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validate mobile
    const normalizedMobile = normalizePhoneTo10(profile.mobile);
    if (!normalizedMobile) {
      showAlert?.("error", "Please enter a valid 10-digit mobile number.");
      setEditable((ed) => ({ ...ed, mobile: true }));
      setTimeout(() => refs.mobile.current?.focus?.(), 80);
      return;
    }

    // prepare form data for update_profile.php (multipart)
    const formData = new FormData();
    formData.append("transportName", profile.transportName ?? "");
    formData.append("transportArea", profile.transportArea ?? "");
    formData.append("city", profile.city ?? "");
    formData.append("state", profile.state ?? "");
    formData.append("country", profile.country ?? "");
    formData.append("mobile", normalizedMobile);
    if (photoFile) formData.append("photo", photoFile);

    try {
      setSaving(true);
      const resp = await axios.post(
        "http://localhost/my_app/Backend/api/update_profile.php",
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );

      if (resp.data?.success) {
        showAlert?.("success", resp.data.message || "Profile updated");
        setEditable({
          transportName: false,
          transportArea: false,
          city: false,
          state: false,
          country: false,
          mobile: false,
        });
        if (resp.data.user) {
          setProfile((p) => ({ ...p, ...resp.data.user }));
          setPhotoPreview(resp.data.user.photo_url ?? photoPreview);
        } else {
          setProfile((p) => ({ ...p, mobile: normalizedMobile }));
        }
      } else {
        showAlert?.("error", resp.data?.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      showAlert?.("error", "Server error while updating profile");
    } finally {
      setSaving(false);
    }
  };

  const validatePassword = (password) => {
    if (password.length < 8)
      return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password))
      return "Password must include at least one CAPITAL letter.";
    if (!/[a-z]/.test(password))
      return "Password must include at least one small letter.";
    if (!/[0-9]/.test(password))
      return "Password must include at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      return "Password must include at least one special character.";
    return null; // ✅ valid
  };



  // Inline sub-components (no separate files)
  function ChangePasswordBox() {
    const [open, setOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [changing, setChanging] = useState(false);

    const resetForm = () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setOpen(false);
    };

    const doChange = async () => {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        showAlert?.("error", "Please fill all password fields.");
        return;
      }

      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        showAlert?.("error", passwordError);
        return;
      }

      if (newPassword !== confirmNewPassword) {
        showAlert?.("error", "New password and confirm password do not match.");
        return;
      }

      try {
        setChanging(true);
        const res = await axios.post(
          "http://localhost/my_app/Backend/api/change_password.php",
          {
            current_password: currentPassword,
            new_password: newPassword,
          },
          { withCredentials: true }
        );

        if (res.data?.success) {
          showAlert?.(
            "success",
            res.data.message || "Password changed successfully."
          );
          resetForm();
        } else {
          showAlert?.(
            "error",
            res.data?.message || "Password change failed."
          );
        }
      } catch (err) {
        console.error(err);
        showAlert?.("error", "Server error while changing password.");
      } finally {
        setChanging(false);
      }
    };

    return (
      <div className="bg-white border border-[#e6eefc] rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-[#23294a]">Change Password</h4>
            <p className="text-sm text-[#6b7280] mt-1">
              Update your account password periodically to keep your account secure.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((s) => !s)}
            className="px-3 py-1 rounded-md border text-[#3b86d1] hover:bg-[#eef6ff] transition text-sm"
          >
            {open ? "Close" : "Edit"}
          </button>
        </div>

        {open && (
          <div className="mt-4 space-y-3">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            />

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            />

            <p className="text-xs text-gray-500">
              Must contain 8+ characters, uppercase, lowercase, number & special
              character.
            </p>

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={doChange}
                disabled={changing}
                className="px-4 py-2 bg-[#3b86d1] text-white rounded-md disabled:opacity-60"
              >
                {changing ? "Changing..." : "Update"}
              </button>

              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-md border"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }


  function DeleteAccountBox() {
    const [open, setOpen] = useState(false);
    const [pwd, setPwd] = useState("");
    const [busy, setBusy] = useState(false);

    const doDelete = async () => {
      if (!pwd || pwd.length < 4) {
        showAlert?.("error", "Please enter your password to confirm.");
        return;
      }

      try {
        setBusy(true);

        const res = await axios.post(
          "http://localhost/my_app/Backend/api/delete_account.php",
          { password: pwd },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );

        console.log("DELETE RESPONSE:", res.data); // 🔍 DEBUG

        if (res.data?.success) {
          showAlert?.("success", res.data.message || "Account deleted");
          window.location.href = "/";
        } else {
          showAlert?.("error", res.data?.message || "Delete failed");
        }
      } catch (err) {
        console.error("DELETE ERROR:", err.response?.data || err.message);
        showAlert?.(
          "error",
          err.response?.data?.message || "Server error while deleting account"
        );
      } finally {
        setBusy(false);
      }
    };


    return (
      <div className="bg-white border border-red-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-red-600">Delete Account</h4>
            <p className="text-sm text-[#6b7280] mt-1">Permanently remove your account and all related data.</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((s) => !s)}
            className="px-3 py-1 rounded-md border text-red-500 hover:bg-red-50 transition text-sm"
          >
            {open ? "Close" : "Confirm"}
          </button>
        </div>

        {open && (
          <div className="mt-4 space-y-3">
            <input
              type="password"
              placeholder="Enter password to confirm"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            />
            <div className="flex items-center gap-3">
              <button onClick={doDelete} disabled={busy} className="px-4 py-2 bg-red-600 text-white rounded-md">
                {busy ? "Deleting..." : "Delete Now"}
              </button>
              <button onClick={() => { setOpen(false); setPwd(""); }} className="px-4 py-2 rounded-md border">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function LogoutBox() {
    const [busy, setBusy] = useState(false);
    const doLogout = async () => {
      try {
        setBusy(true);
        await axios.post(`${process.env.REACT_APP_API_URL}/api/logout.php`, {}, { withCredentials: true });
      } catch (err) {
        console.warn(err);
      } finally {
        localStorage.removeItem("user_id");
        setBusy(false);
        window.location.href = "/";
      }
    };

    return (
      <div className="bg-white border border-[#e6eefc] rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-[#23294a]">Logout</h4>
            <p className="text-sm text-[#6b7280] mt-1">Sign out from this device to protect your account.</p>
          </div>
          <button onClick={doLogout} disabled={busy} className="px-3 py-1 rounded-md border text-[#3b86d1] hover:bg-[#eef6ff]">
            {busy ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <DLoader className="py-20" />;

  // pencil icon small
  const Pencil = ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );

  const renderEditableRow = ({ id, label, name, placeholder = "" }) => {
    const isEditable = !!editable[name];
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label htmlFor={id} className="block text-sm font-semibold text-[#23294a] mb-1">{label}</label>
          <input
            id={id}
            name={name}
            ref={refs[name]}
            value={profile[name] ?? ""}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={!isEditable}
            className={`w-full rounded-md border px-4 py-3 text-[#23294a] placeholder-[#a0aec0] focus:outline-none ${isEditable ? "border-[#3b86d1] bg-white" : "border-[#e2e8f0] bg-gray-50"}`}
          />
        </div>
        <div className="flex-shrink-0 mt-6">
          <button
            type="button"
            onClick={() => toggleEdit(name)}
            title={isEditable ? "Lock field" : "Edit field"}
            className={`w-10 h-10 rounded-full flex items-center justify-center border ${isEditable ? "bg-[#3b86d1] text-white border-[#3b86d1]" : "bg-white text-[#3b86d1] border-[#e6eefc]"} hover:brightness-95 transition`}
          >
            <Pencil />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen px-6 py-12 bg-[#f0f4f8] pt-[120px] relative">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center justify-start p-2 rounded-full bg-white shadow-md hover:bg-[#f0f4f8] hover:shadow-lg transition-all duration-300"
        style={{ position: "absolute", left: "80px", top: "120px", zIndex: 10 }}
      >
        <ArrowLeft size={28} className="text-blue-500 hover:text-blue-700 transition duration-200" />
      </button>

      <div className="max-w-5xl mx-auto">
        {/* top: photo + small preview */}
        <div className="flex items-center gap-6 mb-6">
          <label className="relative cursor-pointer">
            {photoPreview ? (
              <img src={photoPreview} alt="User profile" className="w-28 h-28 rounded-full border-4 border-[#3b86d1] object-cover shadow" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-[#3b86d1] flex items-center justify-center text-white text-5xl font-bold border-4 border-[#3b86d1] shadow">
                {getInitials(profile.transportName)}
              </div>
            )}
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 w-full h-full opacity-0" />
          </label>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#23294a]">{profile.transportName || "Your Transport"}</h2>
            <p className="text-sm text-[#6b7280]">{profile.transportArea}</p>
          </div>

          <div className="text-right">
            <div className="text-sm text-[#6b7280]">Email</div>
            <div className="text-[#3b86d1] font-semibold">{profile.email}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderEditableRow({ id: "transportName", label: "Transport Name", name: "transportName", placeholder: "Your transport's name" })}
          {renderEditableRow({ id: "transportArea", label: "Transport Area", name: "transportArea", placeholder: "Area or region served" })}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>{renderEditableRow({ id: "city", label: "City", name: "city", placeholder: "City" })}</div>
            <div>{renderEditableRow({ id: "state", label: "State", name: "state", placeholder: "State" })}</div>
          </div>

          {renderEditableRow({ id: "country", label: "Country", name: "country", placeholder: "Country" })}

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[#23294a] mb-1">Email (readonly)</label>
              <input value={profile.email || ""} disabled className="w-full rounded-md border border-[#e2e8f0] bg-gray-100 px-4 py-3 text-[#a0aec0] cursor-not-allowed" />
            </div>
          </div>

          {/* mobile row */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[#23294a] mb-1">Mobile</label>
              <input
                id="mobile"
                name="mobile"
                ref={refs.mobile}
                value={profile.mobile ?? ""}
                onChange={(e) => setProfile((p) => ({ ...p, mobile: e.target.value }))}
                disabled={!editable.mobile}
                placeholder="10-digit mobile"
                className={`w-full rounded-md border px-4 py-3 ${editable.mobile ? "border-[#3b86d1] bg-white" : "border-[#e2e8f0] bg-gray-50"}`}
              />
            </div>

            <div className="flex-shrink-0 mt-6">
              <button type="button" onClick={() => toggleEdit("mobile")} title={editable.mobile ? "Lock" : "Edit"} className={`w-10 h-10 rounded-full flex items-center justify-center border ${editable.mobile ? "bg-[#3b86d1] text-white border-[#3b86d1]" : "bg-white text-[#3b86d1] border-[#e6eefc]"}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
              </button>
            </div>
          </div>

          {/* Update button */}
          <div className="flex justify-start">
            <button type="submit" disabled={saving} className="py-3 px-6 bg-[#3b86d1] hover:bg-[#1f61a5] text-white font-bold rounded-md focus:outline-none transition disabled:opacity-60">
              {saving ? "Saving..." : "Update Profile"}
            </button>
          </div>

          {/* STACKED Boxes: centered and nicely spaced */}
          <div className="max-w-xl   space-y-4">
            <ChangePasswordBox />
            <DeleteAccountBox />
            <LogoutBox />
          </div>
        </form>
      </div>
    </div>
  );
}
