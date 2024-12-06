import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      
      <nav className="flex space-x-4">
        
        <Link to="/activos" className="hover:underline">
          Activos
        </Link>
        <br />
        <Link to="/mantenimientos" className="hover:underline">
          Mantenimientos
        </Link>
        {user && <span>Bienvenido, {user.name}</span>}
        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Header;
