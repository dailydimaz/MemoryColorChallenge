import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertLeaderboardEntry } from "@shared/schema";

type GameMode = 'levels' | 'challenge';
type GamePhase = 'idle' | 'showing' | 'waiting' | 'playing' | 'complete' | 'failed';
type Color = 'green' | 'red';

export function useGameState() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Game state
  const [gameMode, setGameMode] = useState<GameMode>('levels');
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentScore, setCurrentScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [pattern, setPattern] = useState<Color[]>([]);
  const [userInput, setUserInput] = useState<Color[]>([]);
  const [patternProgress, setPatternProgress] = useState(0);
  const [unlockedLevels, setUnlockedLevels] = useState(1);
  const [secretCode, setSecretCode] = useState('');
  const [levelCodes, setLevelCodes] = useState<Record<number, string>>({});
  
  // Modal states
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [isLevelCompleteModalOpen, setIsLevelCompleteModalOpen] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  
  // Stats for modals
  const [finalScore, setFinalScore] = useState(0);
  const [levelsCompleted, setLevelsCompleted] = useState(0);
  const [levelSecretCode, setLevelSecretCode] = useState('');
  const [timeBonus, setTimeBonus] = useState(0);
  const [accuracyBonus, setAccuracyBonus] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  
  // Refs for timers
  const timerRef = useRef<NodeJS.Timeout>();
  const patternTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Load game state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('memoryGameState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setCurrentLevel(state.currentLevel || 1);
        setCurrentScore(state.currentScore || 0);
        setUnlockedLevels(state.unlockedLevels || 1);
        setLevelCodes(state.levelCodes || {});
      } catch (error) {
        console.error('Failed to load game state:', error);
      }
    }
  }, []);
  
  // Save game state to localStorage
  const saveGameState = useCallback(() => {
    const state = {
      currentLevel,
      currentScore,
      unlockedLevels,
      levelCodes
    };
    localStorage.setItem('memoryGameState', JSON.stringify(state));
  }, [currentLevel, currentScore, unlockedLevels, levelCodes]);
  
  useEffect(() => {
    saveGameState();
  }, [saveGameState]);
  
  // Timer management
  useEffect(() => {
    if (gameMode === 'levels' && gamePhase === 'playing' && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (gameMode === 'levels' && timeRemaining === 0 && gamePhase === 'playing') {
      handleGameOver();
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [gameMode, gamePhase, timeRemaining]);
  
  // Generate random pattern
  const generatePattern = useCallback((length: number): Color[] => {
    const colors: Color[] = ['green', 'red'];
    return Array.from({ length }, () => colors[Math.floor(Math.random() * colors.length)]);
  }, []);
  
  // Generate secret code
  const generateSecretCode = useCallback((): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }, []);
  
  // Start new pattern
  const startNewPattern = useCallback(() => {
    if (gamePhase === 'showing' || gamePhase === 'playing') return;
    
    if (gameMode === 'challenge') {
      // Challenge mode: Start with a rolling sequence
      const initialLength = 3;
      const newPattern = generatePattern(initialLength);
      setPattern(newPattern);
      setUserInput([]);
      setPatternProgress(0);
      setGamePhase('showing');
      setTimeRemaining(0); // Use score as elapsed time
      setCurrentScore(0); // Reset score to 0 (will track time)
      
      // Show pattern sequence
      showPatternSequence(newPattern);
    } else {
      // Levels mode
      const patternLength = Math.min(3 + currentLevel, 10);
      const newPattern = generatePattern(patternLength);
      setPattern(newPattern);
      setUserInput([]);
      setPatternProgress(0);
      setGamePhase('showing');
      setTimeRemaining(30 + currentLevel * 5);
      
      // Show pattern sequence
      showPatternSequence(newPattern);
    }
  }, [gamePhase, gameMode, currentLevel, generatePattern]);
  


  // Handle game over (levels mode)
  const handleGameOver = useCallback(() => {
    setGamePhase('failed');
    setFinalScore(currentScore);
    setLevelsCompleted(unlockedLevels - 1);
    setIsGameOverModalOpen(true);
    
    // Clear any running timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (patternTimeoutRef.current) clearTimeout(patternTimeoutRef.current);
  }, [currentScore, unlockedLevels]);

  // Handle level completion
  const handleLevelComplete = useCallback((earnedScore: number) => {
    const newSecretCode = generateSecretCode();
    const newLevelCodes = { ...levelCodes, [currentLevel]: newSecretCode };
    
    setLevelCodes(newLevelCodes);
    setLevelSecretCode(newSecretCode);
    setTimeBonus(Math.round(timeRemaining * 5));
    setAccuracyBonus(100);
    setTotalScore(earnedScore + Math.round(timeRemaining * 5) + 100);
    
    // Unlock next level
    if (currentLevel >= unlockedLevels) {
      setUnlockedLevels(currentLevel + 1);
    }
    
    setIsLevelCompleteModalOpen(true);
    
    toast({
      title: "Level Complete!",
      description: `Secret code: ${newSecretCode}`,
    });
  }, [currentLevel, unlockedLevels, timeRemaining, levelCodes, generateSecretCode, toast]);

  // Handle pattern completion
  const handlePatternComplete = useCallback(() => {
    const baseScore = pattern.length * 10;
    const timeMultiplier = Math.max(0.5, timeRemaining / 30);
    const levelMultiplier = gameMode === 'levels' ? currentLevel : Math.floor(currentScore / 100) + 1;
    const earnedScore = Math.round(baseScore * timeMultiplier * levelMultiplier);
    
    setCurrentScore(prev => prev + earnedScore);
    setGamePhase('complete');
    
    if (gameMode === 'levels') {
      handleLevelComplete(earnedScore);
    } else {
      // In challenge mode, automatically start next pattern
      setTimeout(() => {
        startNewPattern();
      }, 1500);
    }
  }, [pattern.length, timeRemaining, gameMode, currentLevel, currentScore, startNewPattern, handleLevelComplete]);

  // Show pattern sequence with progress indicator (for levels mode)
  const showPatternSequence = useCallback((pattern: Color[]) => {
    setPatternProgress(0);
    let index = 0;
    
    const showNext = () => {
      if (index >= pattern.length) {
        setGamePhase('waiting');
        patternTimeoutRef.current = setTimeout(() => {
          setGamePhase('playing');
        }, 2000);
        return;
      }
      
      setPatternProgress(index + 1);
      index++;
      patternTimeoutRef.current = setTimeout(showNext, 800);
    };
    
    showNext();
  }, []);
  
  // Handle color button click
  const handleColorClick = useCallback((color: Color) => {
    if (gamePhase !== 'playing') return;
    
    if (gameMode === 'challenge') {
      // Challenge mode: For now, use similar logic to levels but continuous
      const newUserInput = [...userInput, color];
      setUserInput(newUserInput);
      
      // Check if input matches pattern so far
      const isCorrect = pattern[newUserInput.length - 1] === color;
      
      if (!isCorrect) {
        handleGameOver();
        return;
      }
      
      // In challenge mode, keep adding to the pattern when completed
      if (newUserInput.length === pattern.length) {
        // Add a new color and continue
        const nextColor = generatePattern(1)[0];
        setPattern(prev => [...prev, nextColor]);
        setCurrentScore(prev => prev + 10);
        // Don't reset userInput, continue building the sequence
      }
    } else {
      // Levels mode logic
      const newUserInput = [...userInput, color];
      setUserInput(newUserInput);
      
      // Check if input matches pattern so far
      const isCorrect = pattern[newUserInput.length - 1] === color;
      
      if (!isCorrect) {
        handleGameOver();
        return;
      }
      
      // Check if pattern is complete
      if (newUserInput.length === pattern.length) {
        handlePatternComplete();
      }
    }
  }, [gamePhase, gameMode, userInput, pattern, generatePattern, handleGameOver, handlePatternComplete]);
  
  // Restart game
  const restartGame = useCallback(() => {
    setGamePhase('idle');
    setCurrentScore(0);
    setPattern([]);
    setUserInput([]);
    setTimeRemaining(30);
    setIsGameOverModalOpen(false);
    
    if (gameMode === 'levels') {
      setCurrentLevel(1);
    }
  }, [gameMode]);
  
  // Next level
  const nextLevel = useCallback(() => {
    setCurrentLevel(prev => prev + 1);
    setGamePhase('idle');
    setPattern([]);
    setUserInput([]);
    setIsLevelCompleteModalOpen(false);
  }, []);
  
  // Select level
  const selectLevel = useCallback((level: number) => {
    if (level <= unlockedLevels) {
      setCurrentLevel(level);
      setGamePhase('idle');
      setPattern([]);
      setUserInput([]);
      setTimeRemaining(30 + level * 5);
    }
  }, [unlockedLevels]);
  
  // Submit secret code
  const submitSecretCode = useCallback(() => {
    const targetLevel = Object.entries(levelCodes).find(([_, code]) => code === secretCode.toUpperCase());
    
    if (targetLevel) {
      const level = parseInt(targetLevel[0]) + 1;
      setCurrentLevel(level);
      setUnlockedLevels(Math.max(unlockedLevels, level));
      setSecretCode('');
      setGamePhase('idle');
      
      toast({
        title: "Secret code accepted!",
        description: `Unlocked level ${level}`,
      });
    } else {
      toast({
        title: "Invalid secret code",
        description: "Please check your code and try again",
        variant: "destructive",
      });
    }
  }, [secretCode, levelCodes, unlockedLevels, toast]);
  
  // Leaderboard mutation
  const submitScoreMutation = useMutation({
    mutationFn: async (entry: InsertLeaderboardEntry) => {
      const response = await apiRequest('POST', '/api/leaderboard', entry);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      toast({
        title: "Score submitted!",
        description: "Your score has been added to the leaderboard",
      });
    },
    onError: () => {
      toast({
        title: "Failed to submit score",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });
  
  // Submit score to leaderboard
  const submitScore = useCallback(() => {
    const playerName = prompt("Enter your name for the leaderboard:");
    if (playerName && currentScore > 0) {
      submitScoreMutation.mutate({
        playerName: playerName.trim(),
        score: currentScore,
        level: gameMode === 'levels' ? currentLevel : Math.floor(currentScore / 100),
        timeCompleted: Date.now(),
      });
    }
  }, [currentScore, currentLevel, gameMode, submitScoreMutation]);
  
  // Show instructions
  const showInstructions = useCallback(() => {
    setIsInstructionsModalOpen(true);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (patternTimeoutRef.current) clearTimeout(patternTimeoutRef.current);
    };
  }, []);
  
  return {
    // Game state
    gameMode,
    setGameMode,
    gamePhase,
    currentLevel,
    currentScore,
    timeRemaining,
    pattern,
    userInput,
    patternProgress,
    unlockedLevels,
    secretCode,
    setSecretCode,
    levelCodes,
    

    
    // Modal states
    isGameOverModalOpen,
    setIsGameOverModalOpen,
    isLevelCompleteModalOpen,
    setIsLevelCompleteModalOpen,
    isInstructionsModalOpen,
    setIsInstructionsModalOpen,
    
    // Modal data
    finalScore,
    levelsCompleted,
    levelSecretCode,
    timeBonus,
    accuracyBonus,
    totalScore,
    
    // Actions
    handleColorClick,
    startNewPattern,
    restartGame,
    nextLevel,
    selectLevel,
    submitSecretCode,
    submitScore,
    showInstructions,
  };
}
