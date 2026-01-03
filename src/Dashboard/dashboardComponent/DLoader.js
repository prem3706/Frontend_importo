import { DotLoader } from "react-spinners";

export default function DLoader({ className = "" }) {
  return (
    <div
      className={`
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-white/60 backdrop-blur-md
        ${className}
      `}
      style={{
        top: "90px",               // keep space for header
        height: "calc(100vh - 90px)",
      }}
    >
      <DotLoader color="#3b86d1" size={80} />
    </div>
  );
}
