import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Trophy, ListOrdered, Unlock, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@shared/schema";

interface GameSidebarProps {
  gameState: any;
}

export default function GameSidebar({ gameState }: GameSidebarProps) {
  const {
    currentLevel,
    unlockedLevels,
    secretCode,
    setSecretCode,
    selectLevel,
    submitSecretCode,
    submitScore,
    levelCodes,
    currentScore
  } = gameState;

  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard'],
  });

  const maxLevel = 20; // Maximum number of levels
  const levels = Array.from({ length: maxLevel }, (_, i) => i + 1);

  return (
    <div className="w-full lg:w-80 bg-slate-800 border-t lg:border-t-0 lg:border-l border-slate-700 p-4 lg:p-6 overflow-y-auto">
      {/* Level Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-slate-50">
          <ListOrdered className="text-blue-400 mr-2" size={20} />
          Levels
        </h3>
        
        <div className="grid grid-cols-4 gap-2 mb-4">
          {levels.map((level) => {
            const isUnlocked = level <= unlockedLevels;
            const isCurrent = level === currentLevel;
            const isCompleted = level < unlockedLevels;
            
            return (
              <Button
                key={level}
                variant="outline"
                size="sm"
                className={cn(
                  "w-12 h-12 rounded-lg font-bold text-sm transition-all",
                  isCompleted && "bg-green-600 hover:bg-green-700 text-white border-green-500",
                  isCurrent && !isCompleted && "bg-blue-600 hover:bg-blue-700 text-white border-blue-500",
                  !isUnlocked && "bg-slate-600 text-slate-400 cursor-not-allowed border-slate-500",
                  isUnlocked && !isCurrent && !isCompleted && "bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
                )}
                onClick={() => selectLevel(level)}
                disabled={!isUnlocked}
              >
                {level}
              </Button>
            );
          })}
        </div>

        {/* Secret Code Input */}
        <Card className="bg-slate-700 border-slate-600">
          <CardContent className="p-4">
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Secret Level Code
            </label>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter code..."
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                className="flex-1 bg-slate-600 border-slate-500 text-slate-100 placeholder-slate-400 focus:border-blue-500"
              />
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4"
                onClick={submitSecretCode}
                disabled={!secretCode.trim()}
              >
                <Unlock size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Level Info */}
      {levelCodes[currentLevel] && (
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500 mb-8">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2 text-white">Level {currentLevel} Complete!</h4>
            <div className="text-sm text-blue-100 space-y-1">
              <p>Secret Code: <span className="font-mono font-bold">{levelCodes[currentLevel]}</span></p>
              <p>Difficulty: {currentLevel <= 5 ? 'Easy' : currentLevel <= 10 ? 'Medium' : currentLevel <= 15 ? 'Hard' : 'Expert'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center text-slate-50">
          <Trophy className="text-amber-400 mr-2" size={20} />
          Leaderboard
        </h3>
        
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-700 p-3 rounded-lg animate-pulse">
                <div className="h-4 bg-slate-600 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <Card 
                key={entry.id} 
                className={cn(
                  "border-slate-600 transition-all",
                  index === 0 && "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-400",
                  index > 0 && "bg-slate-700"
                )}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={cn(
                        "text-lg font-bold",
                        index === 0 ? "text-white" : "text-slate-400"
                      )}>
                        {index + 1}
                      </span>
                      <div>
                        <div className={cn(
                          "font-medium",
                          index === 0 ? "text-white" : "text-slate-200"
                        )}>
                          {entry.playerName}
                        </div>
                        <div className={cn(
                          "text-xs",
                          index === 0 ? "text-amber-100" : "text-slate-400"
                        )}>
                          Level {entry.level}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "font-bold",
                        index === 0 ? "text-white" : "text-slate-200"
                      )}>
                        {entry.score.toLocaleString()}
                      </div>
                      <div className={cn(
                        "text-xs",
                        index === 0 ? "text-amber-100" : "text-slate-400"
                      )}>
                        points
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Submit Score Button */}
        <Button
          className="w-full mt-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium"
          onClick={submitScore}
          disabled={currentScore === 0}
        >
          <Upload className="mr-2" size={16} />
          Submit Score
        </Button>
      </div>
    </div>
  );
}
