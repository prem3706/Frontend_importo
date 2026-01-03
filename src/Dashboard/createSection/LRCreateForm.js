// src/LR/LRForm.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ChevronDown, Menu, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const BRANCHES_API = `${process.env.REACT_APP_API_URL}/api/branches.php`;
const COMPANIES_API = `${process.env.REACT_APP_API_URL}/api/companies.php`;
const VEHICLE_API = `${process.env.REACT_APP_API_URL}/api/vehicles.php`;
const GOODS_API = `${process.env.REACT_APP_API_URL}/api/goods.php`;
const CREATE_LR_API = `${process.env.REACT_APP_API_URL}/api/lrs.php`;
const UPDATE_LR_API = `${process.env.REACT_APP_API_URL}/api/lr_update.php`;

/* ============================================
   AutocompleteInput (mobile responsive)
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
    <div ref={containerRef} className="relative flex flex-col w-full">
      {label && (
        <label className="text-sm sm:text-base text-[#1E3A8A] mb-1 sm:mb-2 font-semibold">
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
                     py-3 sm:py-2 outline-none text-sm sm:text-base 
                     focus:border-[#1E3A8A] pr-8 ${className}`}
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
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Toggle list"
        >
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#1E3A8A]" />
        </button>
      </div>

      {open && list && list.length > 0 && (
        <div
          id={`${name || "ac"}-listbox`}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 sm:mt-2 bg-white rounded-lg shadow-xl max-h-48 sm:max-h-56 overflow-y-auto z-50 border border-gray-200"
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
                className={`px-3 sm:px-4 py-2.5 sm:py-3 cursor-pointer text-sm sm:text-base 
                           ${isActive ? "bg-[#E6F0FA]" : "hover:bg-[#EEF3F8]"}`}
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
   LRForm main (fully responsive)
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
    if (!form.consignor) {
      showAlert?.("error", "Consignor name required.");
      return;
    }
    if (!form.consignee) {
      showAlert?.("error", "Consignee name required.");
      return;
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
        resp = await axios.put(UPDATE_LR_API, payload, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
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
    <div className="min-h-screen bg-[#EEF3F8] p-4 sm:p-6 relative">
      {/* Mobile Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed sm:static top-4 left-4 z-50 bg-white shadow-lg rounded-xl p-3 sm:p-2 hover:shadow-xl transition-all"
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E3A8A]" />
      </button>

      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 pt-16 sm:pt-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E3A8A] leading-tight">
          {title}
        </h1>
      </div>

      <form onSubmit={submit} className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Section - Stacked on mobile */}
        <div className="space-y-6 sm:space-y-0 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* LR Number */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base text-[#1E3A8A] font-semibold mb-2">
              LR Number
            </label>
            <input
              type="text"
              value={form.lrNumber}
              readOnly
              className="w-full border-b-2 border-[#BFC9DF] py-3 sm:py-2 bg-transparent text-gray-900 cursor-default text-sm sm:text-base px-2"
              placeholder="Auto generated"
            />
          </div>

          {/* Date */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base text-[#1E3A8A] font-semibold mb-2">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
              min={!isEdit ? getToday() : undefined}
              className="w-full border-b-2 border-[#BFC9DF] py-3 sm:py-2 bg-transparent text-sm sm:text-base px-2"
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

          {/* Driver */}
          <div className="flex flex-col">
            <label className="text-sm sm:text-base text-[#1E3A8A] font-semibold mb-2">
              Driver
            </label>
            <input
              value={form.driver}
              readOnly
              className="w-full border-b-2 border-[#BFC9DF] py-3 sm:py-2 bg-transparent text-gray-800 text-sm sm:text-base px-2"
              placeholder="Select vehicle to auto-fill driver"
            />
          </div>

          {/* Consignor + GST */}
          <div className="space-y-4">
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

            <div>
              <label className="text-xs sm:text-sm text-[#1E3A8A] mb-2 font-semibold block">
                Consignor GST / GSTIN
              </label>
              <input
                value={form.consignor_gst}
                onChange={(e) =>
                  setField("consignor_gst", e.target.value)
                }
                placeholder="Consignor GST number"
                className="w-full border-b-2 border-[#BFC9DF] py-3 sm:py-2 bg-transparent text-sm sm:text-base px-2"
              />
            </div>
          </div>

          {/* Consignee + GST */}
          <div className="space-y-4">
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

            <div>
              <label className="text-xs sm:text-sm text-[#1E3A8A] mb-2 font-semibold block">
                Consignee GST / GSTIN
              </label>
              <input
                value={form.consignee_gst}
                onChange={(e) =>
                  setField("consignee_gst", e.target.value)
                }
                placeholder="Consignee GST number"
                className="w-full border-b-2 border-[#BFC9DF] py-3 sm:py-2 bg-transparent text-sm sm:text-base px-2"
              />
            </div>
          </div>

          {/* Source */}
          <AutocompleteInput
            label="Source Branch"
            name="source"
            value={form.source}
            apiUrl={BRANCHES_API}
            mode="full"
            onChange={(v) => setField("source", v)}
          />

          {/* Destination */}
          <AutocompleteInput
            label="Destination Branch"
            name="destination"
            value={form.destination}
            apiUrl={BRANCHES_API}
            mode="full"
            onChange={(v) => setField("destination", v)}
          />

          {/* Note */}
          <div className="md:col-span-2 bg-blue-50 p-4 rounded-xl">
            <label className="text-sm sm:text-base text-[#1E3A8A] font-semibold mb-2 block">
              Note
            </label>
            <div className="text-xs sm:text-sm text-[#6B7A92]">
              Total Packages will be calculated from Goods → Qty values below.
            </div>
          </div>
        </div>

        {/* Goods Section - Mobile Optimized */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-4 gap-4 sm:gap-0">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E3A8A] flex-1">
              Goods Details
            </h2>
            <button
              type="button"
              onClick={addGood}
              className="px-6 sm:px-4 py-2.5 sm:py-2 bg-[#1E3A8A] text-white rounded-lg font-medium hover:bg-[#163A6D] transition-colors text-sm sm:text-base shadow-md"
            >
              + Add Goods
            </button>
          </div>

          {/* Goods Rows */}
          <div className="space-y-4">
            {goods.map((g, idx) => (
              <div
                key={g.product_id ?? idx}
                className="bg-gray-50 rounded-xl p-4 sm:p-3 border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
                  {/* Goods Name - Full width on mobile */}
                  <div className="flex-1 min-w-0 lg:w-1/2">
                    <label className="text-xs sm:text-sm text-[#6B7A92] mb-1.5 block">
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

                  {/* Numeric Fields - Stacked on mobile, row on desktop */}
                  <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 w-full lg:w-1/2 lg:pl-4">
                    <div className="flex-1">
                      <label className="text-xs sm:text-sm text-[#6B7A92] mb-1.5 block text-right sm:text-left">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={g.qty}
                        onChange={(e) =>
                          updateGood(idx, { qty: e.target.value })
                        }
                        className="w-full text-right lg:text-left border-b border-[#E6EDF7] py-2.5 sm:py-1 bg-transparent outline-none text-sm placeholder-gray-500 px-2"
                        placeholder="0"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="text-xs sm:text-sm text-[#6B7A92] mb-1.5 block text-right sm:text-left">
                        Weight
                      </label>
                      <input
                        value={g.weight}
                        onChange={(e) =>
                          updateGood(idx, { weight: e.target.value })
                        }
                        className="w-full text-right lg:text-left border-b border-[#E6EDF7] py-2.5 sm:py-1 bg-transparent outline-none text-sm placeholder-gray-500 px-2"
                        placeholder="kg"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="text-xs sm:text-sm text-[#6B7A92] mb-1.5 block text-right sm:text-left">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={g.price}
                        onChange={(e) =>
                          updateGood(idx, { price: e.target.value })
                        }
                        className="w-full text-right lg:text-left border-b border-[#E6EDF7] py-2.5 sm:py-1 bg-transparent outline-none text-sm placeholder-gray-500 px-2"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div className="flex justify-end lg:justify-center pt-1 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => removeGood(idx)}
                      className="flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-white border-2 border-red-200 text-red-500 hover:bg-red-50 shadow-sm hover:shadow-md transition-all hover:scale-105"
                      title="Remove item"
                    >
                      <X className="w-4 h-4 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Card */}
          <div className="mt-8 p-5 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 sm:gap-0">
              <div className="flex-1">
                <div className="text-xs sm:text-sm text-[#6B7A92] uppercase tracking-wide">
                  Total Packages (computed)
                </div>
                <div className="text-3xl sm:text-2xl lg:text-3xl font-black text-[#1E3A8A] mt-1">
                  {totalPackages}
                </div>
              </div>

              <div className="flex-1 text-right sm:text-left lg:text-right">
                <div className="text-xs sm:text-sm text-[#6B7A92] uppercase tracking-wide">
                  Total Value
                </div>
                <div className="text-3xl sm:text-2xl lg:text-3xl font-black text-[#1E3A8A] mt-1">
                  ₹ {total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Footer - Fixed on mobile */}
        <div className="fixed bottom-0 left-0 right-0 sm:static bg-white sm:bg-transparent p-4 sm:p-0 shadow-lg sm:shadow-none border-t sm:border-t-0 z-40 sm:z-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-8 pt-4 sm:pt-0">
            <div className="text-xl sm:text-2xl font-black text-[#1E3A8A] text-center sm:text-left">
              ₹ {total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-3 bg-gradient-to-r from-[#1E3A8A] to-[#163A6D] text-white rounded-2xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-md"
            >
              {saving ? "Saving..." : buttonLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
