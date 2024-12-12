import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("tecnico");
  const [error, setError] = useState("");
  //const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (error) {
      timer = setTimeout(() => {
        setError("");
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [error]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          email,
          password,
          type
        }
      );

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        if (response.data.user.type === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/tecnico/dashboard");
        }
      } else {
        setError(response.data.message || "Error. Compruebe sus credenciales.");
        setPassword("");
        //setShake(true);
        //setTimeout(() => setShake(false), 500);
      }
    } catch (err) {
      setError("Error. Compruebe sus credenciales.");
      setPassword("");
      //setShake(true);
      //setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Sistema de Gestión</h2>
        <form onSubmit={handleLogin}>
          {error && <div className="error-message">{error}</div>}
          <div className="input-group">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email">Correo Electrónico</label>
          </div>
          <div className="input-group">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Contraseña</label>
          </div>
          <div className="input-group">
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="tecnico">Técnico</option>
              <option value="admin">Administrador</option>
            </select>
            <label htmlFor="type">Tipo de Usuario</label>
          </div>
          <button type="submit" className="btn-login">
            Iniciar Sesión
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #457b9d, #1d3557);
          font-family: Arial, Helvetica, sans-serif;
        }

        .login-box {
          background: white;
          border-radius: 8px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          padding: 40px;
          width: 100%;
          max-width: 400px;
          transition: all 0.3s ease;
        }

        /*
        .login-box.shake {
          animation: shake 0.4s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        */

        h2 {
          color: #333;
          text-align: center;
          margin-bottom: 30px;
          font-size: 28px;
        }

        .input-group {
          position: relative;
          margin-bottom: 30px;
        }

        input,
        select {
          width: 100%;
          padding: 10px 0;
          font-size: 16px;
          color: #333;
          border: none;
          border-bottom: 1px solid #ddd;
          outline: none;
          background: transparent;
          transition: border-color 0.2s;
        }

        input:focus,
        select:focus {
          border-bottom-color: #6e8efb;
        }

        label {
          position: absolute;
          top: 10px;
          left: 0;
          font-size: 16px;
          color: #999;
          pointer-events: none;
          transition: 0.2s ease all;
        }

        input:focus ~ label,
        input:valid ~ label,
        select:focus ~ label,
        select:valid ~ label {
          top: -20px;
          font-size: 14px;
          color: #6e8efb;
        }

        .btn-login {
          width: 100%;
          padding: 12px;
          background: #6e8efb;
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .btn-login:hover {
          background: #5a7af2;
        }

        .error-message {
          color: #ff3860;
          text-align: center;
          margin-bottom: 20px;
          padding: 10px;
          background-color: #ffeeee;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        @media (max-width: 480px) {
          .login-box {
            padding: 20px;
          }

          h2 {
            font-size: 24px;
          }

          input,
          select,
          .btn-login {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;

