
import { Suit, Weapon } from './types';

export const GRID_SIZE = 20;
export const CELL_SIZE = 40;

export const SUITS: Suit[] = [
  { id: 'tactical', name: 'Tactical Armor', description: 'Standard high-durability gear.', stealthMod: 1.0, armorMod: 1.2 },
  { id: 'sneaking', name: 'Sneaking Suit', description: 'Dampens footstep noise.', stealthMod: 1.5, armorMod: 0.8 },
  { id: 'optical', name: 'Optical Camo', description: 'Bends light around the user.', stealthMod: 2.5, armorMod: 0.5 },
];

export const WEAPONS: Weapon[] = [
  { id: 'mk22', name: 'Mk22 Hush Puppy', type: 'Non-Lethal', ammo: 8 },
  { id: 'socom', name: 'SOCOM .45', type: 'Lethal', ammo: 12 },
  { id: 'm4', name: 'M4 Carbine', type: 'Lethal', ammo: 30 },
];

export const MAP_DATA = {
  walls: [
    { x: 5, y: 5, w: 10, h: 1 },
    { x: 5, y: 10, w: 1, h: 5 },
    { x: 14, y: 10, w: 1, h: 5 },
    { x: 5, y: 15, w: 10, h: 1 },
    // Borders
    { x: 0, y: 0, w: 20, h: 1 },
    { x: 0, y: 19, w: 20, h: 1 },
    { x: 0, y: 0, w: 1, h: 20 },
    { x: 19, y: 0, w: 1, h: 20 },
  ],
  items: [
    { x: 10, y: 12, type: 'keycard', name: 'Level 1 Keycard' }
  ],
  terminals: [
    { x: 18, y: 2, id: 'mainframe' }
  ]
};
