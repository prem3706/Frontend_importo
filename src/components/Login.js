import React, { useState } from "react";
import logo1 from "../images/logo1.jpg";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";

const Login = ({ showAlert }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (result.success) {
        // localStorage me user_id store kar rahe hain
        if (result.user_id) {
          localStorage.setItem("user_id", result.user_id);
        }
        showAlert("success", "Login successful");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 3000);
      } else {
        setLoading(false);
        showAlert("error", result.message);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      showAlert("error", "Server error");
    }
  };

  return (
    <div className="fixed inset-0 bg-offwhite flex items-center justify-center z-50 px-4">
      {loading && <Loader />}

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8 relative z-10">
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✖
        </button>

        <div className="flex justify-center mb-6">
          <img
            src={logo1}
            alt="Logo"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email:
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
              className="w-full rounded-xl p-3 bg-[#fffef9] shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full rounded-xl p-3 bg-[#fffef9] shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-700 text-white py-3 rounded-xl font-semibold shadow-md hover:bg-green-800 transition"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="text-green-700 font-semibold hover:underline"
          >
            Sign up first
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
