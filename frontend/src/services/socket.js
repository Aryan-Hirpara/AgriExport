import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : null) ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5001'
    : 'https://agriexport-jpe7.onrender.com');

let socket = null;

export function getSocket() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket connected to server');
    });

    socket.on('connect_error', (err) => {
      console.warn('⚡ Socket connection error:', err.message);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
