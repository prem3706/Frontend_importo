// src/Dashboard/dashboardMain/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DLoader from "../dashboardComponent/DLoader";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    this_month_lrs: 0,
    total_branches: 0,
    total_companies: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]); // chart data
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setLoading(true);

        // 1) check session / get user
        const sess = await axios.get(
          "http://localhost/my_app/Backend/api/check_session.php",
          {
            withCredentials: true,
          }
        );

        if (!sess.data || !sess.data.loggedIn) {
          navigate("/login");
          return;
        }

        if (!cancelled) {
          setUser({
            transportName:
              sess.data.transportName ?? sess.data.name ?? "User",
            email: sess.data.email ?? "",
            photo_url: sess.data.photo_url ?? sess.data.photo ?? null,
          });
        }

        // 2) fetch dashboard stats + monthly LR chart data
        try {
          const user_id = sess.data.user_id ?? sess.data.id;
          const st = await axios.get(
            `http://localhost/my_app/Backend/api/dashboard_stats.php?user_id=${user_id}`,
            {
              withCredentials: true,
            }
          );

          if (!cancelled && st.data?.success && st.data.data) {
            const d = st.data.data;

            // basic counters
            setStats((s) => ({
              ...s,
              this_month_lrs: d.this_month_lrs ?? 0,
              total_branches: d.total_branches ?? 0,
              total_companies: d.total_companies ?? 0,
            }));

            // monthly LR chart data: expect d.monthly_lrs = [{month:'Jul', lrs:12}, ...]
            if (Array.isArray(d.monthly_lrs)) {
              setMonthlyData(
                d.monthly_lrs.map((row) => ({
                  month: row.month,
                  lrs: Number(row.lrs) || 0,
                }))
              );
            } else {
              setMonthlyData([]);
            }
          }
        } catch (err) {
          console.warn("Could not fetch dashboard stats:", err?.message || err);
          if (!cancelled) {
            setMonthlyData([]);
          }
        }
      } catch (e) {
        console.error("session check failed", e);
        navigate("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost/my_app/Backend/api/logout.php",
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.warn("logout failed", err);
    } finally {
      localStorage.removeItem("user_id");
      window.location.href = "/";
    }
  };

  if (loading) return <DLoader />;

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f8]">
      <main className="flex-1 container mx-auto flex justify-center items-start pt-4 mt-[100px]">
        <div className="flex w-full max-w-6xl gap-8 px-4">
          {/* LEFT COLUMN */}
          <div className="basis-2/3 flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Create LR Box */}
              <div
                onClick={() => navigate("/lrcreateform")}
                className="relative cursor-pointer bg-white bg-opacity-90 backdrop-blur rounded-3xl shadow-xl hover:shadow-2xl transition p-8 flex flex-col items-start justify-center gap-3 text-xl font-semibold text-[#3b86d1] select-none border-2 border-transparent hover:scale-[1.02]"
                style={{ minHeight: "120px" }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-[#eaf6ff] border border-[#d6eefe]">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#21bf06"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#2763ad]">
                      Create LR
                    </div>
                    <div className="text-sm text-[#6b7280] mt-1">
                      Quickly create a new LR and add goods
                    </div>
                  </div>
                </div>
              </div>

              {/* LR List Box */}
              <div
                onClick={() => navigate("/lrlistpage")}
                className="relative cursor-pointer bg-white bg-opacity-90 backdrop-blur rounded-3xl shadow-xl hover:shadow-2xl transition p-8 flex flex-col items-start justify-center gap-3 text-xl font-semibold text-[#3b86d1] select-none border-2 border-transparent hover:scale-[1.02]"
                style={{ minHeight: "120px" }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-[#fff4e6] border border-[#ffe0b3]">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 6h16" />
                      <path d="M4 12h16" />
                      <path d="M4 18h16" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#2763ad]">
                      LR List
                    </div>
                    <div className="text-sm text-[#6b7280] mt-1">
                      View, edit & manage all LR records
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Two small panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-[#eef6ff]">
                <div className="text-sm text-gray-500">Pending Actions</div>
                <div className="mt-2 text-lg font-semibold text-[#3b86d1]">
                  3 items
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Approve shipments, confirm receipts
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-[#eef6ff]">
                <div className="text-sm text-gray-500">Shortcuts</div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button
                    onClick={() => navigate("/brancheslistpage")}
                    className="px-3 py-1 rounded-md bg-[#eef6ff] text-[#2763ad] border border-[#d6eefe]"
                  >
                    Branches
                  </button>
                  <button
                    onClick={() => navigate("/companylistpage")}
                    className="px-3 py-1 rounded-md bg-[#eef6ff] text-[#2763ad] border border-[#d6eefe]"
                  >
                    Companies
                  </button>
                  <button
                    onClick={() => navigate("/vehiclelistpage")}
                    className="px-3 py-1 rounded-md bg-[#eef6ff] text-[#2763ad] border border-[#d6eefe]"
                  >
                    Vehicles
                  </button>
                </div>
              </div>
            </div>

            {/* Monthly Overview with chart */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-[#eef6ff]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#23294a]">
                  Monthly Overview
                </h3>
                <div className="text-sm text-gray-400">
                  Last 6 months
                </div>
              </div>

              {monthlyData.length === 0 ? (
                <div className="mt-6 text-sm text-gray-400 text-center">
                  No LR data available for the last 6 months.
                </div>
              ) : (
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyData}
                      margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          fontSize: 12,
                          borderRadius: 12,
                        }}
                        cursor={{ stroke: "#bfdbfe", strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="lrs"
                        name="LRs Created"
                        stroke="#3b86d1"
                        strokeWidth={2.5}
                        dot={{
                          r: 4,
                          strokeWidth: 2,
                          fill: "#fff",
                        }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="basis-1/3 flex flex-col gap-6">
            {/* Stats small cards */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-[#eef6ff]">
                <div className="text-sm text-gray-500">This Month LRs</div>
                <div className="mt-1 text-2xl font-bold text-[#21bf06]">
                  {stats.this_month_lrs ?? 0}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-[#eef6ff]">
                <div className="text-sm text-gray-500">Total Branches</div>
                <div className="mt-1 text-2xl font-bold text-[#3b86d1]">
                  {stats.total_branches ?? 0}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-[#eef6ff]">
                <div className="text-sm text-gray-500">Companies</div>
                <div className="mt-1 text-2xl font-bold text-[#2763ad]">
                  {stats.total_companies ?? 0}
                </div>
              </div>
            </div>

            {/* Quick logout/action box */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#eef6ff]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Signed in as</div>
                  <div className="font-semibold text-[#3b86d1]">
                    {user?.transportName}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-[#3b86d1] text-white text-lg font-bold border-2 border-white shadow">
                    {user?.photo_url ? (
                      <img
                        src={user.photo_url}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>
                        {(user?.transportName || "U")
                          .slice(0, 1)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate("/userprofile")}
                  className="flex-1 px-3 py-2 rounded-md bg-[#eef6ff] text-[#2763ad] border border-[#d6eefe]"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md bg-white border border-[#e6eefc] text-[#3b86d1]"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-10 text-center py-10 bg-[#334460] text-[#f0f4f8] rounded-t-2xl">
  <div className="container mx-auto">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 justify-between px-4">

      {/* ================= USER CARD ================= */}
      <div className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-md border border-gray-100">
        <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-[#3b86d1] text-white text-2xl font-bold">
          {user?.photo_url ? (
            <img
              src={user.photo_url}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>
              {(user?.transportName || "U")
                .slice(0, 1)
                .toUpperCase()}
            </span>
          )}
        </div>

        <div className="text-left">
          <div className="text-lg font-bold text-[#3b86d1]">
            {user?.transportName}
          </div>
          <div className="text-sm text-gray-600">{user?.email}</div>
          <div className="mt-1 text-xs text-gray-500">
            Logged in & ready to manage consignments 🚚
          </div>
        </div>
      </div>

      {/* ================= QUICK INFO ================= */}
      <div className="flex gap-4 ml-auto">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 w-[160px] text-center">
          <div className="text-xs text-gray-500">Account Status</div>
          <div className="mt-2 text-sm font-bold text-[#21bf06]">
            ● Active
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 w-[160px] text-center">
          <div className="text-xs text-gray-500">Support</div>
          <div className="mt-2 text-sm font-semibold text-[#3b86d1]">
            support@importo.in
          </div>
        </div>
      </div>
    </div>

    {/* ================= BOTTOM BAR ================= */}
    <div className="mt-8 text-center text-xs text-gray-300">
      © {new Date().getFullYear()} <span className="font-semibold">Importo Logistics</span> —  
      Built for speed, reliability & growth.
    </div>
  </div>
</footer>

    </div>
  );
}
