import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import ActivosTable from './Activos/ActivosTable';
import MantenimientosTable from './MantenimientosTable';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeComponent, setActiveComponent] = useState('Mantenimientos'); 
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

  const handleSelectComponent = (component) => {
    setActiveComponent(component);
  };

  return (
    <div className="dashboard-container">
      <Header user={user} onSelectComponent={handleSelectComponent} activeComponent={activeComponent} />
      <main className="dashboard-content">
        <div className="header-row">
          <h2>{activeComponent}</h2>
          <div className="component-selector">
            <button
              className={`selector-button ${activeComponent === 'Mantenimientos' ? 'active' : ''}`}
              onClick={() => handleSelectComponent('Mantenimientos')}
            >
              Mantenimientos
            </button>
            <button
              className={`selector-button ${activeComponent === 'Activos' ? 'active' : ''}`}
              onClick={() => handleSelectComponent('Activos')}
            >
              Activos
            </button>
          </div>
        </div>
      </main>
      {activeComponent === 'Activos' ? <ActivosTable /> : <MantenimientosTable />}
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
          background-color: #fff; 
          padding: 15px 24px;
          color: #333;
          border-bottom: 2px solid #387190;
        }

        h2 {
          margin: 0;
          font-size: 1.5rem;
        }

        .component-selector {
          display: flex;
        }

        .selector-button {
          background-color: #457b9d;
          color: white;
          border: none;
          padding: 10px 15px;
          cursor: pointer;
          margin-left: 10px;
          transition: background-color 0.3s ease;
        }

        .selector-button.active {
          background-color: rgb(72, 136, 175);
        }

        .selector-button:hover {
          background-color: #669bbc;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;





