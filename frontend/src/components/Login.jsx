import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';
import './login.css'; // Archivo CSS personalizado

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState('tecnico');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password,
        type,
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        if (response.data.user.type === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/tecnico/dashboard');
        }
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Login failed. Check your credentials.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Sistema de Gestión</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-4">
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Tipo de Usuario</Form.Label>
            <Form.Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="tecnico">Técnico</option>
              <option value="admin">Administrador</option>
            </Form.Select>
          </Form.Group>

          <div className="d-grid gap-2">
            <Button className="btn-login" type="submit">
              Iniciar Sesión
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
