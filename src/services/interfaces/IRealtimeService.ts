import { Game, Player } from "@/types/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface IRealtimeService {
  subscribeToGame(gameId: string, callback: (game: Game) => void): RealtimeChannel | (() => void);
  subscribeToPlayers(gameId: string, callback: (player: Player) => void): RealtimeChannel | (() => void);
  unsubscribe(subscription: RealtimeChannel | (() => void)): void;
} 