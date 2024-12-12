import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaTools, FaBars, FaSignOutAlt } from 'react-icons/fa';

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
    { name: 'Activos', path: '/', icon: FaHome },
    { name: 'Mantenimientos', path: '/mantenimientos', icon: FaTools },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Mantenimiento de Activos
        </Link>
        <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
          <FaBars />
        </div>
        <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
          {navItems.map((item) => (
            <li key={item.name} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="nav-icon" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
          {user && (
            <li className="nav-item user-info">
              <span>Bienvenido, {user.name}</span>
            </li>
          )}
          <li className="nav-item">
            <button onClick={handleLogout} className="logout-button">
              <FaSignOutAlt className="nav-icon" />
              <span>Cerrar sesión</span>
            </button>
          </li>
        </ul>
      </div>

      <style jsx>{`
        .navbar {
          background-color: #457b9d;
          height: 80px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 1rem;
          position: sticky;
          top: 0;
          z-index: 999;
        }

        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          height: 80px;
          max-width: 1500px;
          padding: 0 24px;
        }

        .navbar-logo {
          color: #fff;
          justify-self: flex-start;
          cursor: pointer;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          text-decoration: none;
          font-weight: bold;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          list-style: none;
          text-align: center;
          margin: 0;
          padding: 0;
        }

        .nav-item {
          height: 80px;
          display: flex;
          align-items: center;
        }

        .nav-link {
          color: #fff;
          display: flex;
          align-items: center;
          text-decoration: none;
          padding: 0 1rem;
          height: 100%;
        }

        .nav-link:hover {
          background-color: #669bbc;
          transition: all 0.2s ease-out;
        }

        .nav-link.active {
          background-color:rgb(72, 136, 175);
        }

        .nav-icon {
          margin-right: 0.5rem;
        }

        .user-info {
          color: #fff;
          padding: 0 1rem;
        }

        .logout-button {
          display: flex;
          align-items: center;
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          font-size: 1rem;
          padding: 0 1rem;
          height: 100%;
        }

        .logout-button:hover {
          background-color: #c1121f;
        }

        .menu-icon {
          display: none;
        }

        @media screen and (max-width: 960px) {
          .nav-menu {
            display: flex;
            flex-direction: column;
            width: 100%;
            position: absolute;
            top: 80px;
            left: -100%;
            opacity: 1;
            transition: all 0.5s ease;
          }

          .nav-menu.active {
            background: #2563eb;
            left: 0;
            opacity: 1;
            transition: all 0.5s ease;
            z-index: 1;
          }

          .nav-item {
            height: 60px;
          }

          .nav-link {
            text-align: center;
            padding: 2rem;
            width: 100%;
            display: table;
          }

          .menu-icon {
            display: block;
            position: absolute;
            top: 0;
            right: 0;
            transform: translate(-100%, 60%);
            font-size: 1.8rem;
            cursor: pointer;
            color: #fff;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;

