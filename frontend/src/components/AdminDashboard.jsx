import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

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

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <Header />
      <main className="dashboard-content">
        <h2>Dashboard</h2>
        
        
      </main>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
        }

        .dashboard-content {
          flex-grow: 1;
          padding: 20px;
          margin-left: 250px; /* Ajusta este valor al ancho de tu Navbar */
          transition: margin-left 0.3s ease-in-out;
        }

        h2 {
          color: #333;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

