import { useLocalSocket } from '@/config/environment';
import { IGameService } from './interfaces/IGameService';
import { IRealtimeService } from './interfaces/IRealtimeService';
import { SupabaseGameService } from './supabase/gameService';
import { SupabaseRealtimeService } from './supabase/realtimeService';

// Game service factory
export function createGameService(): IGameService {
  try {
    if (useLocalSocket) {
      console.log('Using Socket.io for game service');
      // Dynamic import to avoid issues if Socket.io is not available
      const { SocketIoGameService } = require('./socketio/gameService');
      return new SocketIoGameService();
    } else {
      console.log('Using Supabase for game service');
      return new SupabaseGameService();
    }
  } catch (error) {
    console.error('Error creating game service, falling back to Supabase:', error);
    return new SupabaseGameService();
  }
}

// Realtime service factory
export function createRealtimeService(): IRealtimeService {
  try {
    if (useLocalSocket) {
      console.log('Using Socket.io for realtime service');
      // Dynamic import to avoid issues if Socket.io is not available
      const { SocketIoRealtimeService } = require('./socketio/realtimeService');
      return new SocketIoRealtimeService();
    } else {
      console.log('Using Supabase for realtime service');
      return new SupabaseRealtimeService();
    }
  } catch (error) {
    console.error('Error creating realtime service, falling back to Supabase:', error);
    return new SupabaseRealtimeService();
  }
}

// Game service instance (singleton)
let gameService: IGameService | null = null;

// Realtime service instance (singleton)
let realtimeService: IRealtimeService | null = null;

// Get game service instance
export function getGameService(): IGameService {
  if (!gameService) {
    gameService = createGameService();
  }
  return gameService;
}

// Get realtime service instance
export function getRealtimeService(): IRealtimeService {
  if (!realtimeService) {
    realtimeService = createRealtimeService();
  }
  return realtimeService;
} 