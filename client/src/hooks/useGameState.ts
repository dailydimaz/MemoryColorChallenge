import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

type GameMode = 'levels' | 'challenge';
type GamePhase = 'idle' | 'showing' | 'waiting' | 'playing' | 'complete' | 'failed';
type Color = 'green' | 'red';

export function useGameState() {
  const { toast } = useToast();
  
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
  
  // Challenge mode state
  const [challengePhase, setChallengePhase] = useState<'showing' | 'guessing'>('showing');
  const [challengeGuessTimer, setChallengeGuessTimer] = useState(3);
  const [challengeCurrentIndex, setChallengeCurrentIndex] = useState(0);
  const [challengeSequence, setChallengeSequence] = useState<Color[]>([]);
  const [challengeStartTime, setChallengeStartTime] = useState(0);
  const [challengeVisibleColors, setChallengeVisibleColors] = useState<Color[]>([]);
  
  // Player session state
  const [playerName, setPlayerName] = useState('');
  
  // Modal states
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [isLevelCompleteModalOpen, setIsLevelCompleteModalOpen] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  
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
        setPlayerName(state.playerName || '');
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
      levelCodes,
      playerName
    };
    localStorage.setItem('memoryGameState', JSON.stringify(state));
  }, [currentLevel, currentScore, unlockedLevels, levelCodes, playerName]);
  
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
  
  // Fixed secret codes for each level - same for all players
  const getSecretCodeForLevel = useCallback((level: number): string => {
    const secretCodes = [
      'MEMO', 'PTRN', 'CLRS', 'MIND', 'GLOW', // Levels 1-5
      'SYNC', 'FLUX', 'VIBE', 'CORE', 'APEX', // Levels 6-10
      'ZEST', 'NOVA', 'EPIC', 'RUSH', 'BOLT', // Levels 11-15
      'HERO', 'SAGE', 'PEAK', 'PURE', 'ZEN'   // Levels 16-20
    ];
    return secretCodes[level - 1] || `LVL${level}`;
  }, []);
  
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
  
  // Handle game over
  const handleGameOver = useCallback(() => {
    setGamePhase('failed');
    
    if (gameMode === 'challenge') {
      // Calculate survival time in seconds
      const survivalTime = Math.floor((Date.now() - challengeStartTime) / 1000);
      setFinalScore(survivalTime);
      setCurrentScore(survivalTime);
    } else {
      // Levels mode
      setFinalScore(currentScore);
      setLevelsCompleted(unlockedLevels - 1);
    }
    
    setIsGameOverModalOpen(true);
    
    // Clear any running timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (patternTimeoutRef.current) clearTimeout(patternTimeoutRef.current);
  }, [gameMode, currentScore, unlockedLevels, challengeStartTime]);
  
  // Start the 3-second timer for challenge mode guessing
  const startChallengeGuessTimer = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current);
    
    setChallengeGuessTimer(3);
    
    const countdown = () => {
      setChallengeGuessTimer(prev => {
        if (prev <= 1) {
          // Time's up - game over
          handleGameOver();
          return 0;
        }
        timerRef.current = setTimeout(countdown, 1000);
        return prev - 1;
      });
    };
    
    // Start countdown immediately, then continue every second
    countdown();
  }, [handleGameOver]);
  
  // Start rolling sequence for challenge mode
  const startRollingSequence = useCallback((sequence: Color[]) => {
    setGamePhase('playing');
    setChallengePhase('guessing');
    setChallengeCurrentIndex(0);
    
    // IMPORTANT: Start the challenge timer immediately to prevent exploitation
    // This ensures survival time starts counting from when rolling begins, not when user clicks
    setChallengeStartTime(Date.now());
    
    // Hide the first color and start guessing timer
    const visibleColors = sequence.slice(1);
    setChallengeVisibleColors(visibleColors);
    
    // Start 3-second timer for first guess
    setChallengeGuessTimer(3);
    startChallengeGuessTimer();
  }, [startChallengeGuessTimer]);

  // Continue rolling sequence after correct guess
  const continueRollingSequence = useCallback(() => {
    const currentSequence = [...challengeSequence];
    const nextIndex = challengeCurrentIndex + 1;
    
    // Add 1-2 new colors to keep the sequence growing
    const newColor1 = generatePattern(1)[0];
    const newColor2 = generatePattern(1)[0];
    currentSequence.push(newColor1, newColor2);
    setChallengeSequence(currentSequence);
    
    // Update visible colors (hide the current guess position, show the rest)
    // Always ensure at least 2-3 colors are visible for context
    const minVisibleStart = Math.max(0, nextIndex + 1);
    const visibleColors = currentSequence.slice(minVisibleStart);
    setChallengeVisibleColors(visibleColors);
    
    // Move to next position
    setChallengeCurrentIndex(nextIndex);
    
    // Start timer for next guess
    setChallengeGuessTimer(3);
    startChallengeGuessTimer();
  }, [challengeSequence, challengeCurrentIndex, generatePattern, startChallengeGuessTimer]);

  // Start new pattern
  const startNewPattern = useCallback(() => {
    if (gamePhase === 'showing' || gamePhase === 'playing') return;
    
    // Clear any existing timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (patternTimeoutRef.current) clearTimeout(patternTimeoutRef.current);
    
    if (gameMode === 'challenge') {
      // New rolling sequence challenge mode
      setCurrentScore(0);
      setChallengeCurrentIndex(0);
      setGamePhase('showing');
      
      // Start with initial sequence of 4 colors
      const initialSequence = generatePattern(4);
      setChallengeSequence(initialSequence);
      setChallengeVisibleColors([...initialSequence]);
      
      // Start the rolling sequence after a brief showing period
      // Timer will start when rolling begins, not here
      patternTimeoutRef.current = setTimeout(() => {
        startRollingSequence(initialSequence);
      }, 2000); // Show initial pattern for 2 seconds
      
    } else {
      // Levels mode - Progressive difficulty: Level 1 = 4 colors, Level 2 = 5 colors, etc.
      const patternLength = 3 + currentLevel; // Level 1 = 4, Level 2 = 5, Level 3 = 6, etc.
      const newPattern = generatePattern(patternLength);
      setPattern(newPattern);
      setUserInput([]);
      setPatternProgress(0);
      setGamePhase('showing');
      setTimeRemaining(30 + currentLevel * 3); // More challenging time pressure
      
      // Show pattern sequence
      showPatternSequence(newPattern);
    }
  }, [gamePhase, gameMode, currentLevel, generatePattern, startRollingSequence, showPatternSequence]);

  // Handle level completion
  const handleLevelComplete = useCallback((earnedScore: number) => {
    const newSecretCode = getSecretCodeForLevel(currentLevel);
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
  }, [currentLevel, unlockedLevels, timeRemaining, levelCodes, getSecretCodeForLevel, toast]);

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

  // Handle color button click
  const handleColorClick = useCallback((color: Color) => {
    if (gamePhase !== 'playing') return;
    
    if (gameMode === 'challenge') {
      // New rolling sequence challenge mode
      const expectedColor = challengeSequence[challengeCurrentIndex];
      
      if (color === expectedColor) {
        // Correct guess!
        // Clear the timer for this guess
        if (timerRef.current) clearTimeout(timerRef.current);
        
        // Update score with survival time
        const survivalTime = Math.floor((Date.now() - challengeStartTime) / 1000);
        setCurrentScore(survivalTime);
        
        // Continue the rolling sequence
        patternTimeoutRef.current = setTimeout(() => {
          continueRollingSequence();
        }, 500); // Brief pause before next round
        
      } else {
        // Wrong guess - game over
        handleGameOver();
        return;
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
  }, [gamePhase, gameMode, userInput, pattern, challengeSequence, challengeCurrentIndex, challengeStartTime, handleGameOver, handlePatternComplete, continueRollingSequence]);
  
  // Restart game
  const restartGame = useCallback(() => {
    setGamePhase('idle');
    setCurrentScore(0);
    setPattern([]);
    setUserInput([]);
    setTimeRemaining(30);
    setIsGameOverModalOpen(false);
    
    // Clear challenge mode state
    setChallengeSequence([]);
    setChallengeVisibleColors([]);
    setChallengeCurrentIndex(0);
    setChallengePhase('showing');
    setChallengeGuessTimer(3);
    setChallengeStartTime(0);
    
    if (gameMode === 'levels') {
      setCurrentLevel(1);
    }
    
    // Clear any running timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (patternTimeoutRef.current) clearTimeout(patternTimeoutRef.current);
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
      setTimeRemaining(30 + level * 3);
    }
  }, [unlockedLevels]);
  
  // Submit secret code
  const submitSecretCode = useCallback(() => {
    const inputCode = secretCode.toUpperCase().trim();
    
    // Find which level this code belongs to
    let targetLevel = 0;
    for (let level = 1; level <= 20; level++) {
      if (getSecretCodeForLevel(level) === inputCode) {
        targetLevel = level;
        break;
      }
    }
    
    if (targetLevel > 0) {
      setCurrentLevel(targetLevel);
      setUnlockedLevels(Math.max(unlockedLevels, targetLevel));
      setSecretCode('');
      setGamePhase('idle');
      
      toast({
        title: "Secret code accepted!",
        description: `Unlocked level ${targetLevel}`,
      });
    } else {
      toast({
        title: "Invalid secret code",
        description: "Please check your code and try again",
        variant: "destructive",
      });
    }
  }, [secretCode, unlockedLevels, getSecretCodeForLevel, toast]);
  
  
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
    
    // Challenge mode state
    challengePhase,
    challengeGuessTimer,
    challengeCurrentIndex,
    challengeSequence,
    challengeVisibleColors,
    
    // Modal states
    isGameOverModalOpen,
    setIsGameOverModalOpen,
    isLevelCompleteModalOpen,
    setIsLevelCompleteModalOpen,
    isInstructionsModalOpen,
    setIsInstructionsModalOpen,
    isLeaderboardModalOpen,
    setIsLeaderboardModalOpen,
    
    // Modal data
    finalScore,
    levelsCompleted,
    levelSecretCode,
    timeBonus,
    accuracyBonus,
    totalScore,
    
    // Player session
    playerName,
    setPlayerName,
    
    // Actions
    handleColorClick,
    startNewPattern,
    restartGame,
    nextLevel,
    selectLevel,
    submitSecretCode,
    showInstructions,
  };
}
