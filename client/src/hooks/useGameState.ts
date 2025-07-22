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
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Challenge mode state
  const [challengePhase, setChallengePhase] = useState<'showing' | 'guessing'>('showing');
  const [challengeGuessTimer, setChallengeGuessTimer] = useState(5);
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
  const displayTimerRef = useRef<NodeJS.Timeout>();
  
  // Load game state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('memoryGameState');
      if (savedState) {
        const state = JSON.parse(savedState);
        setCurrentLevel(state.currentLevel || 1);
        setCurrentScore(state.currentScore || 0);
        setUnlockedLevels(state.unlockedLevels || 1);
        setLevelCodes(state.levelCodes || {});
        setPlayerName(state.playerName || '');
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
      setError('Failed to load saved game data. Starting fresh.');
      // Clear corrupted data
      try {
        localStorage.removeItem('memoryGameState');
      } catch {
        // Ignore storage errors
      }
    }
  }, []);
  
  // Save game state to localStorage
  const saveGameState = useCallback(() => {
    try {
      const state = {
        currentLevel,
        currentScore,
        unlockedLevels,
        levelCodes,
        playerName
      };
      localStorage.setItem('memoryGameState', JSON.stringify(state));
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Failed to save game state:', error);
      setError('Unable to save game progress. Your progress may not be preserved.');
    }
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
  
  // Calculate current timer based on survival time (speed rush)
  const calculateCurrentTimer = useCallback((startTime?: number) => {
    const effectiveStartTime = startTime || challengeStartTime;
    // If challenge hasn't started yet, return initial timer
    if (effectiveStartTime === 0) {
      return 5;
    }
    const survivalTime = Math.floor((Date.now() - effectiveStartTime) / 1000);
    const timerReduction = Math.floor(survivalTime / 100); // Reduce 1s every 100s
    return Math.max(1, 5 - timerReduction); // Minimum 1 second
  }, [challengeStartTime]);

  // Generate random pattern with improved distribution (allow up to 3 consecutive same colors)
  const generatePattern = useCallback((length: number): Color[] => {
    const colors: Color[] = ['green', 'red'];
    const pattern: Color[] = [];
    
    for (let i = 0; i < length; i++) {
      if (i === 0) {
        // First color is random
        pattern.push(colors[Math.floor(Math.random() * colors.length)]);
      } else {
        // Avoid more than 3 consecutive same colors
        const lastColor = pattern[i - 1];
        const secondLastColor = i >= 2 ? pattern[i - 2] : null;
        const thirdLastColor = i >= 3 ? pattern[i - 3] : null;
        
        if (thirdLastColor && secondLastColor && lastColor === secondLastColor && secondLastColor === thirdLastColor) {
          // Force different color if last 3 were the same
          pattern.push(lastColor === 'green' ? 'red' : 'green');
        } else {
          // Random color with natural distribution
          pattern.push(colors[Math.floor(Math.random() * colors.length)]);
        }
      }
    }
    
    return pattern;
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
    console.log('handleGameOver called - gameMode:', gameMode, 'gamePhase:', gamePhase);
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
    if (displayTimerRef.current) clearTimeout(displayTimerRef.current);
  }, [gameMode, currentScore, unlockedLevels, challengeStartTime]);
  
  // Start the timer for challenge mode guessing (with speed rush)
  const startChallengeGuessTimer = useCallback(() => {
    // Clear any existing timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (displayTimerRef.current) clearTimeout(displayTimerRef.current);
    
    const currentTimer = calculateCurrentTimer();
    console.log('startChallengeGuessTimer - currentTimer:', currentTimer, 'challengeStartTime:', challengeStartTime);
    setChallengeGuessTimer(currentTimer);
    
    // Use a precise timeout based on current timer to prevent AFK exploitation
    // Add 100ms buffer to ensure game ends after display timer shows 0
    const timeoutMs = currentTimer * 1000 + 100;
    console.log('Setting timer timeout for:', timeoutMs, 'ms');
    
    timerRef.current = setTimeout(() => {
      // Time's up - game over (no matter what the display shows)
      console.log('Timer timeout triggered - calling handleGameOver');
      handleGameOver();
    }, timeoutMs);
    
    // Update display timer every second for UI feedback
    let currentTime = currentTimer;
    const updateDisplay = () => {
      setChallengeGuessTimer(currentTime);
      currentTime--;
      if (currentTime > 0) {
        displayTimerRef.current = setTimeout(updateDisplay, 1000);
      } else {
        // When display reaches 0, trigger game over immediately
        console.log('Display timer reached 0 - calling handleGameOver');
        setTimeout(() => handleGameOver(), 100);
      }
    };
    updateDisplay();
  }, [handleGameOver, challengeStartTime, calculateCurrentTimer]);
  
  // Start challenge timer with explicit start time (for initial game start)
  const startChallengeGuessTimerWithStartTime = useCallback((startTime: number) => {
    // Clear any existing timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (displayTimerRef.current) clearTimeout(displayTimerRef.current);
    
    const currentTimer = calculateCurrentTimer(startTime);
    console.log('startChallengeGuessTimerWithStartTime - currentTimer:', currentTimer, 'startTime:', startTime);
    setChallengeGuessTimer(currentTimer);
    
    // Use a precise timeout based on current timer to prevent AFK exploitation
    // Add 100ms buffer to ensure game ends after display timer shows 0
    const timeoutMs = currentTimer * 1000 + 100;
    console.log('Setting timer timeout for:', timeoutMs, 'ms');
    
    timerRef.current = setTimeout(() => {
      // Time's up - game over (no matter what the display shows)
      console.log('Timer timeout triggered - calling handleGameOver');
      handleGameOver();
    }, timeoutMs);
    
    // Update display timer every second for UI feedback
    let currentTime = currentTimer;
    const updateDisplay = () => {
      setChallengeGuessTimer(currentTime);
      currentTime--;
      if (currentTime > 0) {
        displayTimerRef.current = setTimeout(updateDisplay, 1000);
      } else {
        // When display reaches 0, trigger game over immediately
        console.log('Display timer reached 0 - calling handleGameOver');
        setTimeout(() => handleGameOver(), 100);
      }
    };
    updateDisplay();
  }, [handleGameOver, calculateCurrentTimer]);
  
  // Start rolling sequence for challenge mode
  const startRollingSequence = useCallback((sequence: Color[]) => {
    setGamePhase('playing');
    setChallengePhase('guessing');
    setChallengeCurrentIndex(0);
    
    // IMPORTANT: Start the challenge timer immediately to prevent exploitation
    // This ensures survival time starts counting from when rolling begins, not when user clicks
    const startTime = Date.now();
    setChallengeStartTime(startTime);
    
    // Hide the first color and show only 4 visible colors
    let visibleColors = sequence.slice(1, 5); // Show only 4 colors after the hidden one
    
    setChallengeVisibleColors(visibleColors);
    
    // Start 5-second timer for first guess - pass start time to ensure accurate calculation
    const initialTimer = calculateCurrentTimer(startTime);
    setChallengeGuessTimer(initialTimer);
    startChallengeGuessTimerWithStartTime(startTime);
  }, [calculateCurrentTimer]);

  // Continue rolling sequence after correct guess
  const continueRollingSequence = useCallback(() => {
    const currentSequence = [...challengeSequence];
    const nextIndex = challengeCurrentIndex + 1;
    
    // Add 1-2 new colors to keep the sequence growing, allowing up to 3 consecutive same colors
    const addSmartColor = (sequence: Color[]): Color => {
      const colors: Color[] = ['green', 'red'];
      const lastColor = sequence[sequence.length - 1];
      const secondLastColor = sequence.length >= 2 ? sequence[sequence.length - 2] : null;
      const thirdLastColor = sequence.length >= 3 ? sequence[sequence.length - 3] : null;
      
      if (thirdLastColor && secondLastColor && lastColor === secondLastColor && secondLastColor === thirdLastColor) {
        // Force different color if last 3 were the same
        return lastColor === 'green' ? 'red' : 'green';
      } else {
        // Random color with natural distribution
        return colors[Math.floor(Math.random() * colors.length)];
      }
    };
    
    const newColor1 = addSmartColor(currentSequence);
    currentSequence.push(newColor1);
    const newColor2 = addSmartColor(currentSequence);
    currentSequence.push(newColor2);
    setChallengeSequence(currentSequence);
    
    // Update visible colors (hide the current guess position, show only 4 visible colors)
    // Show exactly 4 visible colors after the hidden position
    const visibleStart = nextIndex + 1;
    let visibleColors = currentSequence.slice(visibleStart, visibleStart + 4);
    
    // If we don't have enough colors after the hidden position, pad with earlier colors
    if (visibleColors.length < 4 && currentSequence.length > 5) {
      const needed = 4 - visibleColors.length;
      const earlierColors = currentSequence.slice(Math.max(0, nextIndex - needed), nextIndex);
      visibleColors = [...earlierColors, ...visibleColors];
    }
    
    setChallengeVisibleColors(visibleColors);
    
    // Move to next position
    setChallengeCurrentIndex(nextIndex);
    
    // Start timer for next guess (with speed rush calculation)
    const currentTimer = calculateCurrentTimer();
    setChallengeGuessTimer(currentTimer);
    startChallengeGuessTimer();
  }, [challengeSequence, challengeCurrentIndex, generatePattern, startChallengeGuessTimer, calculateCurrentTimer]);

  // Start new pattern
  const startNewPattern = useCallback(() => {
    if (gamePhase === 'showing' || gamePhase === 'playing') return;
    
    setIsLoading(true);
    setError(null);
    
    // Clear any existing timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (patternTimeoutRef.current) clearTimeout(patternTimeoutRef.current);
    if (displayTimerRef.current) clearTimeout(displayTimerRef.current);
    
    if (gameMode === 'challenge') {
      // New rolling sequence challenge mode
      setCurrentScore(0);
      setChallengeCurrentIndex(0);
      setGamePhase('showing');
      
      // Start with initial sequence of 5 colors (1 hidden + 4 visible)
      const initialSequence = generatePattern(5);
      setChallengeSequence(initialSequence);
      setChallengeVisibleColors([...initialSequence]);
      
      // Start the rolling sequence after a brief showing period
      // Timer will start when rolling begins, not here
      patternTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
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
      setIsLoading(false);
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
        // Clear the timers for this guess
        if (timerRef.current) clearTimeout(timerRef.current);
        if (displayTimerRef.current) clearTimeout(displayTimerRef.current);
        
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
    setChallengeGuessTimer(5);
    setChallengeStartTime(0);
    
    if (gameMode === 'levels') {
      setCurrentLevel(1);
    }
    
    // Clear any running timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (patternTimeoutRef.current) clearTimeout(patternTimeoutRef.current);
    if (displayTimerRef.current) clearTimeout(displayTimerRef.current);
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
    
    // UI state
    isLoading,
    error,
    
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
