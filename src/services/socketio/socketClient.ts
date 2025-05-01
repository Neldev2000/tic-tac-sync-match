import { Socket, io } from 'socket.io-client';
import { socketIoUrl } from '@/config/environment';

// Socket.io client instance
let socket: Socket | null = null;

// Initialize socket connection
export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(socketIoUrl);
    
    socket.on('connect', () => {
      console.log('Connected to Socket.io server');
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.io server');
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
    });
  }
  
  return socket;
}; 