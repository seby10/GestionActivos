import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import ActivosTable from './Activos/ActivosTable';
import MantenimientosTable from './MantenimientosTable';

// Importamos los iconos de Material-UI
import { WorkOutline as MantenimientosIcon, Memory as ActivosIcon } from '@mui/icons-material';

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
              <MantenimientosIcon className="selector-icon" />
              <span className="button-text">Mantenimientos</span>
            </button>
            <button
              className={`selector-button ${activeComponent === 'Activos' ? 'active' : ''}`}
              onClick={() => handleSelectComponent('Activos')}
            >
              <ActivosIcon className="selector-icon" />
              <span className="button-text">Activos</span>
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
          flex-grow: 1;
        }

        .component-selector {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .selector-button {
          background-color: #457b9d;
          color: white;
          border: none;
          padding: 12px 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: background-color 0.3s ease, transform 0.3s ease;
          font-size: 1rem;
          border-radius: 8px;
          box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        }

        .selector-button.active {
          background-color: rgb(72, 136, 175);
        }

        .selector-button:hover {
          background-color: #669bbc;
          transform: translateY(-3px);  /* Añadimos un pequeño "elevado" al hacer hover */
        }

        .selector-icon {
          margin-right: 10px;
          font-size: 1.5rem; /* Tamaño del icono */
        }

        .button-text {
          display: inline-block;
          transition: opacity 0.3s ease;  /* Animación de desvanecimiento */
        }

        /* Estilo responsivo */
        @media (max-width: 768px) {
          .header-row {
            flex-direction: column;
            text-align: center;
          }

          h2 {
            font-size: 1.2rem;
            margin-bottom: 10px;
          }

          .component-selector {
            justify-content: center;
            gap: 15px;
          }

          /* Escondemos el texto en pantallas pequeñas, pero mantenemos los iconos */
          .button-text {
            display: none;
          }

          .selector-button {
            padding: 10px 15px;
            font-size: 1.2rem;  /* Aumentamos el tamaño de los iconos y botones */
            box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.15);
          }

          .selector-icon {
            font-size: 2rem; /* Iconos más grandes en pantallas más pequeñas */
          }
        }

        @media (max-width: 480px) {
          h2 {
            font-size: 1rem;
          }

          .selector-button {
            font-size: 1rem;
            padding: 8px 12px;
          }

          .selector-icon {
            font-size: 2.2rem; /* Iconos más grandes en pantallas muy pequeñas */
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
