
export enum GameStatus {
  MENU = 'MENU',
  MISSION_START = 'MISSION_START',
  PLAYING = 'PLAYING',
  RADIO = 'RADIO',
  CAUGHT = 'CAUGHT',
  SUCCESS = 'SUCCESS'
}

export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  pos: Position;
  type: 'player' | 'guard' | 'camera' | 'item' | 'terminal';
}

export interface Guard extends Entity {
  direction: 'N' | 'S' | 'E' | 'W';
  patrolRoute: Position[];
  state: 'IDLE' | 'PATROL' | 'ALERT' | 'STUNNED';
  lastPlayerPos?: Position;
}

export interface Suit {
  id: string;
  name: string;
  description: string;
  stealthMod: number;
  armorMod: number;
}

export interface Weapon {
  id: string;
  name: string;
  type: 'Lethal' | 'Non-Lethal';
  ammo: number;
}

export interface GameState {
  status: GameStatus;
  playerPos: Position;
  playerDirection: 'N' | 'S' | 'E' | 'W';
  playerHealth: number;
  playerStamina: number;
  activeSuit: Suit;
  activeWeapon: Weapon;
  items: string[];
  alertLevel: number; // 0 to 100
  missionObjective: string;
  flashlightActive: boolean;
}
