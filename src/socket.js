// src/socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000'); // backend

export default socket;
