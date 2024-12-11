import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const userType = user.type;
  if (userType === 'admin' && window.location.pathname !== '/admin') {
    return <Navigate to="/admin" replace />;
  } else if (userType === 'tecnico' && window.location.pathname !== '/tecnico') {
    return <Navigate to="/tecnico" replace />;
  }

  return children;
};

export default ProtectedRoute;
