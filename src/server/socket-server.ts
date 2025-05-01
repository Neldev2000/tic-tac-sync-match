import { Server } from 'socket.io';
import http from 'http';
import { createGameStore } from './store';

// Initialize in-memory store
const store = createGameStore();

// Socket.io event types
export enum SocketEvents {
  CREATE_GAME = 'create_game',
  JOIN_GAME = 'join_game',
  MAKE_MOVE = 'make_move',
  UPDATE_GAME_STATUS = 'update_game_status',
  GAME_UPDATED = 'game_updated',
  PLAYER_JOINED = 'player_joined',
  GET_GAME = 'get_game',
  GET_PLAYERS = 'get_players',
  ERROR = 'error'
}

// Create and configure socket server
export function createSocketServer(httpServer: http.Server) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle creating a new game
    socket.on(SocketEvents.CREATE_GAME, async (data, callback) => {
      try {
        const { playerName } = data;
        const result = await store.createGame(playerName);
        
        // Join the game room
        socket.join(`game:${result.game.id}`);
        
        callback({ success: true, data: result });
      } catch (error) {
        console.error('Error creating game:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Handle joining a game
    socket.on(SocketEvents.JOIN_GAME, async (data, callback) => {
      try {
        const { gameCode, playerName } = data;
        const result = await store.joinGame(gameCode, playerName);
        
        // Join the game room
        socket.join(`game:${result.game.id}`);
        
        // Notify others in the room that a player joined
        socket.to(`game:${result.game.id}`).emit(SocketEvents.PLAYER_JOINED, result.player);
        
        // Emit game update to all clients in the room
        io.to(`game:${result.game.id}`).emit(SocketEvents.GAME_UPDATED, result.game);
        
        callback({ success: true, data: result });
      } catch (error) {
        console.error('Error joining game:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Handle making a move
    socket.on(SocketEvents.MAKE_MOVE, async (data, callback) => {
      try {
        const { gameId, playerId, position, board } = data;
        await store.makeMove(gameId, playerId, position, board);
        
        // Get updated game state
        const game = await store.getGameByCode(gameId);
        
        // Emit game update to all clients in the room
        io.to(`game:${gameId}`).emit(SocketEvents.GAME_UPDATED, game);
        
        callback({ success: true });
      } catch (error) {
        console.error('Error making move:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Handle updating game status
    socket.on(SocketEvents.UPDATE_GAME_STATUS, async (data, callback) => {
      try {
        const { gameId, status, winnerId } = data;
        await store.updateGameStatus(gameId, status, winnerId);
        
        // Get updated game state
        const game = await store.getGameByCode(gameId);
        
        // Emit game update to all clients in the room
        io.to(`game:${gameId}`).emit(SocketEvents.GAME_UPDATED, game);
        
        callback({ success: true });
      } catch (error) {
        console.error('Error updating game status:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Handle get game by code
    socket.on(SocketEvents.GET_GAME, async (data, callback) => {
      try {
        const { gameCode } = data;
        const game = await store.getGameByCode(gameCode);
        callback({ success: true, data: game });
      } catch (error) {
        console.error('Error getting game:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Handle get players
    socket.on(SocketEvents.GET_PLAYERS, async (data, callback) => {
      try {
        const { gameId } = data;
        const players = await store.getGamePlayers(gameId);
        callback({ success: true, data: players });
      } catch (error) {
        console.error('Error getting players:', error);
        callback({ success: false, error: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

// If this file is executed directly, create and start the server
if (require.main === module) {
  const httpServer = http.createServer();
  const io = createSocketServer(httpServer);
  
  const PORT = process.env.SOCKET_SERVER_PORT || 3001;
  httpServer.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`);
  });
} 