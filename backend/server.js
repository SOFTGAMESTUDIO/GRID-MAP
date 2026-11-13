import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());

// Attach io to express app for access in controllers
app.set('io', io);

// Mount API routes
app.use('/api', apiRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'NearKart Hyperlocal Engine',
    timestamp: new Date().toISOString(),
  });
});

// Socket.IO Real-time Connection Handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to NearKart Realtime Engine: ${socket.id}`);

  // Customer / Driver joins specific order tracking room
  socket.on('join_order_room', (orderId) => {
    socket.join(`order:${orderId}`);
    console.log(`📡 Socket ${socket.id} joined tracking room: order:${orderId}`);
  });

  socket.on('leave_order_room', (orderId) => {
    socket.leave(`order:${orderId}`);
    console.log(`📡 Socket ${socket.id} left room: order:${orderId}`);
  });

  // Driver GPS location broadcast
  socket.on('driver_gps_ping', (data) => {
    io.emit('driver_location', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 50000;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n======================================================`);
  console.log(`⚡ NearKart Hyperlocal & Delivery Engine Running`);
  console.log(`🚀 Port: ${PORT} | Mode: Development / Production Ready`);
  console.log(`📍 Active Zone: Ludhiana, Punjab (8 H3 Grid Cells)`);
  console.log(`======================================================\n`);
});
