import { supabase } from "@/integrations/supabase/client";
import { IRealtimeService } from '../interfaces/IRealtimeService';
import { Game, Player } from "@/types/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

// Supabase implementation of realtime service
export class SupabaseRealtimeService implements IRealtimeService {
  // Subscribe to game changes
  subscribeToGame(gameId: string, callback: (game: Game) => void): RealtimeChannel {
    return supabase
      .channel(`game:${gameId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'games',
          filter: `id=eq.${gameId}`
        }, 
        (payload) => callback(payload.new as Game)
      )
      .subscribe();
  }
  
  // Subscribe to players changes
  subscribeToPlayers(gameId: string, callback: (player: Player) => void): RealtimeChannel {
    return supabase
      .channel(`players:${gameId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'players',
          filter: `game_id=eq.${gameId}`
        }, 
        (payload) => callback(payload.new as Player)
      )
      .subscribe();
  }
  
  // Unsubscribe from events
  unsubscribe(subscription: RealtimeChannel | (() => void)): void {
    if (typeof subscription === 'function') {
      (subscription as Function)();
    } else if (subscription) {
      supabase.removeChannel(subscription as RealtimeChannel);
    }
  }
} 