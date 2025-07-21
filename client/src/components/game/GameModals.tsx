import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, Home, ArrowRight, Play, Gamepad2, Layers, Infinity, Trophy } from "lucide-react";

interface GameModalsProps {
  gameState: any;
}

export default function GameModals({ gameState }: GameModalsProps) {
  const {
    isGameOverModalOpen,
    setIsGameOverModalOpen,
    isLevelCompleteModalOpen,
    setIsLevelCompleteModalOpen,
    isInstructionsModalOpen,
    setIsInstructionsModalOpen,
    finalScore,
    levelsCompleted,
    levelSecretCode,
    timeBonus,
    accuracyBonus,
    totalScore,
    restartGame,
    nextLevel,
    gameMode
  } = gameState;

  return (
    <>
      {/* Game Over Modal */}
      <Dialog open={isGameOverModalOpen} onOpenChange={setIsGameOverModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-50 max-w-md">
          <DialogHeader>
            <div className="text-center">
              <div className="text-6xl mb-4">{gameMode === 'challenge' ? '⏰' : '😞'}</div>
              <DialogTitle className="text-2xl font-bold mb-4">
                {gameMode === 'challenge' ? 'Challenge Ended!' : 'Game Over!'}
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-4">
              {gameMode === 'challenge' ? (
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{finalScore} seconds</div>
                  <div className="text-sm text-slate-400">Survival Time</div>
                  <div className="text-xs text-slate-500 mt-2">
                    You survived the rolling sequence challenge!
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{finalScore}</div>
                    <div className="text-sm text-slate-400">Final Score</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{levelsCompleted}</div>
                    <div className="text-sm text-slate-400">Levels Completed</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex space-x-4 mt-6">
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              onClick={restartGame}
            >
              <RotateCcw className="mr-2" size={16} />
              Try Again
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
              onClick={() => setIsGameOverModalOpen(false)}
            >
              <Home className="mr-2" size={16} />
              Menu
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Level Complete Modal */}
      <Dialog open={isLevelCompleteModalOpen} onOpenChange={setIsLevelCompleteModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-50 max-w-md">
          <DialogHeader>
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <DialogTitle className="text-2xl font-bold mb-4">Level Complete!</DialogTitle>
            </div>
          </DialogHeader>
          
          <Card className="bg-gradient-to-r from-green-600 to-blue-600 border-green-500">
            <CardContent className="p-4 text-center">
              <div className="text-white">
                <div className="text-lg font-semibold mb-2">Secret Code Unlocked!</div>
                <div className="text-3xl font-mono font-bold tracking-wider">{levelSecretCode}</div>
                <div className="text-sm opacity-90 mt-2">Use this code to skip levels</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-amber-400">+{timeBonus}</div>
                  <div className="text-xs text-slate-400">Time Bonus</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-400">+{accuracyBonus}</div>
                  <div className="text-xs text-slate-400">Accuracy</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-400">{totalScore}</div>
                  <div className="text-xs text-slate-400">Total Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex space-x-4 mt-6">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
              onClick={nextLevel}
            >
              <ArrowRight className="mr-2" size={16} />
              Next Level
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
              onClick={() => setIsLevelCompleteModalOpen(false)}
            >
              <Home className="mr-2" size={16} />
              Menu
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Instructions Modal */}
      <Dialog open={isInstructionsModalOpen} onOpenChange={setIsInstructionsModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-50 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">How to Play</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-blue-400 flex items-center">
                <Gamepad2 className="mr-2" size={20} />
                Basic Gameplay
              </h3>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li>• Watch the color pattern sequence carefully</li>
                <li>• Remember the order of green and red button flashes</li>
                <li>• When it's your turn, click the buttons in the same order</li>
                <li>• Use keyboard shortcuts: <span className="font-mono bg-slate-600 px-1 rounded">Q</span> for Green, <span className="font-mono bg-slate-600 px-1 rounded">P</span> for Red</li>
                <li>• Complete the pattern correctly to advance</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-green-400 flex items-center">
                <Layers className="mr-2" size={20} />
                Level Mode
              </h3>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li>• Level 1: 4 colors, Level 2: 5 colors, etc.</li>
                <li>• Each level gets progressively harder</li>
                <li>• Time limit increases with difficulty</li>
                <li>• Fixed secret codes for each level</li>
                <li>• Share codes with friends!</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-purple-400 flex items-center">
                <Infinity className="mr-2" size={20} />
                Challenge Mode
              </h3>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li>• Endless gameplay with increasing difficulty</li>
                <li>• Score points based on accuracy and speed</li>
                <li>• Compete on the global leaderboard</li>
                <li>• No level restrictions - play as long as you can!</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-amber-400 flex items-center">
                <Trophy className="mr-2" size={20} />
                Scoring
              </h3>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li>• Time Bonus: Faster completion = more points</li>
                <li>• Accuracy Bonus: Perfect runs earn extra points</li>
                <li>• Level Multiplier: Higher levels = higher multipliers</li>
                <li>• Combo Bonus: Chain successful patterns together</li>
              </ul>
            </div>
          </div>

          <Button
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            onClick={() => setIsInstructionsModalOpen(false)}
          >
            <Play className="mr-2" size={16} />
            Start Playing
          </Button>
        </DialogContent>
      </Dialog>

    </>
  );
}
