import { CheckCircle, XCircle } from "lucide-react"; // icons

function Alert({ show, type, message }) {
  return (
    <div
      className={`fixed top-6 right-6 min-w-[320px] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white text-lg font-medium transform transition-all duration-500 ease-in-out z-[9999]
        ${type === "success" ? "bg-[#2763ad]" : "bg-red-600"}
        ${show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}
      `}
    >
      {/* Icon */}
      {type === "success" ? (
        <CheckCircle className="w-6 h-6 text-white" />
      ) : (
        <XCircle className="w-6 h-6 text-white" />
      )}

      {/* Message */}
      <span>{message}</span>
    </div>
  );
}

export default Alert;
