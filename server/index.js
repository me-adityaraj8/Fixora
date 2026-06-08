import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({message: 'Fixora API is running 🚀'});
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});