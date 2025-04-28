import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GameContainer from "@/components/GameContainer";
import { useToast } from "@/components/ui/use-toast";
import { checkWinner, isBoardFull, boardStringToArray } from "@/utils/gameUtils";
import { getGameByCode, getGamePlayers, makeMove, subscribeToGame, subscribeToPlayers, updateGameStatus } from "@/services/gameService";
import { Game, Player } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";

interface LocationState {
  playerId: string;
  playerName: string;
  symbol: 'X' | 'O';
  isCreator: boolean;
  gameId: string;
}

const GameBoard = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const state = location.state as LocationState;

  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState<'X' | 'O'>('X'); // X always starts
  const [winner, setWinner] = useState<string | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize game state
  useEffect(() => {
    const initGame = async () => {
      if (!gameCode || !state) {
        navigate('/');
        return;
      }

      try {
        // Get game data
        const gameData = await getGameByCode(gameCode);
        if (!gameData) {
          toast({
            title: "Partida no encontrada",
            description: "La partida a la que intentas acceder no existe",
          });
          navigate('/');
          return;
        }
        setGame(gameData);

        // Convert board string to array
        if (gameData.board) {
          const boardArray = boardStringToArray(gameData.board);
          setBoard(boardArray);
          
          // Set current turn based on board state
          const xCount = boardArray.filter(cell => cell === 'X').length;
          const oCount = boardArray.filter(cell => cell === 'O').length;
          setCurrentTurn(xCount <= oCount ? 'X' : 'O');

          // Check if game is already won
          const winnerSymbol = checkWinner(boardArray);
          if (winnerSymbol) {
            const winningPlayer = players.find(p => p.symbol === winnerSymbol);
            setWinner(winningPlayer?.id || null);
          } else if (isBoardFull(boardArray)) {
            setWinner('empate');
          }
        }

        // Get players
        const playersData = await getGamePlayers(gameData.id);
        setPlayers(playersData);
        
        const currentPlayerData = playersData.find(p => p.id === state.playerId);
        if (currentPlayerData) {
          setCurrentPlayer(currentPlayerData);
          const opponentData = playersData.find(p => p.id !== state.playerId);
          setOpponent(opponentData || null);
        }

        // Set waiting state if we don't have two players yet
        setIsWaiting(playersData.length < 2);

      } catch (error) {
        console.error('Error loading game:', error);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar la partida",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initGame();
  }, [gameCode, state, navigate, toast]);

  // Subscribe to real-time game updates
  useEffect(() => {
    if (!game) return;

    // Subscribe to game changes
    const gameChannel = subscribeToGame(game.id, (updatedGame) => {
      setGame(updatedGame);
      
      // Update board
      if (updatedGame.board) {
        const boardArray = boardStringToArray(updatedGame.board);
        setBoard(boardArray);
        
        // Update current turn
        const xCount = boardArray.filter(cell => cell === 'X').length;
        const oCount = boardArray.filter(cell => cell === 'O').length;
        setCurrentTurn(xCount <= oCount ? 'X' : 'O');
        
        // Check winner
        const winnerSymbol = checkWinner(boardArray);
        if (winnerSymbol) {
          const winningPlayer = players.find(p => p.symbol === winnerSymbol);
          setWinner(winnerSymbol);
          if (winningPlayer?.id === currentPlayer?.id) {
            toast({
              title: "¡Has ganado!",
              description: "¡Felicidades por tu victoria!"
            });
          } else if (winningPlayer) {
            toast({
              title: "Has perdido",
              description: "Mejor suerte la próxima vez"
            });
          }
        } else if (isBoardFull(boardArray)) {
          setWinner('empate');
          toast({
            title: "Empate",
            description: "El juego ha terminado en empate"
          });
        }
      }
      
      // Update game status
      if (updatedGame.status === 'completed' && game.status !== 'completed') {
        if (updatedGame.winner === currentPlayer?.id) {
          toast({
            title: "¡Has ganado!",
            description: "¡Felicidades por tu victoria!"
          });
        } else if (updatedGame.winner && updatedGame.winner !== currentPlayer?.id) {
          toast({
            title: "Has perdido",
            description: "Mejor suerte la próxima vez"
          });
        } else {
          toast({
            title: "Empate",
            description: "El juego ha terminado en empate"
          });
        }
      }
    });

    // Subscribe to player changes
    const playersChannel = subscribeToPlayers(game.id, (updatedPlayer) => {
      setPlayers(prev => {
        // Check if this player already exists
        const exists = prev.some(p => p.id === updatedPlayer.id);
        
        if (exists) {
          // Update existing player
          return prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
        } else {
          // New player joined
          const newPlayers = [...prev, updatedPlayer];
          setIsWaiting(false);
          
          // Set as opponent if not current player
          if (updatedPlayer.id !== currentPlayer?.id) {
            setOpponent(updatedPlayer);
            toast({
              title: "¡Jugador conectado!",
              description: `${updatedPlayer.name} se ha unido a la partida`
            });
          }
          
          return newPlayers;
        }
      });
    });

    // Cleanup subscriptions when component unmounts
    return () => {
      supabase.removeChannel(gameChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [game, currentPlayer, players, toast]);

  const handleSquareClick = async (index: number) => {
    // Don't allow clicks if game is over or not the player's turn or waiting for opponent
    if (
      winner || 
      board[index] || 
      !currentPlayer ||
      (currentPlayer.symbol !== currentTurn) || 
      isWaiting
    ) {
      return;
    }

    try {
      // Update local board state first for responsive UI
      const newBoard = [...board];
      newBoard[index] = currentTurn;
      setBoard(newBoard);

      // Convert board array to string for database
      const boardString = newBoard.map(cell => cell || '_').join('');
      
      // Make move in database
      await makeMove(game!.id, currentPlayer.id, index, boardString);
      
      // Check if there's a winner after this move
      const newWinner = checkWinner(newBoard);
      if (newWinner) {
        const winningPlayer = players.find(p => p.symbol === newWinner);
        if (winningPlayer) {
          await updateGameStatus(game!.id, 'completed', winningPlayer.id);
        }
      } else if (isBoardFull(newBoard)) {
        await updateGameStatus(game!.id, 'completed', null);
      }
      
      // Change turn
      setCurrentTurn(currentTurn === 'X' ? 'O' : 'X');
    } catch (error) {
      console.error('Error making move:', error);
      toast({
        title: "Error",
        description: "No se pudo realizar la jugada",
      });
    }
  };

  const handleRestart = async () => {
    if (!game) return;
    
    try {
      // Reset game state
      const newBoard = Array(9).fill('_').join('');
      const { error } = await supabase
        .from('games')
        .update({
          board: newBoard,
          status: 'active',
          winner: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', game.id);
        
      if (error) throw error;
      
      // Clear local state
      setBoard(Array(9).fill(null));
      setCurrentTurn('X');
      setWinner(null);
      
      toast({
        title: "Nueva partida",
        description: "El tablero ha sido reiniciado"
      });
    } catch (error) {
      console.error('Error restarting game:', error);
      toast({
        title: "Error",
        description: "No se pudo reiniciar la partida"
      });
    }
  };

  const handleNewGame = () => {
    navigate('/');
  };

  // Render loading state
  if (isLoading) {
    return (
      <GameContainer className="max-w-md animate-fade-in">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-lg text-gray-500">Cargando partida...</p>
        </div>
      </GameContainer>
    );
  }

  // Render the board
  const renderSquare = (index: number) => {
    const value = board[index];
    const isPlayerTurn = currentPlayer && currentPlayer.symbol === currentTurn;
    
    return (
      <button
        onClick={() => handleSquareClick(index)}
        className={`w-24 h-24 border border-gray-200 flex items-center justify-center text-3xl font-semibold transition-all
                  ${!value && !winner && isPlayerTurn && !isWaiting ? 'hover:bg-gray-50' : ''}`}
        disabled={!!value || !!winner || !isPlayerTurn || isWaiting}
      >
        {value && (
          <span className={value === 'X' ? 'text-blue-500' : 'text-gray-700'}>
            {value}
          </span>
        )}
      </button>
    );
  };

  // Get status message
  const getStatusMessage = () => {
    if (isWaiting) return "Esperando a que se una un oponente...";
    if (winner === 'empate') return "Empate";
    if (winner) {
      const winningPlayer = players.find(p => p.symbol === winner);
      return `Ganador: ${winningPlayer?.id === currentPlayer?.id ? 'Tú' : opponent?.name || 'Oponente'}`;
    }
    return `Turno de ${currentTurn === currentPlayer?.symbol ? 'ti' : opponent?.name || 'oponente'}`;
  };

  // Show game code for sharing
  const renderGameCode = () => {
    if (!gameCode || !state?.isCreator || !isWaiting) return null;
    
    return (
      <div className="mt-6 text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500 mb-2">Comparte este código con tu amigo:</p>
        <p className="text-xl font-mono font-semibold tracking-wider">{gameCode}</p>
      </div>
    );
  };

  return (
    <GameContainer className="max-w-md animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Tic Tac Toe</h1>
        <div className="flex justify-center items-center gap-3 mt-2">
          <div className={`px-3 py-1 rounded ${currentPlayer?.symbol === 'X' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
            {currentPlayer?.name || state?.playerName || 'Tú'} {currentPlayer?.symbol ? `(${currentPlayer.symbol})` : ''}
          </div>
          <div className="text-sm text-gray-500">vs</div>
          <div className={`px-3 py-1 rounded ${currentPlayer?.symbol === 'O' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
            {isWaiting ? 'Esperando oponente...' : (opponent?.name || 'Oponente')} {opponent?.symbol ? `(${opponent.symbol})` : ''}
          </div>
        </div>
        <p className="mt-4 text-sm font-medium">{getStatusMessage()}</p>
      </div>
      
      {renderGameCode()}

      <div className="mt-6 mx-auto w-fit">
        <div className="grid grid-cols-3 gap-1">
          {Array(9).fill(null).map((_, i) => (
            <React.Fragment key={i}>
              {renderSquare(i)}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        {winner && currentPlayer?.is_creator && (
          <Button onClick={handleRestart} variant="outline">
            Jugar de nuevo
          </Button>
        )}
        <Button onClick={handleNewGame} className="apple-button">
          Nueva partida
        </Button>
      </div>
    </GameContainer>
  );
};

export default GameBoard;
