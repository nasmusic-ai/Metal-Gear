
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GameStatus, GameState, Position, Guard } from './types';
import { GRID_SIZE, CELL_SIZE, SUITS, WEAPONS, MAP_DATA } from './constants';
import HUD from './components/HUD';
import Codec from './components/Codec';
import { getMissionBriefing } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.MENU,
    playerPos: { x: 2, y: 17 },
    playerDirection: 'N',
    playerHealth: 100,
    playerStamina: 100,
    activeSuit: SUITS[0],
    activeWeapon: WEAPONS[0],
    items: [],
    alertLevel: 0,
    missionObjective: 'Infiltrate the Research Lab and hack the Mainframe.',
    flashlightActive: false
  });

  const [briefing, setBriefing] = useState<string>('');
  const [guards, setGuards] = useState<Guard[]>([
    { id: 'g1', pos: { x: 5, y: 3 }, type: 'guard', direction: 'E', patrolRoute: [{ x: 5, y: 3 }, { x: 15, y: 3 }], state: 'PATROL' },
    { id: 'g2', pos: { x: 10, y: 8 }, type: 'guard', direction: 'S', patrolRoute: [{ x: 10, y: 8 }, { x: 10, y: 15 }], state: 'PATROL' },
  ]);

  const [scale, setScale] = useState(1);
  const gameBoardRef = useRef<HTMLDivElement>(null);

  // Sound Effects
  const playSfx = useCallback((type: 'footstep' | 'alert' | 'hack' | 'codec') => {
    const urls = {
      footstep: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      alert: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3',
      hack: 'https://assets.mixkit.co/active_storage/sfx/2536/2536-preview.mp3',
      codec: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
    };
    const audio = new Audio(urls[type]);
    audio.volume = type === 'alert' ? 0.6 : 0.3;
    audio.play().catch(() => {});
  }, []);

  // Floor Tiles Generation
  const floorTiles = useMemo(() => {
    const tiles = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        // Simple procedural variation for textures
        const type = (x + y) % 5 === 0 ? 'dirt' : 'concrete';
        tiles.push({ x, y, type });
      }
    }
    return tiles;
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const boardSize = GRID_SIZE * CELL_SIZE;
      const screenWidth = window.innerWidth * 0.95;
      const screenHeight = window.innerHeight * 0.95;
      const newScale = Math.min(screenWidth / boardSize, screenHeight / boardSize, 1);
      setScale(newScale);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const init = async () => {
      const msg = await getMissionBriefing();
      setBriefing(msg);
    };
    init();
  }, []);

  const movePlayer = useCallback((dx: number, dy: number) => {
    setGameState(prev => {
      if (prev.status !== GameStatus.PLAYING) return prev;
      
      const newX = prev.playerPos.x + dx;
      const newY = prev.playerPos.y + dy;

      let newDir = prev.playerDirection;
      if (dx > 0) newDir = 'E';
      else if (dx < 0) newDir = 'W';
      else if (dy > 0) newDir = 'S';
      else if (dy < 0) newDir = 'N';

      if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
        return { ...prev, playerDirection: newDir };
      }

      const isWall = MAP_DATA.walls.some(w => 
        newX >= w.x && newX < w.x + (w.w || 1) && 
        newY >= w.y && newY < w.y + (w.h || 1)
      );
      if (isWall) return { ...prev, playerDirection: newDir };

      const isTerminal = MAP_DATA.terminals.some(t => t.x === newX && t.y === newY);
      if (isTerminal) {
        playSfx('hack');
        setTimeout(() => setGameState(s => ({ ...s, status: GameStatus.SUCCESS })), 800);
      }

      playSfx('footstep');
      return {
        ...prev,
        playerPos: { x: newX, y: newY },
        playerDirection: newDir,
        playerStamina: Math.max(0, prev.playerStamina - (prev.activeSuit.id === 'optical' ? 0.2 : 0))
      };
    });
  }, [playSfx]);

  const toggleCodec = useCallback(() => {
    playSfx('codec');
    setGameState(prev => ({ 
      ...prev, 
      status: prev.status === GameStatus.RADIO ? GameStatus.PLAYING : GameStatus.RADIO 
    }));
  }, [playSfx]);

  const toggleFlashlight = useCallback(() => {
    setGameState(prev => {
      if (prev.activeSuit.id !== 'optical') return prev;
      return { ...prev, flashlightActive: !prev.flashlightActive };
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status === GameStatus.MENU) return;
      switch(e.key.toLowerCase()) {
        case 'w': case 'arrowup': movePlayer(0, -1); break;
        case 's': case 'arrowdown': movePlayer(0, 1); break;
        case 'a': case 'arrowleft': movePlayer(-1, 0); break;
        case 'd': case 'arrowright': movePlayer(1, 0); break;
        case 'c': toggleCodec(); break;
        case 'f': toggleFlashlight(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, movePlayer, toggleCodec, toggleFlashlight]);

  useEffect(() => {
    if (gameState.status !== GameStatus.PLAYING) return;
    const interval = setInterval(() => {
      setGameState(prev => {
        let newStamina = prev.playerStamina;
        if (prev.activeSuit.id === 'optical') {
          if (prev.flashlightActive) newStamina = Math.max(0, newStamina - 1.5);
          else newStamina = Math.max(0, newStamina - 0.2);
        }
        let newFlashlight = prev.flashlightActive;
        if (newStamina <= 0) newFlashlight = false;
        return { ...prev, playerStamina: newStamina, flashlightActive: newFlashlight };
      });

      setGuards(prevGuards => prevGuards.map(g => {
        let nextPos = { ...g.pos };
        const currentTarget = (g.pos.x === g.patrolRoute[0].x && g.pos.y === g.patrolRoute[0].y) ? g.patrolRoute[1] : g.patrolRoute[0];
        
        let newDir = g.direction;
        if (g.pos.x < currentTarget.x) { nextPos.x++; newDir = 'E'; }
        else if (g.pos.x > currentTarget.x) { nextPos.x--; newDir = 'W'; }
        else if (g.pos.y < currentTarget.y) { nextPos.y++; newDir = 'S'; }
        else if (g.pos.y > currentTarget.y) { nextPos.y--; newDir = 'N'; }

        const dist = Math.sqrt(Math.pow(nextPos.x - gameState.playerPos.x, 2) + Math.pow(nextPos.y - gameState.playerPos.y, 2));
        const detectionThreshold = gameState.flashlightActive ? 6 : 4;
        
        if (dist < detectionThreshold) {
          if (gameState.alertLevel === 0) playSfx('alert');
          setGameState(s => ({ ...s, alertLevel: Math.min(100, s.alertLevel + 25) }));
          if (gameState.alertLevel >= 100) setGameState(s => ({ ...s, status: GameStatus.CAUGHT }));
        } else {
          setGameState(s => ({ ...s, alertLevel: Math.max(0, s.alertLevel - 5) }));
        }
        return { ...g, pos: nextPos, direction: newDir };
      }));
    }, 400);
    return () => clearInterval(interval);
  }, [gameState.status, gameState.playerPos.x, gameState.playerPos.y, gameState.alertLevel, gameState.flashlightActive, playSfx]);

  const getFlashlightStyle = () => {
    const rotation = { 'N': '-90deg', 'S': '90deg', 'E': '0deg', 'W': '180deg' }[gameState.playerDirection];
    return {
      style: {
        width: '240px',
        height: '160px',
        left: '50%',
        top: '50%',
        transform: `translate(-10px, -80px) rotate(${rotation})`,
        transformOrigin: '10px 80px',
        background: 'radial-gradient(circle at 0% 50%, rgba(255,255,180,0.2) 0%, transparent 60%)',
        clipPath: 'polygon(0% 50%, 100% 0%, 100% 100%)',
        filter: 'blur(4px)',
        opacity: Math.random() > 0.95 ? 0.4 : 1 // Slight flicker
      }
    };
  };

  const getVisionConeStyle = (direction: 'N' | 'S' | 'E' | 'W') => {
    const rotation = { 'N': '-90deg', 'S': '90deg', 'E': '0deg', 'W': '180deg' }[direction];
    return {
      style: {
        transform: `rotate(${rotation})`,
        transformOrigin: '50% 50%',
        clipPath: 'polygon(50% 50%, 100% 0%, 100% 100%)',
        background: 'rgba(255, 0, 0, 0.12)'
      }
    };
  };

  return (
    <div className="relative w-screen h-screen bg-[#050505] overflow-hidden flex items-center justify-center">
      {gameState.status === GameStatus.MENU && (
        <div className="z-50 text-center space-y-6 px-4 animate-in fade-in zoom-in duration-700">
          <h1 className="text-3xl md:text-5xl pixel-font font-bold tracking-tighter text-white drop-shadow-[4px_4px_0px_#0a2a5a]">
            METAL GEAR<br/>
            <span className="text-blue-500 text-xl md:text-3xl">KAPTEN EDITION</span>
          </h1>
          <div className="bg-black/90 border-4 border-[#0a2a5a] p-4 md:p-6 max-w-xl mx-auto text-[10px] md:text-[12px] leading-relaxed text-[#2ec4ff] pixel-font shadow-[6px_6px_0px_#000]">
            <p className="mb-2 uppercase tracking-widest text-[#4aa3ff] font-bold border-b-2 border-[#0a2a5a] pb-2">Intelligence Briefing</p>
            {briefing || "Decrypting mission parameters..." }
          </div>
          <button 
            onClick={() => setGameState({ ...gameState, status: GameStatus.PLAYING, activeSuit: SUITS[2] })}
            className="pixel-font px-8 md:px-12 py-3 md:py-4 border-4 border-white hover:bg-white hover:text-black transition-all font-bold text-xs md:text-sm active:translate-y-1"
          >
            START MISSION
          </button>
        </div>
      )}

      {(gameState.status === GameStatus.PLAYING || gameState.status === GameStatus.RADIO || gameState.status === GameStatus.CAUGHT || gameState.status === GameStatus.SUCCESS) && (
        <div 
          ref={gameBoardRef}
          className="relative border-[6px] border-[#0a2a5a] origin-center transition-transform duration-300 overflow-hidden shadow-[20px_20px_0px_rgba(0,0,0,0.5)]"
          style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE, transform: `scale(${scale})`, backgroundColor: '#0a0d0a' }}
        >
          {/* Layer 1: Floor Tiles */}
          {floorTiles.map((tile, i) => (
            <div key={`tile-${i}`} className="absolute border-[0.5px] border-black/10" 
              style={{ 
                left: tile.x * CELL_SIZE, top: tile.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE,
                backgroundImage: `url('/tiles/floor.png')`,
                backgroundColor: tile.type === 'dirt' ? '#1a1f1a' : '#0e120e'
              }} 
            />
          ))}

          {/* Layer 2: Walls */}
          {MAP_DATA.walls.map((w, i) => (
            <div key={`wall-${i}`} className="absolute z-10"
              style={{ 
                left: w.x * CELL_SIZE, top: w.y * CELL_SIZE, width: (w.w || 1) * CELL_SIZE, height: (w.h || 1) * CELL_SIZE,
                backgroundImage: `url('/tiles/wall.png')`,
                backgroundColor: '#2b302b',
                border: '2px solid #1a1f1a',
                boxShadow: 'inset 2px 2px 0px rgba(255,255,255,0.05), inset -2px -2px 0px rgba(0,0,0,0.3)'
              }}
            />
          ))}

          {/* Layer 3: Items / Terminals */}
          {MAP_DATA.terminals.map((t, i) => (
            <div key={`terminal-${i}`} className="absolute border-2 border-[#2ec4ff] animate-pulse flex items-center justify-center pixel-font text-[7px] font-bold text-[#2ec4ff] z-10 bg-[#0a2a5a]/30"
              style={{ left: t.x * CELL_SIZE, top: t.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}
            >
              HACK
            </div>
          ))}

          {/* Layer 4: Guard Vision Cones */}
          {guards.map(g => (
            <div key={`cone-${g.id}`} className="absolute pointer-events-none z-0 transition-all duration-300"
              style={{ 
                left: (g.pos.x * CELL_SIZE) - CELL_SIZE * 1.5, top: (g.pos.y * CELL_SIZE) - CELL_SIZE * 1.5, 
                width: CELL_SIZE * 4, height: CELL_SIZE * 4, ...getVisionConeStyle(g.direction).style
              }}
            />
          ))}

          {/* Layer 5: Guards */}
          {guards.map(g => (
            <div key={g.id} className="absolute transition-all duration-300 z-20 flex items-center justify-center"
              style={{ left: g.pos.x * CELL_SIZE, top: g.pos.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}
            >
              <div className="w-4/5 h-4/5 bg-red-800 border-2 border-red-400 relative" style={{ backgroundImage: "url('/sprites/guard.png')" }}>
                <div className={`absolute w-2 h-1 bg-white ${
                  g.direction === 'N' ? 'top-0 left-1/2 -translate-x-1/2' : g.direction === 'S' ? 'bottom-0 left-1/2 -translate-x-1/2' :
                  g.direction === 'E' ? 'right-0 top-1/2 -translate-y-1/2' : 'left-0 top-1/2 -translate-y-1/2'
                }`} />
              </div>
            </div>
          ))}

          {/* Layer 6: Player */}
          <div className="absolute transition-all duration-150 z-30 flex items-center justify-center"
            style={{ left: gameState.playerPos.x * CELL_SIZE, top: gameState.playerPos.y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}
          >
            {gameState.flashlightActive && <div className="absolute pointer-events-none z-0" {...getFlashlightStyle()} />}
            <div className={`w-4/5 h-4/5 border-2 border-[#2ec4ff] shadow-[0_2px_0_rgba(0,0,0,0.5)] transition-all ${gameState.activeSuit.id === 'optical' ? 'bg-[#2ec4ff]/20 opacity-40' : 'bg-[#0a2a5a]'}`} style={{ backgroundImage: "url('/sprites/player.png')" }}>
                <div className={`absolute w-3 h-1 bg-[#2ec4ff] ${
                  gameState.playerDirection === 'N' ? 'top-1 left-1/2 -translate-x-1/2' : gameState.playerDirection === 'S' ? 'bottom-1 left-1/2 -translate-x-1/2' :
                  gameState.playerDirection === 'E' ? 'right-1 top-1/2 -translate-y-1/2' : 'left-1 top-1/2 -translate-y-1/2'
                }`} />
            </div>
          </div>

          <HUD state={gameState} />
          <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />
        </div>
      )}

      {gameState.status === GameStatus.PLAYING && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-end justify-between p-6 pb-12">
          <div className="pointer-events-auto flex flex-col items-center gap-2">
            <button onPointerDown={() => movePlayer(0, -1)} className="w-14 h-14 bg-[#0a2a5a]/60 border-4 border-[#2ec4ff] flex items-center justify-center active:translate-y-1 active:bg-[#2ec4ff]"><span className="border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-[#2ec4ff]" /></button>
            <div className="flex gap-2">
                <button onPointerDown={() => movePlayer(-1, 0)} className="w-14 h-14 bg-[#0a2a5a]/60 border-4 border-[#2ec4ff] flex items-center justify-center active:translate-y-1 active:bg-[#2ec4ff]"><span className="border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-[#2ec4ff]" /></button>
                <button onPointerDown={() => movePlayer(0, 1)} className="w-14 h-14 bg-[#0a2a5a]/60 border-4 border-[#2ec4ff] flex items-center justify-center active:translate-y-1 active:bg-[#2ec4ff]"><span className="border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#2ec4ff]" /></button>
                <button onPointerDown={() => movePlayer(1, 0)} className="w-14 h-14 bg-[#0a2a5a]/60 border-4 border-[#2ec4ff] flex items-center justify-center active:translate-y-1 active:bg-[#2ec4ff]"><span className="border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-[#2ec4ff]" /></button>
            </div>
          </div>
          <div className="pointer-events-auto flex flex-col gap-4">
            {gameState.activeSuit.id === 'optical' && (
              <button onPointerDown={toggleFlashlight} className={`w-16 h-16 border-4 pixel-font text-[8px] font-bold flex items-center justify-center ${gameState.flashlightActive ? 'bg-yellow-500 border-yellow-200 text-black shadow-[inset_0_4px_0_rgba(255,255,255,0.4)]' : 'bg-gray-900 border-gray-600 text-gray-500'}`}>LIGHT</button>
            )}
            <button onPointerDown={toggleCodec} className="w-16 h-16 bg-green-900/60 border-4 border-green-400 text-green-400 pixel-font text-[8px] font-bold flex items-center justify-center active:translate-y-1">CODEC</button>
          </div>
        </div>
      )}

      {gameState.status === GameStatus.RADIO && <Codec situation={`Pos: ${gameState.playerPos.x},${gameState.playerPos.y}. Alert: ${gameState.alertLevel}`} onClose={toggleCodec} />}

      {gameState.status === GameStatus.CAUGHT && (
        <div className="absolute inset-0 z-[100] bg-red-950/90 flex flex-col items-center justify-center pixel-font text-center p-6 animate-in fade-in">
          <h2 className="text-4xl md:text-6xl text-white font-bold mb-4">GAME OVER</h2>
          <p className="text-red-400 text-[10px] md:text-xs mb-12 uppercase leading-loose">KAPTEN? KAPTEN!!<br/>KAAAAAAPTEN!!!</p>
          <button onClick={() => window.location.reload()} className="px-8 py-4 bg-white text-black font-bold border-4 border-black text-xs active:translate-y-1">CONTINUE?</button>
        </div>
      )}

      {gameState.status === GameStatus.SUCCESS && (
        <div className="absolute inset-0 z-[100] bg-blue-950/90 flex flex-col items-center justify-center pixel-font text-center p-6 animate-in fade-in">
          <h2 className="text-4xl md:text-6xl text-white font-bold mb-4">SUCCESS</h2>
          <p className="text-[#2ec4ff] text-[10px] md:text-xs mb-12 uppercase leading-loose">MISSION COMPLETE.<br/>EXTRACTION TEAM EN ROUTE.</p>
          <button onClick={() => window.location.reload()} className="px-8 py-4 bg-white text-black font-bold border-4 border-black text-xs active:translate-y-1">REPLAY</button>
        </div>
      )}
    </div>
  );
};

export default App;
