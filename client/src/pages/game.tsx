import { useGameState } from "@/hooks/useGameState";
import GameHeader from "@/components/game/GameHeader";
import GameBoard from "@/components/game/GameBoard";
import GameSidebar from "@/components/game/GameSidebar";
import GameModals from "@/components/game/GameModals";

export default function Game() {
  const gameState = useGameState();

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-50">
      <GameHeader gameState={gameState} />
      
      <main className="flex-1 flex">
        <GameBoard gameState={gameState} />
        <GameSidebar gameState={gameState} />
      </main>

      <GameModals gameState={gameState} />
    </div>
  );
}
