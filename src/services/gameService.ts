import { Game, Player, Move } from "@/types/supabase";
import { getGameService, getRealtimeService } from "./serviceFactory";
import { RealtimeChannel } from "@supabase/supabase-js";

// Export all methods from the game service
export const createGame = async (playerName: string): Promise<{ game: Game; player: Player; gameCode: string }> => {
  return getGameService().createGame(playerName);
};

export const joinGame = async (gameCode: string, playerName: string): Promise<{ game: Game; player: Player }> => {
  return getGameService().joinGame(gameCode, playerName);
};

export const makeMove = async (gameId: string, playerId: string, position: number, board: string): Promise<void> => {
  return getGameService().makeMove(gameId, playerId, position, board);
};

export const updateGameStatus = async (
  gameId: string, 
  status: 'waiting' | 'active' | 'completed',
  winnerId: string | null = null
): Promise<void> => {
  return getGameService().updateGameStatus(gameId, status, winnerId);
};

export const getGameByCode = async (gameCode: string): Promise<Game | null> => {
  return getGameService().getGameByCode(gameCode);
};

export const getGamePlayers = async (gameId: string): Promise<Player[]> => {
  return getGameService().getGamePlayers(gameId);
};

// Realtime subscriptions
export const subscribeToGame = (gameId: string, callback: (game: Game) => void) => {
  return getRealtimeService().subscribeToGame(gameId, callback);
};

export const subscribeToPlayers = (gameId: string, callback: (players: Player) => void) => {
  return getRealtimeService().subscribeToPlayers(gameId, callback);
};

// Unsubscribe from events
export const unsubscribe = (subscription: RealtimeChannel | (() => void)) => {
  return getRealtimeService().unsubscribe(subscription);
};
