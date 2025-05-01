import { Game, Player, Move } from "@/types/supabase";
import { generateGameCode } from "@/utils/gameUtils";
import { v4 as uuidv4 } from 'uuid';

/**
 * In-memory data store for Socket.io implementation
 * Mimics Supabase database functionality for local testing
 */
export function createGameStore() {
  // In-memory data storage
  const games: Record<string, Game> = {};
  const players: Record<string, Player[]> = {};
  const moves: Record<string, Move[]> = {};
  
  // Game code to ID mapping for faster lookup
  const gameCodeToId: Record<string, string> = {};

  return {
    // Create a new game
    createGame: async (playerName: string): Promise<{ game: Game; player: Player; gameCode: string }> => {
      const gameId = uuidv4();
      const gameCode = generateGameCode();
      const timestamp = new Date().toISOString();
      
      // Create game
      const game: Game = {
        id: gameId,
        code: gameCode,
        status: 'waiting',
        board: '         ', // 9 empty spaces for tic-tac-toe
        created_at: timestamp,
        updated_at: timestamp,
        winner: null
      };
      
      // Create player
      const playerId = uuidv4();
      const player: Player = {
        id: playerId,
        game_id: gameId,
        name: playerName,
        symbol: 'X',
        is_creator: true,
        joined_at: timestamp,
        user_id: null
      };
      
      // Store in memory
      games[gameId] = game;
      players[gameId] = [player];
      moves[gameId] = [];
      gameCodeToId[gameCode] = gameId;
      
      return { game, player, gameCode };
    },
    
    // Join an existing game
    joinGame: async (gameCode: string, playerName: string): Promise<{ game: Game; player: Player }> => {
      const gameId = gameCodeToId[gameCode];
      
      if (!gameId || !games[gameId]) {
        throw new Error('Game not found');
      }
      
      const game = games[gameId];
      const existingPlayers = players[gameId] || [];
      
      if (existingPlayers.length >= 2) {
        throw new Error('Game is already full');
      }
      
      // Create second player
      const playerId = uuidv4();
      const timestamp = new Date().toISOString();
      const player: Player = {
        id: playerId,
        game_id: gameId,
        name: playerName,
        symbol: 'O',
        is_creator: false,
        joined_at: timestamp,
        user_id: null
      };
      
      // Update game status
      game.status = 'active';
      game.updated_at = timestamp;
      
      // Store in memory
      players[gameId].push(player);
      
      return { game, player };
    },
    
    // Make a move in the game
    makeMove: async (gameId: string, playerId: string, position: number, board: string): Promise<void> => {
      if (!games[gameId]) {
        throw new Error('Game not found');
      }
      
      const timestamp = new Date().toISOString();
      
      // Create move
      const moveId = uuidv4();
      const move: Move = {
        id: moveId,
        game_id: gameId,
        player_id: playerId,
        position,
        created_at: timestamp
      };
      
      // Update game board
      games[gameId].board = board;
      games[gameId].updated_at = timestamp;
      
      // Store in memory
      if (!moves[gameId]) {
        moves[gameId] = [];
      }
      moves[gameId].push(move);
    },
    
    // Update game status when game is over
    updateGameStatus: async (gameId: string, status: 'waiting' | 'active' | 'completed', winnerId: string | null = null): Promise<void> => {
      if (!games[gameId]) {
        throw new Error('Game not found');
      }
      
      // Update game
      games[gameId].status = status;
      games[gameId].winner = winnerId;
      games[gameId].updated_at = new Date().toISOString();
    },
    
    // Get game by code
    getGameByCode: async (gameCodeOrId: string): Promise<Game | null> => {
      // Try to find by code first
      const gameId = gameCodeToId[gameCodeOrId] || gameCodeOrId;
      return games[gameId] || null;
    },
    
    // Get players in a game
    getGamePlayers: async (gameId: string): Promise<Player[]> => {
      return players[gameId] || [];
    }
  };
} 