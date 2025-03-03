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
