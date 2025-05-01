import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GameContainer from "@/components/GameContainer";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { createGame, joinGame, getGameByCode } from "@/services/gameService";

const WelcomeScreen = () => {
  const [isJoining, setIsJoining] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Reset error on mount
  useEffect(() => {
    console.log("WelcomeScreen mounted");
    setError(null);
  }, []);

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa tu nombre para continuar",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { game, player } = await createGame(playerName);
      navigate(`/game/${game.code}`, { 
        state: { 
          playerId: player.id,
          playerName, 
          symbol: player.symbol,
          isCreator: true,
          gameId: game.id
        } 
      });
    } catch (error) {
      console.error('Error creating game:', error);
      setError('No se pudo crear la partida. Intenta de nuevo más tarde.');
      toast({
        title: "Error",
        description: "No se pudo crear la partida. Intenta de nuevo más tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa tu nombre para continuar",
      });
      return;
    }

    if (!gameCode.trim()) {
      toast({
        title: "Código requerido",
        description: "Por favor ingresa el código de la partida para unirte",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // First check if game exists
      const existingGame = await getGameByCode(gameCode);
      if (!existingGame) {
        toast({
          title: "Partida no encontrada",
          description: "El código ingresado no corresponde a ninguna partida activa",
        });
        setIsLoading(false);
        return;
      }

      const { game, player } = await joinGame(gameCode, playerName);
      navigate(`/game/${game.code}`, { 
        state: { 
          playerId: player.id,
          playerName, 
          symbol: player.symbol,
          isCreator: false,
          gameId: game.id
        } 
      });
    } catch (error: any) {
      console.error('Error joining game:', error);
      setError(error.message || "No se pudo unir a la partida. Intenta de nuevo más tarde.");
      toast({
        title: "Error",
        description: error.message || "No se pudo unir a la partida. Intenta de nuevo más tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If there was an error loading the component, display a fallback UI
  if (error) {
    return (
      <GameContainer className="animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Oops! Algo salió mal
          </h1>
          <p className="text-red-500 mb-4">
            {error}
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="apple-button"
          >
            Intentar de nuevo
          </Button>
        </div>
      </GameContainer>
    );
  }

  return (
    <GameContainer className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          Tic Tac Toe
        </h1>
        <p className="text-gray-500">
          {isJoining ? "Únete a una partida" : "Crea o únete a una partida"}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Tu nombre</Label>
          <Input
            id="name"
            placeholder="Ingresa tu nombre"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="apple-input"
            autoComplete="off"
          />
        </div>

        {isJoining && (
          <div className="space-y-2">
            <Label htmlFor="gameCode">Código de partida</Label>
            <Input
              id="gameCode"
              placeholder="Ingresa el código"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              className="apple-input"
              autoComplete="off"
              maxLength={6}
            />
          </div>
        )}

        <div className="flex flex-col gap-3">
          {isJoining ? (
            <>
              <Button 
                onClick={handleJoinGame} 
                className="apple-button"
                disabled={isLoading}
              >
                {isLoading ? "Uniéndose..." : "Unirse"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsJoining(false)}
                className="border border-gray-300 hover:bg-gray-50"
                disabled={isLoading}
              >
                Crear partida
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={handleCreateGame} 
                className="apple-button"
                disabled={isLoading}
              >
                {isLoading ? "Creando..." : "Crear partida"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsJoining(true)}
                className="border border-gray-300 hover:bg-gray-50"
                disabled={isLoading}
              >
                Unirse a partida
              </Button>
            </>
          )}
        </div>
      </div>
    </GameContainer>
  );
};

export default WelcomeScreen;
