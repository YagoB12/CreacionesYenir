import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';

const NoAccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>⚠️ Acceso Denegado</h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "30px" }}>
        Lo sentimos, no tienes permisos para ver esta página.
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "#1d4ed8",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer"
        }}
      >
        <ArrowLeftOnRectangleIcon className="menu-icon" style={{ width: "20px" }} />
        Volver al inicio
      </button>
    </div>
  );
};

export default NoAccess;
