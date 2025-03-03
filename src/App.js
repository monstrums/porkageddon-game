// The issue might be from combining the two parts of the code incorrectly
// Let's create a complete file with proper JSX structure

import React, { useState, useEffect, useCallback } from 'react';

const App = () => {
  // Character data
  const characters = [
    { name: "Piggie Hood", health: 95, attack: 11, moves: [
      { name: "Snout Shot", damageRange: [30, 50] },
      { name: "Trickster Leap", damageRange: [20, 35] }
    ]},
    { name: "GladiPiggie", health: 110, attack: 9, moves: [
      { name: "Boar Charge", damageRange: [40, 60] },
      { name: "Arena Slam", damageRange: [50, 70] }
    ]},
    { name: "El Porkador", health: 105, attack: 10, moves: [
      { name: "Flying Oink Drop", damageRange: [35, 55] },
      { name: "Piggie Suplex", damageRange: [45, 65] }
    ]},
    { name: "Samuroink", health: 100, attack: 12, moves: [
      { name: "Tusk Slash", damageRange: [25, 50] },
      { name: "Oink Focus", damageRange: [30, 50] }
    ]}
  ];

  // Add common moves to all characters
  characters.forEach(character => {
    character.moves.push({ name: "Penicillin", healRange: [10, 70], isHealing: true });
    character.moves.push({ name: "Run Away", isForfeit: true });
  });

  // Game state
  const [gameStage, setGameStage] = useState('character-select');
  const [playerCharacter, setPlayerCharacter] = useState(null);
  const [computerCharacter, setComputerCharacter] = useState(null);
  const [playerHealth, setPlayerHealth] = useState(0);
  const [computerHealth, setComputerHealth] = useState(0);
  const [playerMoney, setPlayerMoney] = useState(10000);
  const [opponentValue, setOpponentValue] = useState(100);
  const [prizePot, setPrizePot] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [gameActive, setGameActive] = useState(false);
  const [playerInvestment, setPlayerInvestment] = useState(0);
  const [casinoInvestment, setCasinoInvestment] = useState(0);
  const [battleLog, setBattleLog] = useState(['Welcome to Porkageddon! Choose your pig fighter and set your opponent\'s value!']);

  // Game constants
  const RTP = 0.97; // Return to Player percentage (97%)
  const PLAYER_FIRST_TURN_CHANCE = 0.47; // 47% chance player goes first

  // Get attack modifier percentage based on character's attack stat
  const getAttackModifier = (attack) => {
    switch(attack) {
      case 7: return 0.79; // 79%
      case 8: return 0.87; // 87%
      case 9: return 0.95; // 95%
      case 10: return 1.0; // 100% (baseline)
      case 11: return 1.04; // 104%
      case 12: return 1.10; // 110%
      default: return 1.0; // Default fallback
    }
  };

  // Calculate move costs based on opponent value and move damage/healing potential
  const calculateMoveCost = (move, opponentValue) => {
    if (!move) return 0;
    if (move.isForfeit) return 0;
    
    let medianValue;
    if (move.isHealing && move.healRange) {
      // For healing moves, use the median of the heal range
      medianValue = (move.healRange[0] + move.healRange[1]) / 2;
    } else if (move.damageRange) {
      // For attack moves, use the median of the damage range
      medianValue = (move.damageRange[0] + move.damageRange[1]) / 2;
    } else {
      return 0;
    }
    
    // Cost formula: Opponent Value * Median Damage or Healing / 100
    return Math.round((opponentValue * medianValue) / 100);
  };

  // Log a message to the battle log
  const logMessage = (message) => {
    setBattleLog(prev => [...prev, message]);
  };

  // Calculate damage based on character attack power and move damage range
  const calculateDamage = (character, moveRange, isPlayer = false) => {
    if (!character || !moveRange) return 0;
    
    const baseDamage = Math.floor(Math.random() * (moveRange[1] - moveRange[0] + 1)) + moveRange[0];
    const attackModifier = getAttackModifier(character.attack);
    
    // Apply character's attack quality modifier
    let damage = Math.floor(baseDamage * attackModifier);
    
    // Apply RTP for player moves only
    if (isPlayer) {
      damage = Math.floor(damage * RTP);
    }
    
    return damage;
  };

  // End game function (using useCallback to avoid dependency issues)
  const endGame = useCallback((winner, forfeit = false) => {
    setGameActive(false);
    setCurrentTurn(null);
    
    const finalPrizePot = prizePot;
    
    if (winner === 'player') {
      if (forfeit) {
        logMessage(`Casino forfeited! You've earned $${finalPrizePot} from the prize pool!`);
      } else {
        logMessage(`YOU WIN! You've earned $${finalPrizePot} from the prize pool!`);
      }
      setPlayerMoney(prev => prev + finalPrizePot);
    } else {
      if (forfeit) {
        logMessage(`You forfeited! Casino has claimed the $${finalPrizePot} prize pool!`);
      } else {
        logMessage(`CASINO WINS! Casino has claimed the $${finalPrizePot} prize pool!`);
      }
    }
    
    setPrizePot(0);
    setGameStage('game-over');
  }, [prizePot]);

  // Select a character
  const selectCharacter = (character) => {
    // Validate opponent value
    if (opponentValue <= 0) {
      logMessage("Please enter a valid opponent value!");
      return;
    }
    
    setPlayerCharacter(character);
    setPlayerHealth(character.health);
    
    // Computer randomly selects a character
    const availableCharacters = characters.filter(c => c.name !== character.name);
    const randomCharacter = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
    setComputerCharacter(randomCharacter);
    setComputerHealth(randomCharacter.health);
    
    logMessage(`You selected ${character.name}!`);
    logMessage(`Casino selected ${randomCharacter.name}!`);
    
    setGameStage('battle');
  };

  // Computer turn function (with useCallback)
  const computerTurn = useCallback(() => {
    if (!computerCharacter || !playerCharacter || currentTurn !== 'computer' || !gameActive) {
      return;
    }
    
    // Calculate computer's health percentage
    const computerHealthPercent = (computerHealth / computerCharacter.health) * 100;
    
    let computerMove;
    // Only use healing if health is below 40%
    if (computerHealthPercent < 40 && Math.random() < 0.7) {
      const healingMove = computerCharacter.moves.find(m => m.isHealing);
      if (healingMove) {
        computerMove = healingMove;
      } else {
        // Fallback to attack moves if healing move not found
        const attackMoves = computerCharacter.moves.filter(m => !m.isForfeit && !m.isHealing);
        computerMove = attackMoves[Math.floor(Math.random() * attackMoves.length)];
      }
    } else {
      // Use attack moves normally
      const attackMoves = computerCharacter.moves.filter(m => !m.isForfeit && !m.isHealing);
      computerMove = attackMoves[Math.floor(Math.random() * attackMoves.length)];
    }
    
    const computerMoveCost = calculateMoveCost(computerMove, opponentValue);
    
    // Update computer investment and pot
    setCasinoInvestment(prev => prev + computerMoveCost);
    setPrizePot(prev => prev + computerMoveCost);
    
    logMessage(`Casino selected ${computerMove.name}! (Cost: $${computerMoveCost} added to pot)`);
    
    if (computerMove.isHealing && computerMove.healRange) {
      // Healing move (Penicillin)
      const healAmount = Math.floor(Math.random() * (computerMove.healRange[1] - computerMove.healRange[0] + 1)) + computerMove.healRange[0];
      setComputerHealth(prevHealth => {
        const newHealth = Math.min(computerCharacter.health, prevHealth + healAmount);
        return newHealth;
      });
      logMessage(`Casino healed for ${healAmount} health!`);
    } else if (computerMove.damageRange) {
      // Attack move (no RTP penalty for Casino)
      const damage = calculateDamage(computerCharacter, computerMove.damageRange, false);
      setPlayerHealth(prevHealth => {
        const newHealth = Math.max(0, prevHealth - damage);
        return newHealth;
      });
      logMessage(`Casino dealt ${damage} damage to you!`);
    }
    
    // Keep turn as player's
    setCurrentTurn('player');
  }, [computerCharacter, playerCharacter, currentTurn, gameActive, computerHealth, opponentValue, playerHealth]);

  // Process player move (used for subsequent moves after the initial ones)
  const processPlayerMove = (move) => {
    if (!move || !playerCharacter || !computerCharacter || currentTurn !== 'player' || !gameActive) {
      return;
    }
    
    // Calculate move cost
    const moveCost = calculateMoveCost(move, opponentValue);
    
    // Handle forfeit
    if (move.isForfeit) {
      logMessage(`You threw in the towel and forfeited the match!`);
      endGame('computer', true);
      return;
    }
    
    // Deduct move cost from player money and update investments/pot
    setPlayerMoney(prevMoney => prevMoney - moveCost);
    setPlayerInvestment(prev => prev + moveCost);
    setPrizePot(prev => prev + moveCost);
    
    logMessage(`You used ${move.name}! (Cost: $${moveCost} added to pot)`);
    
    // Process player's move effects
    if (move.isHealing && move.healRange) {
      // Healing move (Penicillin)
      const healAmount = Math.floor(Math.random() * (move.healRange[1] - move.healRange[0] + 1)) + move.healRange[0];
      // Apply RTP to healing too
      const adjustedHealAmount = Math.floor(healAmount * RTP);
      setPlayerHealth(prevHealth => {
        const newHealth = Math.min(playerCharacter.health, prevHealth + adjustedHealAmount);
        return newHealth;
      });
      logMessage(`You healed yourself for ${adjustedHealAmount} health!`);
    } else if (move.damageRange) {
      // Attack move with RTP applied
      const damage = calculateDamage(playerCharacter, move.damageRange, true);
      setComputerHealth(prevHealth => {
        const newHealth = Math.max(0, prevHealth - damage);
        return newHealth;
      });
      logMessage(`You dealt ${damage} damage to ${computerCharacter.name}!`);
    }
    
    // Check if game should end after player move
    if (computerHealth <= 0) {
      setTimeout(() => endGame('player'), 100);
      return;
    }
    
    // Process computer's move after a delay
    setTimeout(() => {
      computerTurn();
      
      // Check if game should end after computer move
      if (playerHealth <= 0) {
        setTimeout(() => endGame('computer'), 100);
      }
    }, 1000);
  };

  // Select a move to start the battle
  const handleMoveSelection = (move) => {
    // If battle is already active, process the move normally
    if (gameActive) {
      if (currentTurn !== 'player') return;
      
      // Calculate move cost
      const moveCost = calculateMoveCost(move, opponentValue);
      
      // Check if player has enough money for the move
      if (playerMoney < moveCost) {
        logMessage("You don't have enough money for this move!");
        return;
      }
      
      // Process the move
      processPlayerMove(move);
      return;
    }
    
    // If battle is not active yet, this is the first move
    // Calculate player move cost
    const playerMoveCost = calculateMoveCost(move, opponentValue);
    
    // Check if player has enough money
    if (playerMoney < playerMoveCost) {
      logMessage("You don't have enough money for this move!");
      return;
    }
    
    // Select computer's first move
    if (!computerCharacter) return;
    
    // Calculate computer's health percentage
    const computerHealthPercent = (computerHealth / computerCharacter.health) * 100;
    
    let computerMove;
    // Only use healing if health is below 40%
    if (computerHealthPercent < 40 && Math.random() < 0.7) {
      const healingMove = computerCharacter.moves.find(m => m.isHealing);
      if (healingMove) {
        computerMove = healingMove;
      } else {
        // Fallback to attack moves if healing move not found
        const attackMoves = computerCharacter.moves.filter(m => !m.isForfeit && !m.isHealing);
        computerMove = attackMoves[Math.floor(Math.random() * attackMoves.length)];
      }
    } else {
      // Use attack moves normally
      const attackMoves = computerCharacter.moves.filter(m => !m.isForfeit && !m.isHealing);
      computerMove = attackMoves[Math.floor(Math.random() * attackMoves.length)];
    }
    
    const computerMoveCost = calculateMoveCost(computerMove, opponentValue);
    
    // Store selected moves
    const playerSelectedMove = move;
    const computerSelectedMove = computerMove;
    
    // Process payments and update pot
    setPlayerMoney(prev => prev - playerMoveCost);
    setPlayerInvestment(prev => prev + playerMoveCost);
    setCasinoInvestment(prev => prev + computerMoveCost);
    setPrizePot(prev => prev + playerMoveCost + computerMoveCost);
    
    logMessage("Battle started!");
    logMessage(`You selected ${playerSelectedMove.name}! (Cost: $${playerMoveCost} added to pot)`);
    logMessage(`Casino selected ${computerSelectedMove.name}! (Cost: $${computerMoveCost} added to pot)`);
    
    // Determine who goes first (47% player, 53% computer)
    const playerGoesFirst = Math.random() < PLAYER_FIRST_TURN_CHANCE;
    
    // Start the battle
    setGameActive(true);
    
    if (playerGoesFirst) {
      logMessage("You got lucky and attack first!");
      // Process player's move first
      if (playerSelectedMove.isHealing && playerSelectedMove.healRange) {
        // Healing move (Penicillin)
        const healAmount = Math.floor(Math.random() * (playerSelectedMove.healRange[1] - playerSelectedMove.healRange[0] + 1)) + playerSelectedMove.healRange[0];
        // Apply RTP to healing too
        const adjustedHealAmount = Math.floor(healAmount * RTP);
        setPlayerHealth(prevHealth => Math.min(playerCharacter.health, prevHealth + adjustedHealAmount));
        logMessage(`You healed yourself for ${adjustedHealAmount} health!`);
      } else if (playerSelectedMove.damageRange) {
        // Attack move with RTP applied
        const damage = calculateDamage(playerCharacter, playerSelectedMove.damageRange, true);
        setComputerHealth(prevHealth => Math.max(0, prevHealth - damage));
        logMessage(`You dealt ${damage} damage to ${computerCharacter.name}!`);
        
        // Check if battle ends after player move
        if (computerHealth <= 0) {
          setTimeout(() => endGame('player'), 100);
          return;
        }
      }
      
      // Then process computer's move
      setTimeout(() => {
        if (computerSelectedMove.isHealing && computerSelectedMove.healRange) {
          // Healing move (Penicillin)
          const healAmount = Math.floor(Math.random() * (computerSelectedMove.healRange[1] - computerSelectedMove.healRange[0] + 1)) + computerSelectedMove.healRange[0];
          setComputerHealth(prevHealth => Math.min(computerCharacter.health, prevHealth + healAmount));
          logMessage(`Casino healed for ${healAmount} health!`);
        } else if (computerSelectedMove.damageRange) {
          // Attack move (no RTP penalty for Casino)
          const damage = calculateDamage(computerCharacter, computerSelectedMove.damageRange, false);
          setPlayerHealth(prevHealth => Math.max(0, prevHealth - damage));
          logMessage(`Casino dealt ${damage} damage to you!`);
          
          // Check if battle ends after computer move
          if (playerHealth <= 0) {
            setTimeout(() => endGame('computer'), 100);
            return;
          }
        }
        
        // Set turn to player to continue battle
        setCurrentTurn('player');
      }, 1000);
    } else {
      logMessage("Casino attacks first!");
      // Process computer's move first
      if (computerSelectedMove.isHealing && computerSelectedMove.healRange) {
        // Healing move (Penicillin)
        const healAmount = Math.floor(Math.random() * (computerSelectedMove.healRange[1] - computerSelectedMove.healRange[0] + 1)) + computerSelectedMove.healRange[0];
        setComputerHealth(prevHealth => Math.min(computerCharacter.health, prevHealth + healAmount));
        logMessage(`Casino healed for ${healAmount} health!`);
      } else if (computerSelectedMove.damageRange) {
        // Attack move (no RTP penalty for Casino)
        const damage = calculateDamage(computerCharacter, computerSelectedMove.damageRange, false);
        setPlayerHealth(prevHealth => Math.max(0, prevHealth - damage));
        logMessage(`Casino dealt ${damage} damage to you!`);
        
        // Check if battle ends after computer move
        if (playerHealth <= 0) {
          setTimeout(() => endGame('computer'), 100);
          return;
        }
      }
      
      // Then process player's move
      setTimeout(() => {
        if (playerSelectedMove.isHealing && playerSelectedMove.healRange) {
          // Healing move (Penicillin)
          const healAmount = Math.floor(Math.random() * (playerSelectedMove.healRange[1] - playerSelectedMove.healRange[0] + 1)) + playerSelectedMove.healRange[0];
          // Apply RTP to healing too
          const adjustedHealAmount = Math.floor(healAmount * RTP);
          setPlayerHealth(prevHealth => Math.min(playerCharacter.health, prevHealth + adjustedHealAmount));
          logMessage(`You healed yourself for ${adjustedHealAmount} health!`);
        } else if (playerSelectedMove.damageRange) {
          // Attack move with RTP applied
          const damage = calculateDamage(playerCharacter, playerSelectedMove.damageRange, true);
          setComputerHealth(prevHealth => Math.max(0, prevHealth - damage));
          logMessage(`You dealt ${damage} damage to ${computerCharacter.name}!`);
          
          // Check if battle ends after player move
          if (computerHealth <= 0) {
            setTimeout(() => endGame('player'), 100);
            return;
          }
        }
        
        // Set turn to player to continue battle
        setCurrentTurn('player');
      }, 1000);
    }
  };

  // Reset game
  const resetGame = () => {
    setGameStage('character-select');
    setPlayerCharacter(null);
    setComputerCharacter(null);
    setPlayerHealth(0);
    setComputerHealth(0);
    setPlayerMoney(10000);
    setOpponentValue(100);
    setPrizePot(0);
    setCurrentTurn(null);
    setGameActive(false);
    setPlayerInvestment(0);
    setCasinoInvestment(0);
    setBattleLog(['Welcome to Porkageddon! Choose your pig fighter and set your opponent\'s value!']);
  };

  // Check for game end
  useEffect(() => {
    if (gameActive) {
      if (playerHealth <= 0) {
        endGame('computer');
      } else if (computerHealth <= 0) {
        endGame('player');
      }
    }
  }, [playerHealth, computerHealth, gameActive, endGame]);

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-4">
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-2 text-pink-500">PORKAGEDDON</h1>
        
        {/* Player Money - Always visible */}
        <div className="bg-gray-700 rounded p-2 text-center mb-4 w-48 mx-auto">
          <h3 className="text-sm mb-0">Your Money</h3>
          <h2 className="text-xl font-bold">${playerMoney}</h2>
        </div>
        
        {/* Character Select Screen with Opponent Value Input */}
        {gameStage === 'character-select' && (
          <div>
            <div className="bg-gray-700 rounded p-4 mb-6">
              <h3 className="text-lg mb-2">Game Setup</h3>
              <div className="mb-4">
                <label className="block text-sm mb-1">Cost of Opponent's HP ($):</label>
                <input 
                  type="number" 
                  className="w-full p-2 bg-gray-600 rounded text-white"
                  value={opponentValue}
                  onChange={(e) => setOpponentValue(Math.max(0, parseInt(e.target.value) || 0))}
                  min="1"
                />
                <p className="text-xs text-gray-400 mt-1">
                  This value affects the cost of your moves in battle.
                </p>
              </div>
            </div>
            
            <h2 className="text-xl mb-4 text-center">Choose Your Fighter</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {characters.map((character) => (
                <div 
                  key={character.name}
                  className="bg-gray-700 rounded p-3 cursor-pointer hover:bg-pink-900 transition-colors"
                  onClick={() => selectCharacter(character)}
                >
                  <div className="h-24 bg-gray-600 rounded mb-2 flex items-center justify-center text-xl">
                    {character.name.charAt(0)}
                  </div>
                  <h3 className="font-bold mb-1">{character.name}</h3>
                  <div className="text-sm">Health: {character.health}</div>
                  <div className="text-sm">Attack: {character.attack} ({Math.round(getAttackModifier(character.attack) * 100)}%)</div>
                </div>
              ))}
            </div>
            
            {/* Battle Log */}
            <div className="bg-gray-700 rounded p-4 h-24 overflow-y-auto">
              {battleLog.map((log, index) => (
                <p key={index} className="mb-1">{log}</p>
              ))}
            </div>
          </div>
        )}
        
        {/* Battle Screen */}
        {gameStage === 'battle' && (
          <>
            {/* Prize Pool */}
            <div className="w-full bg-gray-700 rounded p-4 text-center mb-4">
              <h3 className="text-lg mb-1">Prize Pool</h3>
              <h2 className="text-xl font-bold">${prizePot}</h2>
            </div>
            
            {/* Battle Area */}
            <div className="flex justify-between mb-4">
              <div className={`w-5/12 bg-gray-700 rounded p-4 ${currentTurn === 'player' && gameActive ? 'border-2 border-pink-500' : ''}`}>
                <div className="h-24 bg-gray-600 rounded mb-2 flex items-center justify-center text-xl font-bold">
                  {playerCharacter?.name}
                </div>
                <div className="flex justify-between mb-2">
                  <span>Health: {playerHealth}/{playerCharacter?.health}</span>
                  <span>Attack: {playerCharacter?.attack} ({Math.round(getAttackModifier(playerCharacter?.attack) * 100)}%)</span>
                </div>
                <div className="h-6 bg-gray-600 rounded relative">
                  <div 
                    className="h-full bg-pink-500 rounded transition-all duration-300" 
                    style={{ width: `${(playerHealth / playerCharacter?.health) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className={`w-5/12 bg-gray-700 rounded p-4 ${currentTurn === 'computer' && gameActive ? 'border-2 border-pink-500' : ''}`}>
                <div className="h-24 bg-gray-600 rounded mb-2 flex items-center justify-center text-xl font-bold">
                  {computerCharacter?.name}
                  <span className="text-sm ml-2">(Casino)</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Health: {computerHealth}/{computerCharacter?.health}</span>
                  <span>Attack: {computerCharacter?.attack} ({Math.round(getAttackModifier(computerCharacter?.attack) * 100)}%)</span>
                </div>
                <div className="h-6 bg-gray-600 rounded relative">
                  <div 
                    className="h-full bg-pink-500 rounded transition-all duration-300" 
                    style={{ width: `${(computerHealth / computerCharacter?.health) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Game Status Message */}
            <div className="bg-gray-700 rounded p-2 text-center mb-4">
              <p className="font-medium">
                {!gameActive ? 'Click on any move to start the battle' : 
                  currentTurn === 'player' ? 'Your Turn - Select a Move' : 
                  'Casino\'s Turn - Please Wait...'}
              </p>
            </div>
            
            {/* Moves Area */}
            <div className="bg-gray-700 rounded p-4 mb-4">
              <div className="mb-2 flex justify-between">
                <h3 className="text-lg">Available Moves</h3>
                <div className="text-sm">
                  <span className="text-yellow-400">RTP: 97%</span>
                  <span className="text-gray-400 ml-3">Base: ${opponentValue}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {/* Character-specific moves */}
                {playerCharacter?.moves.slice(0, 2).map((move, index) => {
                  const moveCost = calculateMoveCost(move, opponentValue);
                  return (
                    <button
                      key={index}
                      className="relative bg-gray-600 hover:bg-gray-500 p-3 rounded text-left transition-colors"
                      onClick={() => handleMoveSelection(move)}
                      disabled={(gameActive && currentTurn !== 'player') || moveCost > playerMoney}
                      style={{ opacity: ((gameActive && currentTurn !== 'player') || moveCost > playerMoney) ? 0.5 : 1 }}
                    >
                      <div className="font-medium">{move.name}</div>
                      <div className="text-xs">Damage: {move.damageRange[0]}-{move.damageRange[1]}</div>
                      <div className="absolute top-1 right-1 bg-yellow-500 text-black text-xs rounded px-1">${moveCost}</div>
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* Common moves */}
                {playerCharacter && (
                  <>
                    <button
                      className="relative bg-green-800 hover:bg-green-700 p-3 rounded text-left transition-colors"
                      onClick={() => handleMoveSelection(playerCharacter.moves[2])}
                      disabled={(gameActive && currentTurn !== 'player') || calculateMoveCost(playerCharacter.moves[2], opponentValue) > playerMoney}
                      style={{ opacity: ((gameActive && currentTurn !== 'player') || calculateMoveCost(playerCharacter.moves[2], opponentValue) > playerMoney) ? 0.5 : 1 }}
                    >
                      <div className="font-medium">Penicillin</div>
                      <div className="text-xs">Heal: 10-70 HP</div>
                      <div className="absolute top-1 right-1 bg-yellow-500 text-black text-xs rounded px-1">${calculateMoveCost(playerCharacter.moves[2], opponentValue)}</div>
                    </button>
                    <button
                      className="relative bg-red-800 hover:bg-red-700 p-3 rounded text-left transition-colors"
                      onClick={() => handleMoveSelection(playerCharacter.moves[3])}
                      disabled={(gameActive && currentTurn !== 'player')}
                      style={{ opacity: (gameActive && currentTurn !== 'player') ? 0.5 : 1 }}
                    >
                      <div className="font-medium">Run Away</div>
                      <div className="text-xs">Forfeit the match</div>
<div className="absolute top-1 right-1 bg-yellow-500 text-black text-xs rounded px-1">$0</div>
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Battle Log */}
            <div className="bg-gray-700 rounded p-4 mb-4 h-40 overflow-y-auto">
              {battleLog.map((log, index) => (
                <p key={index} className="mb-1">{log}</p>
              ))}
            </div>
          </>
        )}
        
        {/* Game Over Screen */}
        {gameStage === 'game-over' && (
          <div className="text-center">
            <h2 className="text-2xl mb-4 font-bold">
              {battleLog.some(log => log.includes("YOU WIN") || log.includes("Casino forfeited")) ? 
                "You Win!" : 
                "Game Over"}
            </h2>
            
            <div className="bg-gray-700 rounded p-4 mb-6">
              <h3 className="text-lg mb-2">Battle Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-3 rounded">
                  <p className="font-bold text-pink-400 mb-1">You</p>
                  <p>Invested: ${playerInvestment}</p>
                  {battleLog.some(log => log.includes("YOU WIN") || log.includes("Casino forfeited")) && 
                    <p className="text-green-400 mt-1">Won: ${playerInvestment + casinoInvestment}</p>
                  }
                </div>
                <div className="bg-gray-800 p-3 rounded">
                  <p className="font-bold text-pink-400 mb-1">Casino</p>
                  <p>Invested: ${casinoInvestment}</p>
                  {battleLog.some(log => log.includes("CASINO WINS") || log.includes("You forfeited")) && 
                    <p className="text-green-400 mt-1">Won: ${playerInvestment + casinoInvestment}</p>
                  }
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700 rounded p-4 mb-6 h-40 overflow-y-auto">
              {battleLog.map((log, index) => (
                <p key={index} className="mb-1">{log}</p>
              ))}
            </div>
            
            <button 
              className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded transition-colors w-full"
              onClick={resetGame}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
