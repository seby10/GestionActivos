import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import TecnicoDashboard from "./components/TecnicoDashboard";
import ActivosTable from "./components/ActivosTable";
import Header from "./components/Header";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tecnico/dashboard"
        element={
          <ProtectedRoute>
            <TecnicoDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate replace to="/login" />} />
    </Routes>
  );
};

export default App;
