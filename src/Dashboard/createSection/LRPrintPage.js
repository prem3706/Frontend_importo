import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ArrowLeft, Download, Printer } from "lucide-react";

const API_URL = `${process.env.REACT_APP_API_URL}/api/lrs.php`;

export default function LRPrintPage() {
  const { lrId } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [lr, setLr] = useState(null);
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= FETCH LR ================= */
  useEffect(() => {
    const fetchLR = async () => {
      try {
        const user_id = localStorage.getItem("user_id") || "";

        const res = await axios.get(
          `${API_URL}?lr_id=${lrId}&user_id=${user_id}`,
          { withCredentials: true }
        );

        // agar API error format {success:false,...} bhej rahi ho
        if (res.data && res.data.success === false) {
          setError(res.data.message || "LR not found");
          setLoading(false);
          return;
        }

        setLr(res.data);
        setGoods(res.data?.goods || []);
        setLoading(false);
      } catch (err) {
        console.error("LR print load error:", err.response?.status, err.response?.data);
        setError("Failed to load LR details");
        setLoading(false);
      }
    };

    fetchLR();
  }, [lrId]);

  /* ================= PRINT ================= */
  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 150);

    // optional: print ke baad wapas
    setTimeout(() => {
      navigate(-1);
    }, 500);
  };

  /* ================= PDF ================= */
  const handleDownloadPDF = async () => {
    const canvas = await html2canvas(printRef.current, {
      scale: 2,
      backgroundColor: "#fff",
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`LR-${lr?.lr_number || lrId}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#eef2ff] flex items-center justify-center p-4 sm:p-6">
        <div className="text-center text-lg text-[#3b82f6] animate-pulse">Loading LR...</div>
      </div>
    );

  if (error || !lr)
    return (
      <div className="min-h-screen bg-[#eef2ff] flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 max-w-md w-full text-center border border-red-200">
          <div className="text-2xl text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg"
          >
            ← Back to List
          </button>
        </div>
      </div>
    );

  /* ================= DATA SAFE ================= */
  const {
    lr_number,
    date,
    consignor_name,
    consignor_gst,
    consignee_name,
    consignee_gst,
    vehicle_no,
    driver_name,
    source_branch,
    destination_branch,
    total_packages,
    total_value,
  } = lr;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef2ff] to-[#e0e7ff] p-4 sm:p-6 md:py-8">
      {/* Mobile Header */}
      <div className="md:hidden mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-white/50">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 transition-all flex items-center gap-2 text-[#3b82f6] font-medium"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-xl font-bold text-[#1e293b]">LR #{lr_number}</h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-7xl mx-auto">
        {/* ================= LEFT : A4 PREVIEW ================= */}
        <div className="flex-1 flex justify-center overflow-hidden lg:overflow-auto">
          <div
            ref={printRef}
            id="print-area"
            className="bg-white shadow-2xl lg:shadow-lg border-4 lg:border-2 border-[#3b82f6]/30 rounded-3xl lg:rounded-2xl relative print:shadow-none print:border-none print:rounded-none"
            style={{
              width: "794px",
              height: "1123px",
              padding: "48px",
              position: "relative",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* HEADER */}
            <div className="text-center mb-10 lg:mb-8 border-b-2 border-[#e2e8f0] pb-6">
              <h1 className="text-3xl lg:text-2xl font-bold tracking-wider text-[#1e293b] mb-2">
                LORRY RECEIPT
              </h1>
              <div className="flex flex-wrap justify-center gap-6 text-sm lg:text-xs text-[#64748b] font-medium">
                <span>
                  LR No: <span className="font-black text-[#0f172a] text-lg">{lr_number}</span>
                </span>
                <span>
                  Date: <span className="font-black text-[#0f172a] text-lg">{date}</span>
                </span>
              </div>
            </div>

            {/* DETAILS GRID - Responsive */}
            <div className="grid grid-cols-1 lg:flex lg:justify-between text-sm lg:text-xs mb-12 lg:gap-16 text-[#0f172a]">
              <div className="space-y-3 mb-8 lg:mb-0">
                <p className="font-semibold text-[#475569] flex items-center gap-2">
                  📍 <span>Consignor:</span> <span className="font-black text-[#1e293b]">{consignor_name}</span>
                </p>
                <p className="font-semibold text-[#475569] flex items-center gap-2">
                  🆔 <span>GST No:</span> <span className="font-mono">{consignor_gst || "—"}</span>
                </p>
                <p className="font-semibold text-[#475569] flex items-center gap-2">
                  🚛 <span>Vehicle No:</span> <span className="font-black uppercase">{vehicle_no}</span>
                </p>
                <p className="font-semibold text-[#475569] flex items-center gap-2">
                  👤 <span>Driver:</span> <span className="font-medium">{driver_name || "—"}</span>
                </p>
                <p className="font-semibold text-[#475569] flex items-center gap-2">
                  📤 <span>From:</span> <span className="font-black">{source_branch}</span>
                </p>
              </div>

              <div className="space-y-3 text-right lg:text-left">
                <p className="font-semibold text-[#475569] flex items-center justify-end lg:justify-start gap-2">
                  📍 <span>Consignee:</span> <span className="font-black text-[#1e293b]">{consignee_name}</span>
                </p>
                <p className="font-semibold text-[#475569] flex items-center justify-end lg:justify-start gap-2">
                  🆔 <span>GST No:</span> <span className="font-mono">{consignee_gst || "—"}</span>
                </p>
                <p className="font-semibold text-[#475569] flex items-center justify-end lg:justify-start gap-2">
                  📦 <span>Packages:</span> <span className="font-black text-2xl">{total_packages}</span>
                </p>
                <p className="font-semibold text-[#475569] flex items-center justify-end lg:justify-start gap-2">
                  📥 <span>To:</span> <span className="font-black">{destination_branch}</span>
                </p>
              </div>
            </div>

            {/* ================= GOODS TABLE ================= */}
            <div
              style={{
                position: "absolute",
                bottom: "180px",
                left: "48px",
                right: "48px",
              }}
            >
              <div className="mb-4 text-sm lg:text-xs font-bold text-[#64748b] uppercase tracking-wide">
                Goods Details
              </div>

              <div className="bg-[#f8fafc] rounded-2xl p-4 border-2 border-[#e2e8f0] shadow-inner">
                <table className="w-full text-xs lg:text-sm rounded-xl overflow-hidden bg-white">
                  <thead className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white">
                    <tr>
                      <th className="border border-[#cbd5e1]/50 px-3 py-3 text-left font-bold">S.No</th>
                      <th className="border border-[#cbd5e1]/50 px-3 py-3 text-left font-bold">Description</th>
                      <th className="border border-[#cbd5e1]/50 px-3 py-3 text-right font-bold">Qty</th>
                      <th className="border border-[#cbd5e1]/50 px-3 py-3 text-right font-bold">Weight</th>
                      <th className="border border-[#cbd5e1]/50 px-3 py-3 text-right font-bold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goods.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="border border-[#e2e8f0] py-8 text-center text-[#94a3b8] font-medium"
                        >
                          No goods listed
                        </td>
                      </tr>
                    ) : (
                      goods.map((g, i) => (
                        <tr
                          key={i}
                          className="hover:bg-[#f1f5f9] transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <td className="border border-[#e2e8f0] px-3 py-3 font-mono text-[#1e293b] font-bold">
                            {i + 1}
                          </td>
                          <td className="border border-[#e2e8f0] px-3 py-3 text-[#1e293b] font-medium max-w-xs truncate">
                            {g.name}
                          </td>
                          <td className="border border-[#e2e8f0] px-3 py-3 text-right font-bold text-[#059669]">
                            {g.qty}
                          </td>
                          <td className="border border-[#e2e8f0] px-3 py-3 text-right font-mono text-[#64748b]">
                            {g.weight || "—"}
                          </td>
                          <td className="border border-[#e2e8f0] px-3 py-3 text-right font-bold text-[#1e293b]">
                            ₹ {(Number(g.qty || 0) * Number(g.price || 0)).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* TOTAL */}
              <div className="text-right mt-6 pt-4 border-t-2 border-[#3b82f6] bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl shadow-md">
                <div className="text-2xl lg:text-xl font-black text-[#1e293b]">
                  TOTAL AMOUNT :{" "}
                  <span className="text-[#059669] text-3xl lg:text-2xl">
                    ₹ {Number(total_value).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* ================= SIGNATURES ================= */}
            <div
              className="flex justify-between text-xs lg:text-xs text-[#64748b] font-medium"
              style={{
                position: "absolute",
                bottom: "70px",
                left: "48px",
                right: "48px",
              }}
            >
              <div className="text-center w-32">
                <div className="border-t-2 border-[#3b82f6] w-24 mx-auto mb-3 transform scale-110"></div>
                <div>Consignor Signature</div>
              </div>
              <div className="text-center w-32">
                <div className="border-t-2 border-[#3b82f6] w-24 mx-auto mb-3 transform scale-110"></div>
                <div>Consignee Signature</div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANEL - Collapsible Mobile ================= */}
        <div className="lg:w-80 xl:w-96 flex flex-col bg-white/90 backdrop-blur-md border border-[#e2e8f0]/50 rounded-3xl shadow-2xl lg:shadow-md p-0 lg:p-6 print-controls">
          {/* Mobile Header */}
          <div className="lg:hidden p-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#1e293b] mb-2 flex items-center gap-2">
              LR #{lr_number}
            </h2>
            <p className="text-sm text-[#64748b]">Actions</p>
          </div>

          <div className="flex-1 flex flex-col p-4 lg:p-6 gap-4">
            <div className="space-y-2">
              <h3 className="text-base lg:text-sm font-bold text-[#1e293b] flex items-center gap-2">
                Quick Actions
              </h3>
              <p className="text-xs lg:text-xs text-[#94a3b8]">Preview, download, or print</p>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-3 border-2 border-[#cbd5e1] hover:border-[#3b82f6] text-[#334155] hover:text-[#3b82f6] bg-white hover:bg-[#eff6ff] px-4 py-4 rounded-2xl font-semibold transition-all shadow-sm hover:shadow-md text-sm lg:text-base"
            >
              <ArrowLeft size={20} />
              Back to List
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-3 bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] hover:from-[#2563eb] hover:to-[#1e40af] text-white px-4 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all text-sm lg:text-base transform hover:-translate-y-0.5"
            >
              <Download size={20} />
              Download PDF
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-3 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#eab308] hover:to-[#ca8a04] text-white px-4 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all text-sm lg:text-base transform hover:-translate-y-0.5"
            >
              <Printer size={20} />
              Print Receipt
            </button>
          </div>
        </div>
      </div>

      {/* ================= PRINT CSS ================= */}
      <style jsx>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
          }

          body * {
            visibility: hidden !important;
          }

          #print-area,
          #print-area * {
            visibility: visible !important;
          }

          #print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            padding: 15mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            border: none !important;
            transform: none !important;
          }

          .print-controls {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          #print-area {
            width: 100% !important;
            max-width: 794px;
            height: auto !important;
            min-height: 1123px;
          }
          
          #print-area > div:last-child {
            position: static !important;
            margin-top: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
