import { Game, Player, Move } from "@/types/supabase";

export interface IGameService {
  createGame(playerName: string): Promise<{ game: Game; player: Player; gameCode: string }>;
  joinGame(gameCode: string, playerName: string): Promise<{ game: Game; player: Player }>;
  makeMove(gameId: string, playerId: string, position: number, board: string): Promise<void>;
  updateGameStatus(gameId: string, status: 'waiting' | 'active' | 'completed', winnerId?: string | null): Promise<void>;
  getGameByCode(gameCode: string): Promise<Game | null>;
  getGamePlayers(gameId: string): Promise<Player[]>;
} 