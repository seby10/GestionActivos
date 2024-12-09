import { pool } from "../config/database.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const loginUser = async (email, password, type) => {
    try {
        const [rows] = await pool.query('SELECT * FROM USUARIOS WHERE COR_USU = ?', [email]);        
        if (rows.length === 0) {
            return { success: false, message: 'User not found' };
        }
        
        console.log("Email recibido:", email);
        console.log("Tipo recibido:", type);
        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.CON_USU);
        console.log("¿Contraseña coincide?", passwordMatch);

        if (!passwordMatch) {
            return { success: false, message: 'Incorrect password' };
        }

        const token = jwt.sign(
            { id: user.ID_USU, email: user.COR_USU },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        console.log("Generated token:", token);

        
        return {
          success: true, 
          message: 'Login successful', 
          token, 
          user: { id: user.ID_USU, email: user.COR_USU, name: user.NOM_USU, type: user.TIP_USU } 
      };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: 'Login failed. Please try again later.' };
    }
};

export const getUserFromToken = async (token) => {
    try {
        const trimmedToken = token.trim();
        console.log("Received token:", trimmedToken);

        const decoded = jwt.verify(trimmedToken, JWT_SECRET);
        console.log("Decoded token:", decoded);

        const [rows] = await pool.query('SELECT ID_USU, NOM_USU, COR_USU, TIP_USU FROM USUARIOS WHERE ID_USU = ?', [decoded.id]);

        if (rows.length === 0) {
            return { success: false, message: 'User not found' };
        }

        const user = rows[0];
        return { success: true, user };
    } catch (error) {
        console.error("Token verification error:", error);
        return { success: false, message: 'Invalid or expired token' };
    }
};