// SettingsPanel.jsx
export default function SettingsPanel({ show, onClose, navigate }) {
  return (
    <div
      className={`fixed top-0 right-0 z-50 h-full w-96 bg-white shadow-xl transition-transform duration-300 ${
        show ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ borderLeft: "2px solid #3b86d1" }}
    >
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h2 className="text-xl font-bold text-[#3b86d1]">Settings</h2>
        <button
          onClick={onClose}
          className="text-[#3b86d1] hover:text-[#21bf06] transition"
          aria-label="Close Settings"
        >
          <svg width="24" height="24" stroke="currentColor" fill="none" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div className="p-6 flex flex-col gap-6">
        <button
          className="flex items-center gap-2 w-full bg-[#f7f8fa] text-[#232a3d] px-3 py-2 rounded-lg font-semibold hover:bg-[#ebedf1] transition text-base"
          onClick={() => {
            onClose();
            navigate("/brancheslistpage");
          }}
        >
          {/* Plus icon */}
          <svg width="18" height="18" fill="none" stroke="#232a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Branch
        </button>
        <button
          className="flex items-center gap-2 w-full bg-[#f7f8fa] text-[#232a3d] px-3 py-2 rounded-lg font-semibold hover:bg-[#ebedf1] transition text-base"
          onClick={() => {
            onClose();
            navigate("/companylistpage");
          }}
        >
          {/* Plus icon */}
          <svg width="18" height="18" fill="none" stroke="#232a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Company Name
        </button>
        <button
          className="flex items-center gap-2 w-full bg-[#f7f8fa] text-[#232a3d] px-3 py-2 rounded-lg font-semibold hover:bg-[#ebedf1] transition text-base"
          onClick={() => {
            onClose();
            navigate("/vehiclelistpage");
          }}
        >
          {/* Plus icon */}
          <svg width="18" height="18" fill="none" stroke="#232a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Vehicle Details
        </button>
        {/* <button
          className="flex items-center gap-2 w-full bg-[#f7f8fa] text-[#232a3d] px-3 py-2 rounded-lg font-semibold hover:bg-[#ebedf1] transition text-base"
          onClick={() => {
            onClose();
            navigate("/dashboard/addcompany");
          }}
        >
          {/* Plus icon 
          <svg width="18" height="18" fill="none" stroke="#232a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Driver Details
        </button> */}
        <button
          className="flex items-center gap-2 w-full bg-[#f7f8fa] text-[#232a3d] px-3 py-2 rounded-lg font-semibold hover:bg-[#ebedf1] transition text-base"
          onClick={() => {
            onClose();
            navigate("/goodslistpage");
          }}
        >
          {/* Plus icon */}
          <svg width="18" height="18" fill="none" stroke="#232a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Goods Details
        </button>
      </div>
    </div>
  );
}
