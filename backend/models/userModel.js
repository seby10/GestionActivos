import { query } from '../config/database';

const User = {
  create: (userData, callback) => {
    query(
      'INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)',
      [userData.nombre, userData.email, userData.contrasena],
      (error, results) => {
        if (error) return callback(error);
        callback(null, results);
      }
    );
  },
  findByEmail: (email, callback) => {
    query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email],
      (error, results) => {
        if (error) return callback(error);
        callback(null, results[0]);
      }
    );
  }
};

export default User;

