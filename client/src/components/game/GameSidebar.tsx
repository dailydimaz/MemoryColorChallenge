import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Trophy, ListOrdered, Unlock, User, Timer, Target } from "lucide-react";
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
    levelCodes,
    currentScore,
    gameMode,
    playerName,
    setPlayerName
  } = gameState;

  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard'],
  });

  const maxLevel = 20; // Maximum number of levels
  const levels = Array.from({ length: maxLevel }, (_, i) => i + 1);

  return (
    <div className="w-full lg:w-80 bg-slate-800 border-t lg:border-t-0 lg:border-l border-slate-700 p-4 lg:p-6 overflow-y-auto">
      {/* Player Name Input */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center text-slate-50">
          <User className="text-blue-400 mr-2" size={20} />
          Player Name
        </h3>
        <Card className="bg-slate-700 border-slate-600">
          <CardContent className="p-4">
            <Input
              placeholder="Enter your name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
              className="bg-slate-600 border-slate-500 text-slate-100 placeholder-slate-400 focus:border-blue-500"
              maxLength={20}
            />
            <div className="text-xs text-slate-400 mt-2">
              {playerName ? `Playing as: ${playerName}` : 'Anonymous Player'}
            </div>
          </CardContent>
        </Card>
      </div>

      {gameMode === 'levels' ? (
        <>
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
                <div className="flex space-x-2 mb-3">
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
                <div className="text-xs text-slate-400">
                  Examples: MEMO (Level 1), PTRN (Level 2), CLRS (Level 3)
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Level Info */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500 mb-8">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 text-white">Level {currentLevel}</h4>
              <div className="text-sm text-blue-100 space-y-1">
                <p>Colors: <span className="font-bold">{3 + currentLevel}</span></p>
                <p>Time: <span className="font-bold">{30 + currentLevel * 3}s</span></p>
                <p>Difficulty: <span className="font-bold">
                  {currentLevel <= 3 ? 'Easy' : 
                   currentLevel <= 6 ? 'Medium' : 
                   currentLevel <= 10 ? 'Hard' : 
                   currentLevel <= 15 ? 'Expert' : 'Master'}
                </span></p>
                {levelCodes[currentLevel] && (
                  <p>Secret Code: <span className="font-mono font-bold">{levelCodes[currentLevel]}</span></p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Level Mode Leaderboard */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center text-slate-50">
              <Trophy className="text-amber-400 mr-2" size={20} />
              Top Scores
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
          </div>
        </>
      ) : (
        <>
          {/* Challenge Mode Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-slate-50">
              <Target className="text-purple-400 mr-2" size={20} />
              Challenge Stats
            </h3>
            <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-500">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-300 mb-1">
                    {currentScore} seconds
                  </div>
                  <div className="text-sm text-purple-400">
                    Current Survival Time
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Challenge Leaderboard - Survival Times */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center text-slate-50">
              <Timer className="text-amber-400 mr-2" size={20} />
              Survival Leaderboard
            </h3>
            
            {/* Mock challenge leaderboard - longest survival times */}
            <div className="space-y-2">
              {[
                { name: playerName || "You", time: currentScore, isCurrent: true },
                { name: "SurvivalMaster", time: 127, isCurrent: false },
                { name: "TimeKeeper", time: 95, isCurrent: false },
                { name: "MemoryPro", time: 83, isCurrent: false },
                { name: "PatternKing", time: 67, isCurrent: false },
              ]
              .sort((a, b) => b.time - a.time)
              .slice(0, 5)
              .map((entry, index) => (
                <Card 
                  key={index} 
                  className={cn(
                    "border-slate-600 transition-all",
                    index === 0 && "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-400",
                    entry.isCurrent && index > 0 && "bg-purple-800 border-purple-500",
                    !entry.isCurrent && index > 0 && "bg-slate-700"
                  )}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={cn(
                          "text-lg font-bold",
                          index === 0 ? "text-white" : 
                          entry.isCurrent ? "text-purple-300" : "text-slate-400"
                        )}>
                          {index + 1}
                        </span>
                        <div>
                          <div className={cn(
                            "font-medium",
                            index === 0 ? "text-white" : 
                            entry.isCurrent ? "text-purple-200" : "text-slate-200"
                          )}>
                            {entry.name}
                            {entry.isCurrent && " (You)"}
                          </div>
                          <div className={cn(
                            "text-xs",
                            index === 0 ? "text-amber-100" : 
                            entry.isCurrent ? "text-purple-300" : "text-slate-400"
                          )}>
                            Survival Challenge
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "font-bold",
                          index === 0 ? "text-white" : 
                          entry.isCurrent ? "text-purple-200" : "text-slate-200"
                        )}>
                          {entry.time}s
                        </div>
                        <div className={cn(
                          "text-xs",
                          index === 0 ? "text-amber-100" : 
                          entry.isCurrent ? "text-purple-300" : "text-slate-400"
                        )}>
                          survived
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="bg-slate-700 border-slate-600 mt-4">
              <CardContent className="p-3 text-center">
                <div className="text-xs text-slate-400">
                  🏆 Beat the longest survival time to claim #1!
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
