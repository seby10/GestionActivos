import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaTools, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { name: 'Activos', path: '/dashboard', icon: FaHome },
    { name: 'Mantenimientos', path: '/mantenimientos', icon: FaTools },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="toggle-button"
        aria-label="Toggle menu"
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      <nav className={`navbar ${isOpen ? 'open' : ''}`}>
        <div className="navbar-header">
          <h1>Mi Aplicación</h1>
        </div>

        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="nav-icon" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {user && (
          <div className="user-info">
            <p>Bienvenido,</p>
            <p className="user-name">{user.name}</p>
          </div>
        )}

        <button onClick={handleLogout} className="logout-button">
          <FaSignOutAlt className="logout-icon" />
          Cerrar sesión
        </button>
      </nav>

      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)}></div>}

      <style jsx>{`
        .toggle-button {
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 1000;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.5rem;
          cursor: pointer;
          display: none;
        }

        .navbar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 250px;
          background-color: #457b9d;
          color: white;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease-in-out;
        }

        .navbar-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .navbar-header h1 {
          font-size: 1.5rem;
          font-weight: bold;
        }

        .nav-list {
          list-style-type: none;
          padding: 0;
          margin: 0;
          flex-grow: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .nav-item:hover, .nav-item.active {
          background-color: #1d4ed8;
        }

        .nav-icon {
          margin-right: 0.5rem;
        }

        .user-info {
          text-align: center;
          margin-bottom: 1rem;
        }

        .user-name {
          font-weight: bold;
        }

        .logout-button {
          width: 100%;
          background-color: #e63946;
          color: white;
          border: none;
          padding: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .logout-button:hover {
          background-color: #b91c1c;
        }

        .logout-icon {
          margin-right: 0.5rem;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: none;
        }

        @media (max-width: 768px) {
          .toggle-button {
            display: block;
          }

          .navbar {
            transform: translateX(-100%);
          }

          .navbar.open {
            transform: translateX(0);
          }

          .overlay {
            display: block;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;

