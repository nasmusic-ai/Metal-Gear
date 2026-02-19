import React from 'react';
import { GameState } from '../types';

interface HUDProps {
  state: GameState;
}

const HUD: React.FC<HUDProps> = ({ state }) => {
  return (
    <div className="absolute inset-0 pointer-events-none p-3 pixel-font flex flex-col justify-between text-[10px]">

      {/* ================= TOP HUD ================= */}
      <div className="flex justify-between items-start">

        {/* LIFE + STAMINA PANEL */}
        <div className="bg-black/90 border-2 border-[#0a2a5a] p-2 shadow-[3px_3px_0px_#000]">

          {/* LIFE */}
          <div className="mb-3">
            <div className="text-[8px] text-[#4aa3ff] mb-1">LIFE</div>
            <div className="w-40 h-3 bg-black border border-[#0a2a5a] relative">
              <div
                className="h-full bg-[#2ec4ff] transition-all duration-300"
                style={{ width: `${state.playerHealth}%` }}
              />
              <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#000_2px,#000_4px)]" />
            </div>
          </div>

          {/* STAMINA */}
          <div>
            <div className="text-[8px] text-orange-400 mb-1">STAMINA</div>
            <div className="w-32 h-2 bg-black border border-orange-900 relative">
              <div
                className="h-full bg-orange-400 transition-all duration-300"
                style={{ width: `${state.playerStamina}%` }}
              />
              <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#000_2px,#000_4px)]" />
            </div>
          </div>

        </div>

        {/* ALERT STATUS */}
        <div className="text-right bg-black/90 border-2 border-[#0a2a5a] p-3 shadow-[3px_3px_0px_#000]">

          <div
            className={`text-lg font-bold tracking-widest ${
              state.alertLevel > 0
                ? 'text-red-500 animate-pulse'
                : 'text-[#2ec4ff]'
            }`}
          >
            {state.alertLevel > 0 ? 'ALERT' : 'NORMAL'}
          </div>

          {state.alertLevel > 0 && (
            <div className="text-[9px] text-red-400 mt-1">
              ENEMY AWARENESS: {state.alertLevel}%
            </div>
          )}

        </div>
      </div>

      {/* ================= BOTTOM HUD ================= */}
      <div className="flex justify-between items-end">

        {/* EQUIPMENT PANEL */}
        <div className="bg-black/90 border-2 border-[#0a2a5a] p-3 shadow-[3px_3px_0px_#000]">

          <div className="text-[#4aa3ff] text-[8px] mb-1">SUIT</div>
          <div className="text-white text-[10px] mb-3">
            {state.activeSuit.name}
          </div>

          <div className="text-[#4aa3ff] text-[8px] mb-1">WEAPON</div>
          <div className="text-white font-bold text-[11px]">
            {state.activeWeapon.name}
          </div>

          <div className="text-[#2ec4ff] text-[9px] mt-1">
            AMMO: {state.activeWeapon.ammo}
          </div>

        </div>

        {/* ================= RADAR ================= */}
        <div className="relative w-24 h-24 border-2 border-[#0a2a5a] bg-black overflow-hidden shadow-[3px_3px_0px_#000]">

          {/* Radar Scanlines */}
          <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#000_2px,#000_4px)]" />

          {/* Radar Grid */}
          <div className="absolute inset-0">
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#2ec4ff]/30" />
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#2ec4ff]/30" />
            <div className="absolute inset-3 border border-[#2ec4ff]/20" />
          </div>

          {/* Rotating Sweep Line */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-[#2ec4ff]/30 origin-bottom" />
          </div>

          {/* Player Dot */}
          <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-[#2ec4ff] -translate-x-1/2 -translate-y-1/2" />

        </div>

      </div>
    </div>
  );
};

export default HUD;
