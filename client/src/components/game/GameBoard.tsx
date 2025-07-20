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
        return 'Study the sequence carefully - it will disappear!';
      case 'waiting':
        return 'Sequence hidden - get ready to repeat it from memory!';
      case 'playing':
        return 'Now click the colors in the exact same order!';
      case 'complete':
        return 'Perfect! You remembered the sequence!';
      case 'failed':
        return 'Oops! Try to memorize the pattern better next time.';
      default:
        return 'Ready to test your memory?';
    }
  };

  const progressWidth = pattern.length > 0 ? (userInput.length / pattern.length) * 100 : 0;

  return (
    <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
      <div className="bg-slate-800 rounded-2xl p-4 lg:p-8 shadow-2xl border border-slate-700 max-w-2xl w-full">
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
          <p className="text-slate-400 mb-4">{getPhaseText()}</p>
          
          {/* Pattern Sequence Display - Only show during 'showing' phase */}
          {gamePhase === 'showing' && pattern.length > 0 && (
            <div className="bg-slate-700 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Memorize this sequence:</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {pattern.map((color, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300",
                      color === 'green' 
                        ? "bg-green-600 border-green-500 text-white" 
                        : "bg-red-600 border-red-500 text-white",
                      index < patternProgress && "ring-4 ring-yellow-400 ring-opacity-70 scale-110"
                    )}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
              <div className="text-center mt-3">
                <div className="text-sm text-yellow-400 font-medium">
                  Step {patternProgress} of {pattern.length}
                </div>
              </div>
            </div>
          )}

          {/* Memory Challenge Info - Show during waiting/playing phases */}
          {(gamePhase === 'waiting' || gamePhase === 'playing') && (
            <div className="bg-slate-700 rounded-lg p-4 mb-4 border-l-4 border-purple-500">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Memory Challenge</h3>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400 mb-1">
                  {pattern.length} step sequence
                </div>
                {gamePhase === 'waiting' && (
                  <div className="text-sm text-yellow-400 font-medium animate-pulse">
                    Pattern hidden - prepare to click!
                  </div>
                )}
                {gamePhase === 'playing' && (
                  <div className="text-sm text-slate-400">
                    Progress: {userInput.length}/{pattern.length} clicks
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Color Buttons Grid */}
        <div className="grid grid-cols-2 gap-4 lg:gap-6 mb-8">
          {/* Green Button */}
          <Button
            data-color="green"
            className={cn(
              "w-full h-36 lg:h-32 rounded-xl shadow-lg border-4 text-xl lg:text-2xl font-bold transition-all duration-200",
              "bg-green-600 hover:bg-green-500 active:bg-green-700 border-green-500 text-white",
              "transform hover:scale-105 active:scale-95 touch-manipulation",
              gamePhase !== 'playing' && "opacity-60 cursor-not-allowed"
            )}
            onClick={() => handleColorClick('green')}
            disabled={gamePhase !== 'playing'}
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-white opacity-90 mb-2" />
              <span className="text-lg lg:text-xl font-bold">GREEN</span>
            </div>
          </Button>
          
          {/* Red Button */}
          <Button
            data-color="red"
            className={cn(
              "w-full h-36 lg:h-32 rounded-xl shadow-lg border-4 text-xl lg:text-2xl font-bold transition-all duration-200",
              "bg-red-600 hover:bg-red-500 active:bg-red-700 border-red-500 text-white",
              "transform hover:scale-105 active:scale-95 touch-manipulation",
              gamePhase !== 'playing' && "opacity-60 cursor-not-allowed"
            )}
            onClick={() => handleColorClick('red')}
            disabled={gamePhase !== 'playing'}
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-white opacity-90 mb-2" />
              <span className="text-lg lg:text-xl font-bold">RED</span>
            </div>
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
            disabled={gamePhase === 'showing' || gamePhase === 'playing' || gamePhase === 'waiting'}
          >
            <Play className="mr-2" size={16} />
            {gamePhase === 'idle' ? 'Start Memory Test' : 'Start New Pattern'}
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
