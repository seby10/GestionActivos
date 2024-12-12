import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import ActivosTable from './ActivosTable';

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
        <div className="header-row">
          <h2>Activos </h2>
          <p className="welcome-message">Bienvenido, {user.name}</p>
        </div>
      </main>
      <ActivosTable />
      <style jsx>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
  
        .dashboard-content {
          padding: 20px;
          padding-bottom: 15px;
          background-color: #f0f4f8;
        }
  
        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
  
        h2 {
          color: #333;
          margin: 0;
        }
  
        .welcome-message {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
          color: #666;
          text-align: right;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

