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
        <p>Bienvenido, {user.name}</p>
      </main>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .dashboard-content {
          flex-grow: 1;
          padding: 20px;
          background-color: #f0f4f8;
        }

        h2 {
          color: #333;
          margin-bottom: 20px;
        }

        .table-container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          text-align: left;
          padding: 12px;
          border-bottom: 1px solid #e0e0e0;
        }

        th {
          background-color: #f5f5f5;
          font-weight: bold;
          color: #333;
        }

        tr:last-child td {
          border-bottom: none;
        }

        tr:hover {
          background-color: #f9f9f9;
        }

        @media (max-width: 768px) {
          .dashboard-content {
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

