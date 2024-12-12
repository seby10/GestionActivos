import React from "react";

const Mantenimientos = () => {
  return (
    
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        backgroundColor: "#f8f9fa",
        textAlign: "center",
        color: "#495057",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚧 Mantenimiento 🚧</h1>
      <p style={{ fontSize: "1.25rem", marginBottom: "2rem" }}>
        Esta página está en mantenimiento. 
        Por favor, vuelve más tarde.
      </p>
      <button
        style={{
          padding: "10px 20px",
          fontSize: "1rem",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={() => window.history.back()}
      >
        Volver
      </button>
    </div>
  );
};

export default Mantenimientos;
