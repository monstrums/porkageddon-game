import React, { useState, useEffect, useCallback } from 'react';

const App = () => {
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
    ]},
    { name: "Porkbeard", health: 115, attack: 8, moves: [
      { name: "Cannon Blast", damageRange: [45, 70] },
      { name: "Anchor Hook", damageRange: [30, 50] }
    ]},
    { name: "Professor Oinkstein", health: 120, attack: 7, moves: [
      { name: "Mutant Serum", damageRange: [10, 40] },
      { name: "Shock Snout", damageRange: [30, 55] }
    ]},
    { name: "Sir Oinksalot", health: 110, attack: 9, moves: [
      { name: "Snout Lunge", damageRange: [35, 55] },
      { name: "Shield Bash", damageRange: [20, 45] }
    ]},
    { name: "Buckaroo Bacon", health: 100, attack: 10, moves: [
      { name: "Six-Snout Shooter", damageRange: [30, 45] },
      { name: "Lasso Wrangle", damageRange: [25, 40] }
    ]}
  ];

  characters.forEach(character => {
    character.moves.push({ name: "Penicillin", healRange: [10, 70], isHealing: true });
    character.moves.push({ name: "Run Away", isForfeit: true });
  });

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
  const [battleLog, setBattleLog] = useState(['Welcome to Porkageddon! Choose your pig fighter and set your opponent\'s value!']);

  const RTP = 0.97;
  const PLAYER_FIRST_TURN_CHANCE = 0.47;

  const getAttackModifier = (attack) => {
    const modifiers = { 7: 0.79, 8: 0.87, 9: 0.95, 10: 1.0, 11: 1.04, 12: 1.10 };
    return modifiers[attack] || 1.0;
  };

  const calculateMoveCost = (move, opponentValue) => {
    if (!move || move.isForfeit) return 0;
    const medianValue = move.isHealing ? (move.healRange[0] + move.healRange[1]) / 2 : (move.damageRange[0] + move.damageRange[1]) / 2;
    return Math.round((opponentValue * medianValue) / 100);
  };

  const logMessage = (message) => {
    setBattleLog(prev => [...prev, message]);
  };

  const selectCharacter = (character) => {
    if (opponentValue <= 0) {
      logMessage("Please enter a valid opponent value!");
      return;
    }
    setPlayerCharacter(character);
    setPlayerHealth(character.health);
    const availableCharacters = characters.filter(c => c.name !== character.name);
    const randomCharacter = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
    setComputerCharacter(randomCharacter);
    setComputerHealth(randomCharacter.health);
    logMessage(`You selected ${character.name}!`);
    logMessage(`Casino selected ${randomCharacter.name}!`);
    setGameStage('battle');
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-4">
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-2 text-pink-500">PORKAGEDDON</h1>
        <div className="bg-gray-700 rounded p-2 text-center mb-4 w-48 mx-auto">
          <h3 className="text-sm mb-0">Your Money</h3>
          <h2 className="text-xl font-bold">${playerMoney}</h2>
        </div>
        {gameStage === 'character-select' && (
          <div>
            <h2 className="text-xl mb-4 text-center">Choose Your Fighter</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {characters.map((character) => (
                <div 
                  key={character.name}
                  className="bg-gray-700 rounded p-3 cursor-pointer hover:bg-pink-900 transition-colors"
                  onClick={() => selectCharacter(character)}
                >
                  <h3 className="font-bold mb-1">{character.name}</h3>
                  <div className="text-sm">Health: {character.health}</div>
                  <div className="text-sm">Attack: {character.attack} ({Math.round(getAttackModifier(character.attack) * 100)}%)</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
