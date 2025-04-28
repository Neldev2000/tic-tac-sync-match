
import { supabase } from "@/integrations/supabase/client";
import { Game, Player, Move } from "@/types/supabase";
import { generateGameCode } from "@/utils/gameUtils";

// Create a new game
export const createGame = async (playerName: string): Promise<{ game: Game; player: Player; gameCode: string }> => {
  const gameCode = generateGameCode();
  
  // Insert the new game
  const { data: gameData, error: gameError } = await supabase
    .from('games')
    .insert([{ code: gameCode }])
    .select()
    .single();
  
  if (gameError) throw gameError;

  // Insert the creator player
  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .insert([{
      game_id: gameData.id,
      name: playerName,
      symbol: 'X',
      is_creator: true
    }])
    .select()
    .single();
  
  if (playerError) throw playerError;

  return { game: gameData, player: playerData, gameCode };
};

// Join an existing game
export const joinGame = async (gameCode: string, playerName: string): Promise<{ game: Game; player: Player }> => {
  // Find the game by code
  const { data: gameData, error: gameError } = await supabase
    .from('games')
    .select()
    .eq('code', gameCode)
    .single();
  
  if (gameError) throw gameError;

  // Check if the game is already full
  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameData.id);
  
  if (playersError) throw playersError;
  
  if (players.length >= 2) {
    throw new Error('Game is already full');
  }

  // Insert the second player
  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .insert([{
      game_id: gameData.id,
      name: playerName,
      symbol: 'O',
      is_creator: false
    }])
    .select()
    .single();
  
  if (playerError) throw playerError;

  // Update game status to active
  await supabase
    .from('games')
    .update({ status: 'active' })
    .eq('id', gameData.id);

  return { game: gameData, player: playerData };
};

// Make a move in the game
export const makeMove = async (gameId: string, playerId: string, position: number, board: string): Promise<void> => {
  // Insert the move
  const { error: moveError } = await supabase
    .from('moves')
    .insert([{
      game_id: gameId,
      player_id: playerId,
      position
    }]);
  
  if (moveError) throw moveError;

  // Update the game board
  const { error: updateError } = await supabase
    .from('games')
    .update({ board })
    .eq('id', gameId);
  
  if (updateError) throw updateError;
};

// Update game status when game is over
export const updateGameStatus = async (
  gameId: string, 
  status: 'waiting' | 'active' | 'completed',
  winnerId: string | null = null
): Promise<void> => {
  const { error } = await supabase
    .from('games')
    .update({ 
      status,
      winner: winnerId,
      updated_at: new Date().toISOString()
    })
    .eq('id', gameId);
  
  if (error) throw error;
};

// Get game by code
export const getGameByCode = async (gameCode: string): Promise<Game | null> => {
  const { data, error } = await supabase
    .from('games')
    .select()
    .eq('code', gameCode)
    .single();
  
  if (error) return null;
  return data;
};

// Get players in a game
export const getGamePlayers = async (gameId: string): Promise<Player[]> => {
  const { data, error } = await supabase
    .from('players')
    .select()
    .eq('game_id', gameId);
  
  if (error) throw error;
  return data || [];
};

// Subscribe to game changes
export const subscribeToGame = (gameId: string, callback: (game: Game) => void) => {
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
};

// Subscribe to players changes
export const subscribeToPlayers = (gameId: string, callback: (players: Player) => void) => {
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
};
