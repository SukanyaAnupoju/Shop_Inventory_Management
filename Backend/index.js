import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

import { route } from './Routes/route.js';
import connectDB from './Db/index.js';

const server = express();
const PORT = process.env.PORT || 8000;

// --- CORS ---
server.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// --- Parsers ---
server.use(cookieParser());
server.use(express.json({ limit: '16kb' }));
server.use(express.urlencoded({ extended: true }));

// --- Health ---
server.get('/', (_req, res) => res.send('Hello to backend'));

// --- Routes (mount once) ---
server.use('/api', route);

// --- 404 fallback ---
server.use('*', (_req, res) => {
  res.status(404).send("404 NOT FOUND <a href='./'>Go To Home</a>");
});

// --- Start only after DB connection ---
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log('Server is running at ' + PORT);
    });
  })
  .catch((error) => {
    console.error('Error connecting::index.js', error);
    process.exit(1);
  });
