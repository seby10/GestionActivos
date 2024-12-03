const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_jwt_super_seguro';

exports.register = async (req, res) => {
  try {
    const { nombre, email, contrasena } = req.body;
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    User.create({ nombre, email, contrasena: hashedPassword }, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error al registrar usuario" });
      }
      res.status(201).json({ message: "Usuario registrado exitosamente" });
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    User.findByEmail(email, async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const isMatch = await bcrypt.compare(contrasena, user.contrasena);
      if (!isMatch) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, nombre: user.nombre },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.json({ token, user: { id: user.id, email: user.email, nombre: user.nombre } });
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

