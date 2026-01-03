// src/LR/LRForm.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const BRANCHES_API = `${process.env.REACT_APP_API_URL}/api/branches.php`;
const COMPANIES_API = `${process.env.REACT_APP_API_URL}/api/companies.php`;
const VEHICLE_API = `${process.env.REACT_APP_API_URL}/api/vehicles.php`;
const GOODS_API = `${process.env.REACT_APP_API_URL}/api/goods.php`;
const CREATE_LR_API = `${process.env.REACT_APP_API_URL}/api/lrs.php`;
const UPDATE_LR_API = `${process.env.REACT_APP_API_URL}/api/lr_update.php`;



/* ============================================
   AutocompleteInput (shared)
   ============================================ */
function AutocompleteInput({
  label,
  name,
  value,
  onChange,
  apiUrl,
  mode = "full",
  queryParam = "q",
  placeholder = "Type to search...",
  returnObjectOnSelect = false,
  className = "",
}) {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const getLabel = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    if (item.vehicle_no)
      return item.model ? `${item.vehicle_no} — ${item.model}` : `${item.vehicle_no}`;
    if (item.company_name) return item.company_name;
    if (item.branch_name) return item.branch_name;
    if (item.name) return item.name;
    if (item.label) return item.label;
    try {
      return JSON.stringify(item);
    } catch {
      return String(item);
    }
  };

  // mode === "full" => pehle se pura list
  useEffect(() => {
    if (mode !== "full") return;
    const fetchAll = async () => {
      try {
        const user_id = localStorage.getItem("user_id") || "";
        const sep = apiUrl.includes("?") ? "&" : "?";
        const url = `${apiUrl}${sep}user_id=${user_id}`;
        const resp = await axios.get(url);
        setList(resp.data || []);
      } catch {
        setList([]);
      }
    };
    fetchAll();
  }, [apiUrl, mode]);

  // mode === "search" => debounced search
  useEffect(() => {
    if (mode !== "search") return;
    clearTimeout(debounceRef.current);
    const q = (value || "").trim();
    if (!q) {
      setList([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const user_id = localStorage.getItem("user_id") || "";
        const sep = apiUrl.includes("?") ? "&" : "?";
        const url = `${apiUrl}${sep}${queryParam}=${encodeURIComponent(
          q
        )}&user_id=${user_id}`;
        const resp = await axios.get(url);
        setList(resp.data || []);
        setOpen(true);
      } catch {
        setList([]);
      }
    }, 220);
    return () => clearTimeout(debounceRef.current);
  }, [value, apiUrl, mode, queryParam]);

  // outside click close
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setHighlight(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectItem = (item) => {
    if (returnObjectOnSelect) onChange(item);
    else onChange(getLabel(item));
    setOpen(false);
    setHighlight(-1);
  };

  const toggleDropdown = async (e) => {
    e?.stopPropagation();
    if (open) {
      setOpen(false);
      return;
    }
    if (mode === "full") {
      setOpen(true);
      return;
    }
    try {
      const user_id = localStorage.getItem("user_id") || "";
      const sep = apiUrl.includes("?") ? "&" : "?";
      const url = `${apiUrl}${sep}user_id=${user_id}`;
      const resp = await axios.get(url);
      setList(resp.data || []);
      setOpen(true);
    } catch {
      setList([]);
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative flex flex-col">
      {label && (
        <label className="text-sm text-[#1E3A8A] mb-1 font-semibold">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          name={name}
          value={value || ""}
          placeholder={placeholder}
          className={`w-full bg-transparent border-b-2 border-[#BFC9DF] 
                 focus:border-[#1E3A8A] py-2 outline-none ${className}`}
          onChange={(e) => {
            onChange(e.target.value); // manual typing allowed
            if (mode === "full") {
              const q = e.target.value.trim().toLowerCase();
              if (!q) {
                setOpen(false);
                return;
              }
              const filtered = (list || []).filter((it) =>
                getLabel(it).toLowerCase().includes(q)
              );
              setList(filtered);
              setOpen(true);
            }
          }}
          onKeyDown={(e) => {
            const current = list || [];
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlight((h) => Math.min(h + 1, current.length - 1));
              setOpen(true);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === "Enter") {
              if (highlight >= 0 && current[highlight]) {
                e.preventDefault();
                selectItem(current[highlight]);
              }
            } else if (e.key === "Escape") {
              setOpen(false);
              setHighlight(-1);
            }
          }}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open ? "true" : "false"}
          aria-controls={open ? `${name || "ac"}-listbox` : undefined}
          autoComplete="off"
        />

        <button
          type="button"
          onClick={toggleDropdown}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1"
          aria-label="Toggle list"
        >
          <ChevronDown className="text-[#1E3A8A]" />
        </button>
      </div>

      {open && list && list.length > 0 && (
        <div
          id={`${name || "ac"}-listbox`}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg max-h-56 overflow-y-auto z-50"
        >
          {list.map((it, idx) => {
            const isActive = highlight === idx;
            return (
              <div
                key={idx}
                role="option"
                aria-selected={isActive}
                onMouseEnter={() => setHighlight(idx)}
                onMouseLeave={() => setHighlight(-1)}
                onClick={() => selectItem(it)}
                className={`px-4 py-3 cursor-pointer ${isActive ? "bg-[#E6F0FA]" : "hover:bg-[#EEF3F8]"
                  }`}
              >
                {getLabel(it)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =============================
   LRForm main (create + update)
   ============================= */
export default function LRForm({ showAlert }) {
  const navigate = useNavigate();
  const { lrId } = useParams(); // /lrform  OR /lrform/:lrId
  const isEdit = Boolean(lrId);

  const getToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [form, setForm] = useState({
    consignor: "",
    consignor_id: null,
    consignor_gst: "",
    consignee: "",
    consignee_id: null,
    consignee_gst: "",
    lrNumber: "",
    date: getToday(),
    vehicle: "",
    vehicle_id: null,
    driver: "",
    driver_id: null,
    source: "",
    destination: "",
    packages: "",
  });

  const [goods, setGoods] = useState([
    { name: "", product_id: null, qty: "", weight: "", price: "" },
  ]);
  const [total, setTotal] = useState(0);
  const [totalPackages, setTotalPackages] = useState(0);
  const [saving, setSaving] = useState(false);

  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  /* Auto LR number (only create) */
  const fetchNextLRNumber = useCallback(async () => {
    try {
      const user_id = localStorage.getItem("user_id") || "";
      const resp = await axios.get(
        `${CREATE_LR_API}?action=next_lr_number&user_id=${user_id}`
      );
      if (resp.data?.success && resp.data?.next_lr_number) {
        setField("lrNumber", String(resp.data.next_lr_number));
      }
    } catch (err) {
      console.error("Failed to fetch next LR number", err);
      showAlert?.("error", "Failed to auto generate LR number");
    }
  }, [setField, showAlert]);

  /* Load for edit OR set LR number for create */
  useEffect(() => {
    const load = async () => {
      const user_id = localStorage.getItem("user_id") || "";

      if (!isEdit) {
        await fetchNextLRNumber();
        return;
      }

      try {
        const resp = await axios.get(
          `${CREATE_LR_API}?lr_id=${lrId}&user_id=${user_id}`,
          { withCredentials: true }
        );

        if (resp.data && resp.data.success === false) {
          showAlert?.("error", resp.data.message || "LR not found");
          return;
        }

        const lr = resp.data;

        setForm({
          consignor: lr.consignor_name || "",
          consignor_id: lr.consignor_id ?? null,
          consignor_gst: lr.consignor_gst || "",
          consignee: lr.consignee_name || "",
          consignee_id: lr.consignee_id ?? null,
          consignee_gst: lr.consignee_gst || "",
          lrNumber:
            lr.lr_number || lr.lrNumber || lr.lr_num || String(lr.lr_id) || "",
          date: lr.date || getToday(),
          vehicle: lr.vehicle_no || "",
          vehicle_id: lr.vehicle_id ?? null,
          driver: lr.driver_name || "",
          driver_id: lr.driver_id ?? null,
          source: lr.source_branch || "",
          destination: lr.destination_branch || "",
          packages: lr.total_packages || "",
        });

        setGoods(
          Array.isArray(lr.goods) && lr.goods.length
            ? lr.goods.map((g) => ({
              name: g.name || g.goods_name || "",
              product_id: g.goods_id || g.product_id || null,
              qty: g.qty || "",
              weight: g.weight || "",
              price: g.price || "",
            }))
            : [{ name: "", product_id: null, qty: "", weight: "", price: "" }]
        );
      } catch (e) {
        console.error("LR load error:", e.response?.status, e.response?.data);
        showAlert?.("error", "Failed to load LR details");
      }
    };

    load();
  }, [isEdit, lrId, showAlert, fetchNextLRNumber]);

  /* totals */
  useEffect(() => {
    setTotal(
      goods.reduce(
        (sum, g) => sum + Number(g.qty || 0) * Number(g.price || 0),
        0
      )
    );
    setTotalPackages(
      goods.reduce((sum, g) => sum + (Number(g.qty) || 0), 0)
    );
  }, [goods]);

  const updateGood = (idx, payload) => {
    setGoods((old) => {
      const dup = [...old];
      dup[idx] = { ...dup[idx], ...payload };
      return dup;
    });
  };

  const addGood = () =>
    setGoods((old) => [
      ...old,
      { name: "", product_id: null, qty: "", weight: "", price: "" },
    ]);
  const removeGood = (idx) =>
    setGoods((old) => old.filter((_, i) => i !== idx));

  /* Submit = CREATE or UPDATE */
  const submit = async (e) => {
    e.preventDefault();
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
      showAlert?.("error", "User not logged in (user_id missing).");
      return;
    }

    const hasQty = goods.some((g) => Number(g.qty) > 0);
    if (!hasQty) {
      const proceed = window.confirm(
        "No goods have qty > 0. Continue anyway?"
      );
      if (!proceed) return;
    }

    // consignor / consignee validation
    // NEW: naam required, ID optional (manual + list dono allowed)
    if (!form.consignor) {
      showAlert?.("error", "Consignor name required.");
      return;
    }
    if (!form.consignee) {
      showAlert?.("error", "Consignee name required.");
      return;
    }

    // Agar ID missing hai to sirf info alert (manual entry samjho)
    if (!form.consignor_id) {
      console.warn("Consignor ID missing, manual consignor used");
    }
    if (!form.consignee_id) {
      console.warn("Consignee ID missing, manual consignee used");
    }


    const payload = {
      lr_number: form.lrNumber,
      date: form.date,
      consignor_id: form.consignor_id,
      consignor: form.consignor,
      consignor_gst: form.consignor_gst,
      consignee_id: form.consignee_id,
      consignee: form.consignee,
      consignee_gst: form.consignee_gst,
      vehicle_id: form.vehicle_id,
      vehicle: form.vehicle,
      driver_id: form.driver_id,
      driver: form.driver,
      source: form.source,
      destination: form.destination,
      packages: totalPackages,
      goods: goods.map((g) => ({
        goods_id: g.product_id ?? null,
        name: g.name,
        qty: Number(g.qty) || 0,
        weight: g.weight ?? null,
        price: Number(g.price) || 0,
      })),
      total,
      user_id,
    };

    if (isEdit) {
      payload.lr_id = lrId;
    }

    try {
      setSaving(true);
      let resp;
      if (isEdit) {
        // ✅ UPDATE alag file pe
        resp = await axios.put(UPDATE_LR_API, payload, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        // ✅ CREATE purane lrs.php pe hi
        resp = await axios.post(CREATE_LR_API, payload, {
          headers: { "Content-Type": "application/json" },
        });
      }


      console.log("LR FORM resp:", resp.data);

      if (resp.data && resp.data.success) {
        showAlert?.(
          "success",
          isEdit ? "LR updated successfully" : "LR created successfully"
        );
        navigate("/lrlistpage");
      } else {
        showAlert?.(
          "error",
          (isEdit ? "Update failed: " : "Create failed: ") +
          (resp.data?.message || "unknown")
        );
        console.error("LR form failed response:", resp.data);
      }
    } catch (err) {
      console.error("LR form error:", err, err.response?.data);
      const serverMsg =
        err.response?.data?.message ||
        err.message ||
        "Server error while saving LR";
      showAlert?.("error", serverMsg);
    } finally {
      setSaving(false);
    }
  };

  const title = isEdit ? "Update LR" : "Create LR";
  const buttonLabel = isEdit ? "Update LR" : "Create LR";

  return (
    <div className="min-h-screen bg-[#EEF3F8] p-6">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-5 left-5 bg-white shadow rounded-full p-2"
      >
        <ArrowLeft className="text-blue-700" />
      </button>

      <h1 className="text-3xl text-center font-bold text-[#1E3A8A] mb-8">
        {title}
      </h1>

      <form onSubmit={submit} className="max-w-5xl mx-auto space-y-8">
        {/* Header grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LR Number – read-only */}
          <div className="flex flex-col">
            <label className="text-[#1E3A8A] font-semibold mb-1">
              LR Number
            </label>
            <input
              type="text"
              value={form.lrNumber}
              readOnly
              className="w-full border-b-2 border-[#BFC9DF] py-2 bg-transparent text-gray-900 cursor-default"
              placeholder="Auto generated"
            />
          </div>

          {/* Date (manual) */}
          <div className="flex flex-col">
            <label className="text-[#1E3A8A] font-semibold mb-1">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
              min={!isEdit ? getToday() : undefined}
              className="w-full border-b-2 border-[#BFC9DF] py-2 bg-transparent"
            />
          </div>

          {/* Vehicle */}
          <AutocompleteInput
            label="Vehicle"
            name="vehicle"
            value={form.vehicle}
            apiUrl={VEHICLE_API}
            mode="search"
            returnObjectOnSelect={true}
            onChange={(objOrString) => {
              if (objOrString && typeof objOrString === "object") {
                const vehicleNo =
                  objOrString.vehicle_no ?? objOrString.name ?? "";
                const vehicleId =
                  objOrString.vehicle_id ?? objOrString.id ?? null;
                setField("vehicle", vehicleNo);
                setField("vehicle_id", vehicleId);

                const driverName = objOrString.driver_name ?? "";
                const driverMobile =
                  objOrString.driver_mobile ?? objOrString.mobile ?? "";
                const driverLabel = driverMobile
                  ? `${driverName} (${driverMobile})`
                  : driverName;

                setField("driver", driverLabel);
                setField("driver_id", objOrString.driver_id ?? null);
              } else {
                setField("vehicle", objOrString);
                setField("vehicle_id", null);
                setField("driver", "");
                setField("driver_id", null);
              }
            }}
            placeholder="Type or select vehicle..."
          />

          {/* Driver display (read only text) */}
          <div className="flex flex-col">
            <label className="text-[#1E3A8A] font-semibold mb-1">
              Driver
            </label>
            <input
              value={form.driver}
              readOnly
              className="w-full border-b-2 border-[#BFC9DF] py-2 bg-transparent text-gray-800"
              placeholder="Select vehicle to auto-fill driver"
            />
          </div>

          {/* Consignor */}
          <div>
            <AutocompleteInput
              label="Consignor"
              name="consignor"
              value={form.consignor}
              apiUrl={COMPANIES_API}
              mode="search"
              returnObjectOnSelect={true}
              onChange={(objOrString) => {
                if (objOrString && typeof objOrString === "object") {
                  setField("consignor", objOrString.company_name ?? "");
                  setField("consignor_id", objOrString.company_id ?? null);
                  setField(
                    "consignor_gst",
                    objOrString.gst_no ??
                    objOrString.gstin ??
                    objOrString.gst ??
                    ""
                  );
                } else {
                  setField("consignor", objOrString);
                  setField("consignor_id", null);
                  setField("consignor_gst", "");
                }
              }}
              placeholder="Type consignor..."
            />

            <div className="mt-7">
              <label className="text-sm text-[#1E3A8A] mb-1 font-semibold">
                Consignor GST / GSTIN
              </label>
              <input
                value={form.consignor_gst}
                onChange={(e) =>
                  setField("consignor_gst", e.target.value)
                }
                placeholder="Consignor GST number"
                className="w-full border-b-2 border-[#BFC9DF] py-2 bg-transparent"
              />
            </div>
          </div>

          {/* Consignee */}
          <div>
            <AutocompleteInput
              label="Consignee"
              name="consignee"
              value={form.consignee}
              apiUrl={COMPANIES_API}
              mode="search"
              returnObjectOnSelect={true}
              onChange={(objOrString) => {
                if (objOrString && typeof objOrString === "object") {
                  setField("consignee", objOrString.company_name ?? "");
                  setField("consignee_id", objOrString.company_id ?? null);
                  setField(
                    "consignee_gst",
                    objOrString.gst_no ??
                    objOrString.gstin ??
                    objOrString.gst ??
                    ""
                  );
                } else {
                  setField("consignee", objOrString);
                  setField("consignee_id", null);
                  setField("consignee_gst", "");
                }
              }}
              placeholder="Type consignee..."
            />

            <div className="mt-7">
              <label className="text-sm text-[#1E3A8A] mb-1 font-semibold">
                Consignee GST / GSTIN
              </label>
              <input
                value={form.consignee_gst}
                onChange={(e) =>
                  setField("consignee_gst", e.target.value)
                }
                placeholder="Consignee GST number"
                className="w-full border-b-2 border-[#BFC9DF] py-2 bg-transparent"
              />
            </div>
          </div>

          {/* Source / Destination */}
          <AutocompleteInput
            label="Source Branch"
            name="source"
            value={form.source}
            apiUrl={BRANCHES_API}
            mode="full"
            onChange={(v) => setField("source", v)}
          />
          <AutocompleteInput
            label="Destination Branch"
            name="destination"
            value={form.destination}
            apiUrl={BRANCHES_API}
            mode="full"
            onChange={(v) => setField("destination", v)}
          />

          {/* Note */}
          <div className="md:col-span-2">
            <label className="text-[#1E3A8A] font-semibold mb-1">
              Note
            </label>
            <div className="text-sm text-[#6B7A92]">
              Total Packages will be calculated from Goods → Qty values
              below.
            </div>
          </div>
        </div>

        {/* Goods */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#1E3A8A]">
              Goods Details
            </h2>
            <button
              type="button"
              onClick={addGood}
              className="px-4 py-2 bg-[#1E3A8A] text-white rounded"
            >
              + Add
            </button>
          </div>

          {goods.map((g, idx) => (
            <div
              key={g.product_id ?? idx}
              className="flex items-center gap-4 bg-white rounded-xl p-3 shadow mb-3"
              aria-label={`goods-row-${idx}`}
            >
              <div className="flex-1 min-w-0">
                <label className="text-xs text-[#6B7A92] mb-1 block">
                  Goods
                </label>
                <AutocompleteInput
                  label={null}
                  name={`goods-${idx}`}
                  value={g.name}
                  apiUrl={GOODS_API}
                  mode="search"
                  returnObjectOnSelect={true}
                  onChange={(objOrString) => {
                    if (objOrString && typeof objOrString === "object") {
                      updateGood(idx, {
                        name:
                          objOrString.name ??
                          objOrString.product_name ??
                          "",
                        product_id:
                          objOrString.goods_id ??
                          objOrString.id ??
                          objOrString.product_id ??
                          null,
                      });
                    } else {
                      updateGood(idx, {
                        name: objOrString,
                        product_id: null,
                      });
                    }
                  }}
                  placeholder="Type or select goods..."
                />
              </div>

              <div className="w-20 min-w-[80px]">
                <label className="text-xs text-[#6B7A92] mb-1 block text-right">
                  Qty
                </label>
                <input
                  type="number"
                  min="0"
                  value={g.qty}
                  onChange={(e) =>
                    updateGood(idx, { qty: e.target.value })
                  }
                  className="w-full text-right border-b border-[#E6EDF7] py-1 bg-transparent outline-none"
                  placeholder="0"
                />
              </div>

              <div className="w-28 min-w-[90px]">
                <label className="text-xs text-[#6B7A92] mb-1 block text-right">
                  Weight
                </label>
                <input
                  value={g.weight}
                  onChange={(e) =>
                    updateGood(idx, { weight: e.target.value })
                  }
                  className="w-full text-right border-b border-[#E6EDF7] py-1 bg-transparent outline-none"
                  placeholder="kg"
                />
              </div>

              <div className="w-28 min-w-[90px]">
                <label className="text-xs text-[#6B7A92] mb-1 block text-right">
                  Price
                </label>
                <input
                  type="number"
                  min="0"
                  value={g.price}
                  onChange={(e) =>
                    updateGood(idx, { price: e.target.value })
                  }
                  className="w-full text-right border-b border-[#E6EDF7] py-1 bg-transparent outline-none"
                  placeholder="₹"
                />
              </div>

              <div className="pl-2">
                <button
                  type="button"
                  onClick={() => removeGood(idx)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-red-200 text-red-500 hover:bg-red-50 shadow-sm"
                  title="Remove item"
                >
                  ×
                </button>
              </div>
            </div>
          ))}

          <div className="bg-white rounded-xl p-4 shadow mb-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-[#6B7A92]">
                Total Packages (computed)
              </div>
              <div className="text-2xl font-bold text-[#1E3A8A]">
                {totalPackages}
              </div>
            </div>

            <div>
              <div className="text-sm text-[#6B7A92]">Total Value</div>
              <div className="text-2xl font-bold text-[#1E3A8A]">
                ₹ {total.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-[#1E3A8A]">
            ₹ {total.toFixed(2)}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-10 py-3 bg-[#1E3A8A] text-white rounded-full disabled:opacity-60"
          >
            {saving ? "Saving..." : buttonLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
