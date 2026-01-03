import React from "react";

function CustomConfirmDialog({ show, message, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-xl p-8 w-[350px] flex flex-col gap-5">
        <span className="text-xl font-semibold text-gray-800">
          {message || "Are you sure you want to proceed?"}
        </span>
        <div className="flex gap-4 justify-end">
          <button
            className="bg-gray-300 px-4 py-2 rounded-xl font-medium"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded-xl font-medium"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomConfirmDialog;
