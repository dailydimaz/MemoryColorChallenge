import { Button } from "@/components/ui/button";
import { Play, HelpCircle, Infinity, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";

type Color = 'green' | 'red';

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
    userInput,
    currentScore,
    challengePhase,
    challengeGuessTimer,
    challengeCurrentIndex,
    challengeSequence,
    challengeVisibleColors,
    isLoading,
    error
  } = gameState;

  const getPhaseText = () => {
    if (gameMode === 'challenge') {
      switch (gamePhase) {
        case 'showing':
          return 'Memorize the initial sequence - the rolling challenge begins soon!';
        case 'playing':
          return `Guess the hidden color! ${challengeGuessTimer} seconds remaining`;
        case 'failed':
          return `Challenge ended! You survived ${currentScore} seconds`;
        default:
          return 'Ready for the rolling sequence challenge?';
      }
    } else {
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
    }
  };

  const progressWidth = gameMode === 'challenge' 
    ? 0 // No progress bar for challenge mode
    : pattern.length > 0 ? (userInput.length / pattern.length) * 100 : 0;

  // Visual feedback for keyboard presses
  const [keyboardPressed, setKeyboardPressed] = useState<Color | null>(null);
  
  // Use ref to store current handleColorClick to avoid useEffect dependency issues
  const handleColorClickRef = useRef(handleColorClick);
  const gamePhaseRef = useRef(gamePhase);
  
  // Update refs when values change
  useEffect(() => {
    handleColorClickRef.current = handleColorClick;
    gamePhaseRef.current = gamePhase;
  });

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard input during playing phase
      if (gamePhaseRef.current !== 'playing') return;
      
      const key = event.key.toLowerCase();
      
      if (key === 'q') {
        event.preventDefault();
        setKeyboardPressed('green');
        handleColorClickRef.current('green');
        // Clear highlight after a short delay
        setTimeout(() => setKeyboardPressed(null), 150);
      } else if (key === 'p') {
        event.preventDefault();
        setKeyboardPressed('red');
        handleColorClickRef.current('red');
        // Clear highlight after a short delay
        setTimeout(() => setKeyboardPressed(null), 150);
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty dependency array - event listener is set once

  return (
    <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {getPhaseText()}
      </div>
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {gameMode === 'challenge' && gamePhase === 'playing' && 
          `${challengeGuessTimer} seconds remaining to guess`}
      </div>
      
      <div className="bg-slate-800 rounded-2xl p-4 lg:p-8 shadow-2xl border border-slate-700 max-w-2xl w-full game-element">
        {/* Game Mode Selector */}
        <div className="flex bg-slate-700 rounded-lg p-1 mb-6 sm:mb-8">
          <Button
            variant={gameMode === 'levels' ? 'default' : 'ghost'}
            className={cn(
              "flex-1 py-4 sm:py-3 px-4 rounded-md font-medium transition-all touch-manipulation min-h-[50px]",
              gameMode === 'levels' 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "text-slate-400 hover:text-white hover:bg-slate-600"
            )}
            onClick={() => setGameMode('levels')}
          >
            <div className="flex items-center">
              <Layers className="mr-2" size={16} />
              <span>Levels</span>
            </div>
          </Button>
          <Button
            variant={gameMode === 'challenge' ? 'default' : 'ghost'}
            className={cn(
              "flex-1 py-4 sm:py-3 px-4 rounded-md font-medium transition-all touch-manipulation min-h-[50px]",
              gameMode === 'challenge' 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "text-slate-400 hover:text-white hover:bg-slate-600"
            )}
            onClick={() => setGameMode('challenge')}
          >
            <div className="flex items-center">
              <Infinity className="mr-2" size={16} />
              <span>Challenge</span>
            </div>
          </Button>
        </div>

        {/* Pattern Display Area */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-xl font-semibold mb-4">Remember the pattern!</h2>
          <p className="text-slate-300 text-base sm:text-slate-400 sm:text-sm mb-4">{getPhaseText()}</p>
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 mb-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
          
          {/* Loading State */}
          {isLoading && (
            <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                <p className="text-blue-200 text-sm">Preparing pattern...</p>
              </div>
            </div>
          )}
          
          {/* Pattern Sequence Display */}
          {gameMode === 'levels' && gamePhase === 'showing' && pattern.length > 0 && (
            <div className="bg-slate-700 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Memorize this sequence:</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {pattern.map((color: Color, index: number) => (
                  <div
                    key={index}
                    className={cn(
                      "w-12 h-12 sm:w-10 sm:h-10 border-2 flex items-center justify-center text-sm font-bold transition-all duration-300",
                      color === 'green' 
                        ? "bg-green-600 border-green-500 text-white rounded-full" 
                        : "bg-red-600 border-red-500 text-white rounded-lg",
                      index < patternProgress && "ring-4 ring-yellow-400 ring-opacity-70 scale-110"
                    )}
                    aria-label={`${color} ${color === 'green' ? 'circle' : 'square'} - position ${index + 1}`}
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

          {/* Challenge Mode - Initial Showing */}
          {gameMode === 'challenge' && gamePhase === 'showing' && challengeSequence.length > 0 && (
            <div className="bg-gradient-to-r from-purple-700 to-blue-700 rounded-lg p-4 mb-4 border-2 border-purple-500">
              <h3 className="text-sm font-medium text-white mb-3">Rolling Sequence Challenge - Memorize the initial pattern:</h3>
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                {challengeSequence.map((color: Color, index: number) => (
                  <div
                    key={index}
                    className={cn(
                      "w-12 h-12 border-2 flex items-center justify-center text-sm font-bold transition-all duration-500",
                      color === 'green' 
                        ? "bg-green-600 border-green-400 text-white rounded-full" 
                        : "bg-red-600 border-red-400 text-white rounded-lg"
                    )}
                    aria-label={`${color} ${color === 'green' ? 'circle' : 'square'} - position ${index + 1}`}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <div className="text-xs text-purple-200">
                  Rolling challenge starting soon...
                </div>
              </div>
            </div>
          )}

          {/* Challenge Mode - Rolling Sequence */}
          {gameMode === 'challenge' && gamePhase === 'playing' && challengePhase === 'guessing' && (
            <div className="bg-gradient-to-r from-red-700 to-orange-700 rounded-lg p-4 mb-4 border-2 border-red-500">
              <h3 className="text-sm font-medium text-white mb-3">🎯 ROLLING SEQUENCE - Guess the missing color!</h3>
              
              {/* Show visible colors with hidden slot */}
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                {/* Show hidden color slot */}
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-yellow-400 bg-gray-800 flex items-center justify-center text-sm font-bold animate-pulse">
                  <span className="text-yellow-400">?</span>
                </div>
                
                {/* Show visible colors */}
                {challengeVisibleColors.map((color: Color, index: number) => (
                  <div
                    key={`visible-${challengeCurrentIndex}-${index}`}
                    className={cn(
                      "w-12 h-12 border-2 flex items-center justify-center text-sm font-bold transition-all duration-300",
                      color === 'green' 
                        ? "bg-green-600 border-green-400 text-white rounded-full" 
                        : "bg-red-600 border-red-400 text-white rounded-lg"
                    )}
                    aria-label={`${color} ${color === 'green' ? 'circle' : 'square'} - position ${index + challengeCurrentIndex + 2}`}
                  >
                    {index + challengeCurrentIndex + 2}
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-300 mb-1">
                  ⏰ {challengeGuessTimer} seconds left!
                </div>
                <div className="text-xs text-orange-200">
                  Position {challengeCurrentIndex + 1} | Survived: {currentScore} seconds
                </div>
                <div className="text-xs text-orange-300 mt-1">
                  Remember: What color was in the hidden position?
                </div>
              </div>
            </div>
          )}

          {/* Memory Challenge Info - Show during waiting/playing phases for levels */}
          {gameMode === 'levels' && (gamePhase === 'waiting' || gamePhase === 'playing') && (
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
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {/* Green Button */}
          <Button
            data-color="green"
            className={cn(
              "w-full h-40 sm:h-36 lg:h-32 rounded-xl shadow-lg border-4 text-xl lg:text-2xl font-bold transition-all duration-200 min-h-[160px] sm:min-h-[144px]",
              "bg-green-600 hover:bg-green-500 active:bg-green-700 border-green-500 text-white",
              "transform hover:scale-105 active:scale-95 touch-manipulation active:ring-4 active:ring-green-300",
              gamePhase !== 'playing' && "opacity-40 cursor-not-allowed grayscale",
              keyboardPressed === 'green' && "ring-4 ring-green-300 scale-95"
            )}
            onClick={() => handleColorClick('green')}
            disabled={gamePhase !== 'playing'}
            aria-label="Green button - Circle pattern - Press Q"
          >
            <div className="flex flex-col items-center space-y-2 sm:space-y-1">
              {/* Circle pattern for color-blind accessibility */}
              <div className="w-14 h-14 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full bg-white border-4 border-green-200 opacity-90 flex items-center justify-center">
                <div className="w-7 h-7 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full bg-green-600" />
              </div>
              <span className="text-lg lg:text-xl font-bold">GREEN</span>
              <div className="text-xs text-green-200 opacity-75">Press Q</div>
            </div>
          </Button>
          
          {/* Red Button */}
          <Button
            data-color="red"
            className={cn(
              "w-full h-40 sm:h-36 lg:h-32 rounded-xl shadow-lg border-4 text-xl lg:text-2xl font-bold transition-all duration-200 min-h-[160px] sm:min-h-[144px]",
              "bg-red-600 hover:bg-red-500 active:bg-red-700 border-red-500 text-white",
              "transform hover:scale-105 active:scale-95 touch-manipulation active:ring-4 active:ring-red-300",
              gamePhase !== 'playing' && "opacity-40 cursor-not-allowed grayscale",
              keyboardPressed === 'red' && "ring-4 ring-red-300 scale-95"
            )}
            onClick={() => handleColorClick('red')}
            disabled={gamePhase !== 'playing'}
            aria-label="Red button - Square pattern - Press P"
          >
            <div className="flex flex-col items-center space-y-2 sm:space-y-1">
              {/* Square pattern for color-blind accessibility */}
              <div className="w-14 h-14 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-lg bg-white border-4 border-red-200 opacity-90 flex items-center justify-center">
                <div className="w-7 h-7 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-red-600 rounded-sm" />
              </div>
              <span className="text-lg lg:text-xl font-bold">RED</span>
              <div className="text-xs text-red-200 opacity-75">Press P</div>
            </div>
          </Button>
        </div>

        {/* Progress Bar - Only for levels mode */}
        {gameMode === 'levels' && (
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
        )}

        {/* Challenge Mode Score Display */}
        {gameMode === 'challenge' && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg p-4 border border-purple-500">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-300 mb-1">
                  {currentScore} seconds
                </div>
                <div className="text-sm text-purple-400">
                  Survival Time
                </div>
              </div>
            </div>
          </div>
        )}

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
