import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaTools,
  FaBars,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const [openDialog, setOpenDialog] = useState(false);

  const handleLogoutConfirm = () => {
    setOpenDialog(false);
    handleLogout();
  };
  const handleLogoutCancel = () => {
    setOpenDialog(false);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          AssetCare
        </Link>
        <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
          <FaBars />
        </div>
        <ul className={isOpen ? "nav-menu active" : "nav-menu"}>
          <li className="user-info">
            <FaUserCircle className="user-icon" />
            <span>{user.name}</span>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setOpenDialog(true)}
              className="logout-button"
            >
              <FaSignOutAlt className="nav-icon" />
              <span>Cerrar sesión</span>
            </button>
          </li>

          <Dialog
            open={openDialog}
            onClose={handleLogoutCancel}
            aria-labelledby="logout-dialog-title"
            aria-describedby="logout-dialog-description"
          >
            <DialogTitle id="logout-dialog-title">Confirmación</DialogTitle>
            <DialogContent>
              <DialogContentText id="logout-dialog-description">
                ¿Estás seguro de que deseas cerrar sesión?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleLogoutCancel} color="primary">
                Cancelar
              </Button>
              <Button onClick={handleLogoutConfirm} color="secondary" autoFocus>
                Confirmar
              </Button>
            </DialogActions>
          </Dialog>
        </ul>
      </div>

      <style jsx="true">{`
        .header {
          background-color: #457b9d;
          height: 80px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1rem;
          position: sticky;
          top: 0;
          z-index: 999;
          padding: 0 24px;
        }

        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          height: 80px;
          
        }

        .header-logo {
          color: #fff;
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
          background-color: rgb(72, 136, 175);
        }

        .nav-icon {
          margin-right: 0.5rem;
        }

        .user-info {
          color: #fff;
          padding: 0 1rem;
          font-size: 16px;
          display: flex;
          align-items: center;
        }

        .user-icon {
          font-size: 1.8rem;
          margin-right: 0.5rem;
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
          margin-right: 0;
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
            background: rgb(72, 136, 175);
            left: 0;
            opacity: 1;
            transition: all 0.5s ease;
            z-index: 1;
          }
          .nav-link:hover {
            background-color: #669bbc;
            transition: all 0.2s ease-out;
          }

          .nav-item {
            height: 60px;
          }

          .nav-link {
            text-align: center;
            padding: 1rem;
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

export default Header;
