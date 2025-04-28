
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GameContainer from "@/components/GameContainer";
import { useToast } from "@/components/ui/use-toast";
import { getInitialBoard, checkWinner, isBoardFull } from "@/utils/gameUtils";

interface LocationState {
  playerName: string;
  isCreator: boolean;
  gameCode?: string;
}

const GameBoard = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const state = location.state as LocationState;

  const [board, setBoard] = useState<Array<string | null>>(getInitialBoard());
  const [isPlayerX, setIsPlayerX] = useState<boolean>(state?.isCreator || false);
  const [currentTurn, setCurrentTurn] = useState<'X' | 'O'>('X'); // X siempre empieza
  const [playerName] = useState<string>(state?.playerName || 'Jugador');
  const [opponentName, setOpponentName] = useState<string>('Esperando oponente...');
  const [winner, setWinner] = useState<string | null>(null);
  const [isWaiting, setIsWaiting] = useState<boolean>(state?.isCreator || false);

  // Para esta versión, simularemos la conexión del segundo jugador
  useEffect(() => {
    if (!state) {
      // Si no hay estado, redirigir a la página de inicio
      navigate('/');
      return;
    }

    if (isWaiting && state.isCreator) {
      // Simulamos que el segundo jugador se une después de 3 segundos
      const timer = setTimeout(() => {
        setOpponentName('Oponente');
        setIsWaiting(false);
        toast({
          title: "¡Jugador conectado!",
          description: "La partida puede comenzar ahora"
        });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isWaiting, state, navigate, toast]);

  // Simula actualización del estado del juego
  useEffect(() => {
    if (winner) return;
    
    // Simulamos el turno del oponente si no estamos esperando
    if (!isWaiting && 
        ((isPlayerX && currentTurn === 'O') || 
         (!isPlayerX && currentTurn === 'X'))) {
      
      const timer = setTimeout(() => {
        // Simulamos una jugada aleatoria del oponente
        const availableSquares = board.map((square, idx) => 
          square === null ? idx : -1).filter(idx => idx !== -1);
        
        if (availableSquares.length > 0) {
          const randomIndex = availableSquares[Math.floor(Math.random() * availableSquares.length)];
          handleSquareClick(randomIndex);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [board, currentTurn, isPlayerX, isWaiting, winner]);

  const handleSquareClick = (index: number) => {
    // No permitir clicks si no es el turno del jugador o si el juego terminó
    if (winner || board[index] || 
        (isPlayerX && currentTurn !== 'X') || 
        (!isPlayerX && currentTurn !== 'O') ||
        isWaiting) {
      return;
    }

    // Actualizar el tablero
    const newBoard = [...board];
    newBoard[index] = currentTurn;
    setBoard(newBoard);

    // Comprobar si hay un ganador
    const newWinner = checkWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
      toast({
        title: newWinner === (isPlayerX ? 'X' : 'O') ? "¡Has ganado!" : "Has perdido",
        description: newWinner === (isPlayerX ? 'X' : 'O') 
          ? "¡Felicidades por tu victoria!" 
          : "Mejor suerte la próxima vez"
      });
      return;
    }

    // Comprobar si hay empate
    if (isBoardFull(newBoard)) {
      setWinner('empate');
      toast({
        title: "Empate",
        description: "El juego ha terminado en empate"
      });
      return;
    }

    // Cambiar el turno
    setCurrentTurn(currentTurn === 'X' ? 'O' : 'X');
  };

  const handleRestart = () => {
    setBoard(getInitialBoard());
    setCurrentTurn('X');
    setWinner(null);
  };

  const handleNewGame = () => {
    navigate('/');
  };

  // Renderizar el tablero
  const renderSquare = (index: number) => {
    const value = board[index];
    return (
      <button
        onClick={() => handleSquareClick(index)}
        className={`w-24 h-24 border border-gray-200 flex items-center justify-center text-3xl font-semibold transition-all
                   ${!value && !winner && 
                    ((isPlayerX && currentTurn === 'X') || 
                     (!isPlayerX && currentTurn === 'O')) ? 
                     'hover:bg-gray-50' : ''}`}
        disabled={!!value || !!winner || isWaiting ||
                 (isPlayerX && currentTurn !== 'X') || 
                 (!isPlayerX && currentTurn !== 'O')}
      >
        {value && (
          <span className={value === 'X' ? 'text-apple-accent' : 'text-apple-gray'}>
            {value}
          </span>
        )}
      </button>
    );
  };

  // Estado del juego actual
  const getStatusMessage = () => {
    if (winner === 'empate') return "Empate";
    if (winner) return `Ganador: ${winner === (isPlayerX ? 'X' : 'O') ? 'Tú' : opponentName}`;
    if (isWaiting) return "Esperando a que se una un oponente...";
    return `Turno de ${currentTurn === (isPlayerX ? 'X' : 'O') ? 'ti' : opponentName}`;
  };

  // Mostrar código de juego para compartir
  const renderGameCode = () => {
    if (!gameCode || !state?.isCreator || !isWaiting) return null;
    
    return (
      <div className="mt-6 text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-apple-gray mb-2">Comparte este código con tu amigo:</p>
        <p className="text-xl font-mono font-semibold tracking-wider">{gameCode}</p>
      </div>
    );
  };

  return (
    <GameContainer className="max-w-md animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Tic Tac Toe</h1>
        <div className="flex justify-center items-center gap-3 mt-2">
          <div className={`px-3 py-1 rounded ${isPlayerX ? 'bg-apple-accent text-white' : 'bg-gray-100'}`}>
            {playerName} {isPlayerX ? '(X)' : '(O)'}
          </div>
          <div className="text-sm text-apple-gray">vs</div>
          <div className={`px-3 py-1 rounded ${!isPlayerX ? 'bg-apple-accent text-white' : 'bg-gray-100'}`}>
            {opponentName} {!isPlayerX ? '(X)' : '(O)'}
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
        {winner && (
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
