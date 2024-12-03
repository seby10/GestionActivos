const db = require('../config/database');

const User = {
  create: (userData, callback) => {
    db.query(
      'INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)',
      [userData.nombre, userData.email, userData.contrasena],
      (error, results) => {
        if (error) return callback(error);
        callback(null, results);
      }
    );
  },
  findByEmail: (email, callback) => {
    db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email],
      (error, results) => {
        if (error) return callback(error);
        callback(null, results[0]);
      }
    );
  }
};

module.exports = User;

