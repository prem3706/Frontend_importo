import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`LR-${lr?.lr_number || lrId}.pdf`);
  };

  if (loading)
    return <div className="p-10 text-center">Loading...</div>;

  if (error || !lr)
    return <div className="p-10 text-center text-red-600">{error}</div>;

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

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-[#eef2ff] flex px-6 py-6 gap-6">
      {/* ================= LEFT : A4 PREVIEW ================= */}
      <div className="flex-1 flex justify-center overflow-auto">
        <div
          ref={printRef}
          id="print-area"
          className="bg-white shadow-lg border border-[#e2e8f0] rounded-2xl"
          style={{
            width: "794px",
            height: "1123px",
            padding: "48px",
            position: "relative",
          }}
        >
          {/* HEADER */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-wide text-[#1e293b]">
              LORRY RECEIPT
            </h1>
            <p className="text-xs mt-3 text-[#64748b]">
              LR No:{" "}
              <span className="font-semibold text-[#0f172a]">
                {lr_number}
              </span>{" "}
              | Date:{" "}
              <span className="font-semibold text-[#0f172a]">
                {date}
              </span>
            </p>
          </div>

          {/* DETAILS (NOT TABLE) */}
          <div className="flex justify-between text-sm mb-12 text-[#0f172a] gap-16">
            <div className="space-y-2">
              <p>
                <span className="font-semibold text-[#475569]">
                  Consignor:
                </span>{" "}
                {consignor_name}
              </p>
              <p>
                <span className="font-semibold text-[#475569]">
                  GST No:
                </span>{" "}
                {consignor_gst || "-"}
              </p>
              <p>
                <span className="font-semibold text-[#475569]">
                  Vehicle No:
                </span>{" "}
                {vehicle_no}
              </p>
              <p>
                <span className="font-semibold text-[#475569]">
                  Driver Name:
                </span>{" "}
                {driver_name || "-"}
              </p>
              <p>
                <span className="font-semibold text-[#475569]">
                  From:
                </span>{" "}
                {source_branch}
              </p>
            </div>

            <div className="space-y-2 text-right">
              <p>
                <span className="font-semibold text-[#475569]">
                  Consignee:
                </span>{" "}
                {consignee_name}
              </p>
              <p>
                <span className="font-semibold text-[#475569]">
                  GST No:
                </span>{" "}
                {consignee_gst || "-"}
              </p>
              <p>
                <span className="font-semibold text-[#475569]">
                  Packages:
                </span>{" "}
                {total_packages}
              </p>
              <p>
                <span className="font-semibold text-[#475569]">
                  To:
                </span>{" "}
                {destination_branch}
              </p>
            </div>
          </div>

          {/* ================= GOODS BOTTOM ================= */}
          <div
            style={{
              position: "absolute",
              bottom: "180px",
              left: "48px",
              right: "48px",
            }}
          >
            <div className="mb-3 text-xs font-semibold text-[#64748b]">
              Goods Details
            </div>

            <table className="w-full border border-[#cbd5f5] text-sm rounded-xl overflow-hidden">
              <thead className="bg-[#eef2ff] text-[#1e293b]">
                <tr>
                  <th className="border border-[#cbd5f5] px-2 py-2 text-left text-xs font-semibold">
                    #
                  </th>
                  <th className="border border-[#cbd5f5] px-2 py-2 text-left text-xs font-semibold">
                    Description
                  </th>
                  <th className="border border-[#cbd5f5] px-2 py-2 text-right text-xs font-semibold">
                    Qty
                  </th>
                  <th className="border border-[#cbd5f5] px-2 py-2 text-right text-xs font-semibold">
                    Weight
                  </th>
                  <th className="border border-[#cbd5f5] px-2 py-2 text-right text-xs font-semibold">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {goods.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="border border-[#e2e8f0] px-3 py-4 text-center text-[#64748b]"
                    >
                      No goods
                    </td>
                  </tr>
                ) : (
                  goods.map((g, i) => (
                    <tr
                      key={i}
                      className="hover:bg-[#f8fafc] transition-colors"
                    >
                      <td className="border border-[#e2e8f0] px-2 py-2 text-xs">
                        {i + 1}
                      </td>
                      <td className="border border-[#e2e8f0] px-2 py-2 text-xs">
                        {g.name}
                      </td>
                      <td className="border border-[#e2e8f0] px-2 py-2 text-xs text-right">
                        {g.qty}
                      </td>
                      <td className="border border-[#e2e8f0] px-2 py-2 text-xs text-right">
                        {g.weight}
                      </td>
                      <td className="border border-[#e2e8f0] px-2 py-2 text-xs text-right">
                        ₹ {(Number(g.qty || 0) * Number(g.price || 0)).toFixed(2)}
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="text-right font-semibold mt-4 text-[#0f172a]">
              Total Amount :{" "}
              <span className="text-[#16a34a]">
                ₹ {Number(total_value).toFixed(2)}
              </span>
            </div>
          </div>

          {/* ================= SIGNATURE ================= */}
          <div
            className="flex justify-between text-xs text-[#64748b]"
            style={{
              position: "absolute",
              bottom: "70px",
              left: "48px",
              right: "48px",
            }}
          >
            <div className="text-center">
              <div className="border-t border-[#cbd5f5] w-44 mb-2 mx-auto"></div>
              Consignor Signature
            </div>
            <div className="text-center">
              <div className="border-t border-[#cbd5f5] w-44 mb-2 mx-auto"></div>
              Consignee Signature
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="w-72 bg-white border border-[#e2e8f0] rounded-2xl p-5 flex flex-col gap-4 shadow-md print-controls">
        <div className="mb-1">
          <h2 className="text-sm font-semibold text-[#0f172a]">
            LR Actions
          </h2>
          <p className="text-xs text-[#94a3b8] mt-1">
            Preview, download PDF, or print this LR.
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="border border-[#cbd5f5] text-[#334155] bg-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-1 hover:bg-[#e0f2fe] transition"
        >
          ← Back to list
        </button>

        <button
          onClick={handleDownloadPDF}
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition"
        >
          Download PDF
        </button>

        <button
          onClick={handlePrint}
          className="bg-[#fde68a] hover:bg-[#facc15] text-[#854d0e] px-4 py-2 rounded-lg font-semibold shadow-sm transition"
        >
          Print
        </button>
      </div>

      {/* ================= PRINT CSS ================= */}
      <style>
        {`
@media print {

  body {
    background: white;
  }

  /* Hide everything */
  body * {
    visibility: hidden;
  }

  /* Show only receipt */
  #print-area,
  #print-area * {
    visibility: visible;
  }

  /* Position receipt correctly */
  #print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 210mm;
    height: 297mm;
    padding: 15mm;
    box-shadow: none !important;
    border-radius: 0 !important;
    border: none !important;
  }

  /* Hide right panel */
  .print-controls {
    display: none !important;
  }
}
`}
      </style>
    </div>
  );
}
