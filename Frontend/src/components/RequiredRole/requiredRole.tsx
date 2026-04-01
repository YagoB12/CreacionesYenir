import React from "react";
import { Navigate } from "react-router-dom";

interface RequireRoleProps {
  roleRequired: string;
  children: React.ReactNode; 
}

const RequireRole: React.FC<RequireRoleProps> = ({ roleRequired, children }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (user.role !== roleRequired) {
    return <Navigate to="/no-access" replace />;
  }

  return <>{children}</>;
};

export default RequireRole;
