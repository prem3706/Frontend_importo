// Signup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo1 from "../images/logo1.jpg";

const Signup = ({ showAlert }) => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    transportName: "",
    transportArea: "",
    city: "",
    state: "",
    country: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const nextStep = () => { if (step < 2) setStep(step + 1); };
  const prevStep = () => { if (step > 1) setStep(step - 1); };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Email validation
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Password validation
  const validatePassword = (password) => {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    return regex.test(password);
  };

  // Check phone roughly and return boolean
  const isPhoneValid = (phone) => {
    if (!phone) return false;
    const cleaned = phone.replace(/[\s\-()]/g, "");
    const withoutPlus = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
    let digits = withoutPlus;
    if (digits.startsWith("91") && digits.length > 10) digits = digits.slice(2);
    digits = digits.replace(/\D/g, "");
    return /^[6-9]\d{9}$/.test(digits); // Indian 10-digit mobile starting 6-9
  };

  // normalize phone to 10-digit string (no +91). If not valid returns null
  const normalizePhoneTo10 = (phone) => {
    if (!phone) return null;
    const cleaned = phone.replace(/[\s\-()]/g, "");
    const withoutPlus = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
    let digits = withoutPlus;
    if (digits.startsWith("91") && digits.length > 10) digits = digits.slice(2);
    digits = digits.replace(/\D/g, "");
    if (/^[6-9]\d{9}$/.test(digits)) return digits;
    return null;
  };

  const handlePhoneBlur = () => {
    if (formData.phone && !isPhoneValid(formData.phone)) {
      showAlert?.("error", "Invalid phone number. Use a valid 10-digit Indian mobile number.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // normalize phone for backend
    const normalized = normalizePhoneTo10(formData.phone);
    if (!normalized) {
      showAlert?.("error", "Invalid mobile number. Please enter a valid 10-digit Indian number.");
      setStep(1);
      return;
    }

    if (!validateEmail(formData.email)) {
      showAlert?.("error", "Invalid email format");
      setStep(2);
      return;
    }

    if (!validatePassword(formData.password)) {
      showAlert?.("error", "Password must be at least 8 chars, include number & special char");
      setStep(2);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showAlert?.("error", "Passwords do not match!");
      setStep(2);
      return;
    }

    const payload = {
      transportName: formData.transportName,
      transportArea: formData.transportArea,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      mobile: normalized,          // << send as `mobile` (backend expects mobile)
      email: formData.email,
      password: formData.password,
    };

    try {
      setLoading(true);
      const res = await fetch("http://localhost/my_app/Backend/api/users.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        showAlert?.("success", result.message || "Signup successful");
        navigate("/login");
      } else {
        // backend can return custom message
        showAlert?.("error", result.message || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      showAlert?.("error", "Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-offwhite flex items-center justify-center z-50">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 relative">
        <button onClick={() => navigate("/")} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✖</button>

        <div className="flex justify-center mb-6">
          <img src={logo1} alt="Logo" className="w-28 h-28 rounded-full object-cover border-4 border-white" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold text-center text-green-700 mb-4">Transport Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transport Name:</label>
                <input
                  type="text"
                  name="transportName"
                  value={formData.transportName}
                  onChange={handleChange}
                  placeholder="Enter Transport Name"
                  className="w-full rounded-xl p-3 bg-[#fffef9] shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transport Area:</label>
                <input
                  type="text"
                  name="transportArea"
                  value={formData.transportArea}
                  onChange={handleChange}
                  placeholder="Enter Address"
                  className="w-full rounded-xl p-3 bg-[#fffef9] shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City:</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full rounded-xl p-3 bg-[#fffef9] shadow-sm" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State:</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full rounded-xl p-3 bg-[#fffef9] shadow-sm" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country:</label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country" className="w-full rounded-xl p-3 bg-[#fffef9] shadow-sm" required />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={nextStep} className="bg-green-700 text-white px-6 py-2 rounded-xl font-semibold hover:bg-green-800 transition">Next →</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold text-center text-green-700 mb-4">Account Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number:</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handlePhoneBlur}
                  placeholder="e.g. 9876543210 or +91 9876543210"
                  className="w-full rounded-xl p-3 bg-[#fffef9] shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email :</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" className="w-full rounded-xl p-3 bg-[#fffef9] shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password:</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter password" className="w-full rounded-xl p-3 bg-[#fffef9] shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password:</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" className="w-full rounded-xl p-3 bg-[#fffef9] shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600" required />
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={prevStep} className="bg-gray-400 text-white px-6 py-2 rounded-xl font-semibold hover:bg-gray-500 transition">← Previous</button>

                <button type="submit" disabled={loading} className="bg-green-700 text-white px-6 py-2 rounded-xl font-semibold hover:bg-green-800 transition disabled:opacity-60">
                  {loading ? "Signing up..." : "Sign Up"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Signup;
