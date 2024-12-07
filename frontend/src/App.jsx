import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import TecnicoDashboard from "./components/TecnicoDashboard";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <Header />
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tecnico/dashboard"
        element={
          <ProtectedRoute>
            <Header />
            <TecnicoDashboard />
          </ProtectedRoute>
        }
      />
      {/* Redirección por defecto a la página de login */}
      <Route path="/" element={<Navigate replace to="/login" />} />
    </Routes>
  );
};

export default App;
