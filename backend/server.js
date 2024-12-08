import express from 'express';
import cors from 'cors';
import { checkConnection } from './config/database.js';
import createAllTable from './utils/dbUtils.js';
import authRoutes from './routes/authRoutes.js';
import activosRoutes from './routes/activosRoutes.js';
import proveedorRoutes from './routes/proveedorRoutes.js';

const app = express();
const PORT = 3000;

// Middleware setup
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/activos', activosRoutes);
app.use('/api/proveedores', proveedorRoutes);

// Database initialization
const initializeDatabase = async () => {
  try {
    await checkConnection();
    await createAllTable();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize the database:', error);
  }
};

// Start the server
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
  }
};

startServer();