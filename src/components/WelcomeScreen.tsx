
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GameContainer from "@/components/GameContainer";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { generateGameCode } from "@/utils/gameUtils";

const WelcomeScreen = () => {
  const [isJoining, setIsJoining] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [gameCode, setGameCode] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateGame = () => {
    if (!playerName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa tu nombre para continuar",
      });
      return;
    }

    const newGameCode = generateGameCode();
    navigate(`/game/${newGameCode}`, { 
      state: { 
        playerName, 
        isCreator: true,
        gameCode: newGameCode
      } 
    });
  };

  const handleJoinGame = () => {
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

    navigate(`/game/${gameCode}`, { 
      state: { 
        playerName, 
        isCreator: false
      } 
    });
  };

  return (
    <GameContainer className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          Tic Tac Toe
        </h1>
        <p className="text-apple-gray">
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
              <Button onClick={handleJoinGame} className="apple-button">
                Unirse
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsJoining(false)}
                className="border border-gray-300 hover:bg-gray-50"
              >
                Crear partida
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleCreateGame} className="apple-button">
                Crear partida
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsJoining(true)}
                className="border border-gray-300 hover:bg-gray-50"
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
