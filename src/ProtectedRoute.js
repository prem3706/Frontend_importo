import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user_id = localStorage.getItem("user_id");
  const location = useLocation();

  if (!user_id) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
