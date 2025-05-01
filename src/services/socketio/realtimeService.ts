import { IRealtimeService } from '../interfaces/IRealtimeService';
import { Game, Player } from "@/types/supabase";
import { Socket } from 'socket.io-client';
import { SocketEvents } from '@/server/socket-server';
import { getSocket } from './socketClient';

// Socket.io implementation of realtime service
export class SocketIoRealtimeService implements IRealtimeService {
  private socket: Socket;
  
  constructor() {
    this.socket = getSocket();
  }
  
  // Subscribe to game changes
  subscribeToGame(gameId: string, callback: (game: Game) => void): (() => void) {
    const handler = (game: Game) => {
      callback(game);
    };
    
    // Listen for game updates
    this.socket.on(SocketEvents.GAME_UPDATED, handler);
    
    // Return an unsubscribe function
    return () => {
      this.socket.off(SocketEvents.GAME_UPDATED, handler);
    };
  }
  
  // Subscribe to player changes
  subscribeToPlayers(gameId: string, callback: (player: Player) => void): (() => void) {
    const handler = (player: Player) => {
      callback(player);
    };
    
    // Listen for player joined events
    this.socket.on(SocketEvents.PLAYER_JOINED, handler);
    
    // Return an unsubscribe function
    return () => {
      this.socket.off(SocketEvents.PLAYER_JOINED, handler);
    };
  }
  
  // Unsubscribe from events
  unsubscribe(subscription: (() => void)): void {
    if (typeof subscription === 'function') {
      subscription();
    }
  }
} 