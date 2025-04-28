
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GameContainerProps {
  children: React.ReactNode;
  className?: string;
}

const GameContainer = ({ children, className }: GameContainerProps) => {
  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <Card className={cn("card-shadow border-0", className)}>
        <CardContent className="p-6">{children}</CardContent>
      </Card>
    </div>
  );
};

export default GameContainer;
