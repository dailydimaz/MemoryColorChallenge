import { Button } from "@/components/ui/button";
import { Play, HelpCircle, Infinity, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameBoardProps {
  gameState: any;
}

export default function GameBoard({ gameState }: GameBoardProps) {
  const {
    gameMode,
    setGameMode,
    gamePhase,
    patternProgress,
    handleColorClick,
    startNewPattern,
    showInstructions,
    pattern,
    userInput
  } = gameState;

  const getPhaseText = () => {
    switch (gamePhase) {
      case 'showing':
        return 'Watch carefully as the colors light up...';
      case 'waiting':
        return 'Get ready to repeat the pattern!';
      case 'playing':
        return 'Click the colors in the correct order!';
      default:
        return 'Ready to start?';
    }
  };

  const progressWidth = pattern.length > 0 ? (userInput.length / pattern.length) * 100 : 0;

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700 max-w-2xl w-full">
        {/* Game Mode Selector */}
        <div className="flex bg-slate-700 rounded-lg p-1 mb-8">
          <Button
            variant={gameMode === 'levels' ? 'default' : 'ghost'}
            className={cn(
              "flex-1 py-3 px-4 rounded-md font-medium transition-all",
              gameMode === 'levels' 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "text-slate-400 hover:text-white hover:bg-slate-600"
            )}
            onClick={() => setGameMode('levels')}
          >
            <Layers className="mr-2" size={16} />
            Levels
          </Button>
          <Button
            variant={gameMode === 'challenge' ? 'default' : 'ghost'}
            className={cn(
              "flex-1 py-3 px-4 rounded-md font-medium transition-all",
              gameMode === 'challenge' 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "text-slate-400 hover:text-white hover:bg-slate-600"
            )}
            onClick={() => setGameMode('challenge')}
          >
            <Infinity className="mr-2" size={16} />
            Challenge
          </Button>
        </div>

        {/* Pattern Display Area */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold mb-4">Remember the pattern!</h2>
          <p className="text-slate-400">{getPhaseText()}</p>
        </div>

        {/* Color Buttons Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Green Button */}
          <Button
            className={cn(
              "w-full h-32 rounded-xl shadow-lg border-4 text-2xl font-bold transition-all duration-200",
              "bg-green-600 hover:bg-green-500 border-green-500 text-white",
              "transform hover:scale-105 active:scale-95"
            )}
            onClick={() => handleColorClick('green')}
            disabled={gamePhase !== 'playing'}
          >
            <div className="w-8 h-8 rounded-full bg-white opacity-80" />
          </Button>
          
          {/* Red Button */}
          <Button
            className={cn(
              "w-full h-32 rounded-xl shadow-lg border-4 text-2xl font-bold transition-all duration-200",
              "bg-red-600 hover:bg-red-500 border-red-500 text-white",
              "transform hover:scale-105 active:scale-95"
            )}
            onClick={() => handleColorClick('red')}
            disabled={gamePhase !== 'playing'}
          >
            <div className="w-8 h-8 rounded-full bg-white opacity-80" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Pattern Progress</span>
            <span>{userInput.length}/{pattern.length}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
            onClick={startNewPattern}
            disabled={gamePhase === 'showing' || gamePhase === 'playing'}
          >
            <Play className="mr-2" size={16} />
            Start Pattern
          </Button>
          <Button
            variant="outline"
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600 py-3 px-6 rounded-lg font-medium"
            onClick={showInstructions}
          >
            <HelpCircle className="mr-2" size={16} />
            Help
          </Button>
        </div>
      </div>
    </div>
  );
}
