import { Socket } from 'socket.io-client';
import { IGameService } from '../interfaces/IGameService';
import { Game, Player, Move } from "@/types/supabase";
import { SocketEvents } from '@/server/socket-server';
import { getSocket } from './socketClient';

// Socket.io implementation of game service
export class SocketIoGameService implements IGameService {
  private socket: Socket;
  
  constructor() {
    this.socket = getSocket();
  }
  
  // Create a new game
  async createGame(playerName: string): Promise<{ game: Game; player: Player; gameCode: string }> {
    return new Promise((resolve, reject) => {
      this.socket.emit(SocketEvents.CREATE_GAME, { playerName }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Failed to create game'));
        }
      });
    });
  }
  
  // Join an existing game
  async joinGame(gameCode: string, playerName: string): Promise<{ game: Game; player: Player }> {
    return new Promise((resolve, reject) => {
      this.socket.emit(SocketEvents.JOIN_GAME, { gameCode, playerName }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Failed to join game'));
        }
      });
    });
  }
  
  // Make a move in the game
  async makeMove(gameId: string, playerId: string, position: number, board: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit(SocketEvents.MAKE_MOVE, { gameId, playerId, position, board }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to make move'));
        }
      });
    });
  }
  
  // Update game status
  async updateGameStatus(gameId: string, status: 'waiting' | 'active' | 'completed', winnerId: string | null = null): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit(SocketEvents.UPDATE_GAME_STATUS, { gameId, status, winnerId }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to update game status'));
        }
      });
    });
  }
  
  // Get game by code
  async getGameByCode(gameCode: string): Promise<Game | null> {
    return new Promise((resolve, reject) => {
      this.socket.emit(SocketEvents.GET_GAME, { gameCode }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Failed to get game'));
        }
      });
    });
  }
  
  // Get players in a game
  async getGamePlayers(gameId: string): Promise<Player[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit(SocketEvents.GET_PLAYERS, { gameId }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Failed to get players'));
        }
      });
    });
  }
} 