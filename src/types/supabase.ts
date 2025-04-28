
export interface Game {
  id: string;
  code: string;
  status: 'waiting' | 'active' | 'completed';
  winner: string | null;
  created_at: string;
  updated_at: string;
  board: string; // String representation of the board state
}

export interface Player {
  id: string;
  user_id: string | null;
  game_id: string;
  name: string;
  symbol: 'X' | 'O';
  is_creator: boolean;
  joined_at: string;
}

export interface Move {
  id: string;
  game_id: string;
  player_id: string;
  position: number;
  created_at: string;
}
