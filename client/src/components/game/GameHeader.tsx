import { Brain } from "lucide-react";

interface GameHeaderProps {
  gameState: any;
}

export default function GameHeader({ gameState }: GameHeaderProps) {
  const { currentLevel, currentScore, timeRemaining } = gameState;

  return (
    <header className="bg-slate-800 shadow-lg border-b border-slate-700">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-50 flex items-center">
              <Brain className="text-purple-400 mr-2" size={32} />
              Memory Patterns
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-sm text-slate-400">Level</div>
              <div className="text-xl font-bold text-blue-400">{currentLevel}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400">Score</div>
              <div className="text-xl font-bold text-amber-400">{currentScore}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400">Time</div>
              <div className="text-xl font-bold text-red-400">{timeRemaining}s</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
