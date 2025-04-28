
/**
 * Genera un código único para la sesión de juego.
 * Se genera un código alfanumérico de 6 caracteres.
 */
export const generateGameCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluimos caracteres confusos como 0, O, 1, I
  let result = '';
  
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Comprueba si el código de juego tiene un formato válido
 */
export const isValidGameCode = (code: string): boolean => {
  // Código alfanumérico de 6 caracteres
  const regex = /^[A-Z0-9]{6}$/;
  return regex.test(code);
};

/**
 * Estado inicial del tablero de juego (3x3 vacío)
 */
export const getInitialBoard = (): Array<string | null> => {
  return Array(9).fill(null);
};

/**
 * Comprueba si hay un ganador en el tablero actual
 */
export const checkWinner = (squares: Array<string | null>): string | null => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a] as string;
    }
  }
  
  return null;
};

/**
 * Comprueba si el tablero está completamente lleno (empate)
 */
export const isBoardFull = (squares: Array<string | null>): boolean => {
  return squares.every((square) => square !== null);
};
