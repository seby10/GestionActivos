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
      <Route path="/public" element={<ActivosTable />} /> {/* Ruta accesible sin autenticación */}
      <Route path="/admin/dashboard" element={
        <>
          <Header />
          <AdminDashboard />
          <ActivosTable />
        </>
      } />
      <Route path="/tecnico/dashboard" element={
        <>
          <Header />
          <TecnicoDashboard />
          <ActivosTable />
        </>
      } />
      <Route path="/" element={<Navigate replace to="/login" />} /> {/* Redirección por defecto a login */}
    </Routes>
  );
};

export default App;
