import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="container mt-5">
      <h2>Dashboard</h2>
      <p>Bienvenido admin</p>
      <p>Email: {user.email}</p>
      <button onClick={handleLogout} className="btn btn-danger">Cerrar Sesión</button>
    </div>
  );
};

export default Dashboard;

