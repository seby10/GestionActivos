import express from 'express';
import { checkConnection } from './config/database.js';
import createAllTable from './utils/dbUtils.js';
import authRoutes from './routes/authRoutes.js'
import cors from 'cors'

const app = express();
app.use(cors());


app.use(express.json());
app.use('/api/auth', authRoutes);

app.listen(3000, async() => {
  console.log('Server running on port 3000');
  try {
    await checkConnection();
    await createAllTable();
  } catch (error) {
    console.log("Failed to initialize the database",error);
    
  }
});