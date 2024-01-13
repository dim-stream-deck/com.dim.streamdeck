const WeaponsDefinitions = {
  HC: 6,
  SMG: 3954685534,
  Sidearm: 14,
  Auto: 5,
  Pulse: 4,
  Scout: 8,
  Bow: 3317538576,
  Trace: 7,
  Glaive: 3871742104,
  Sniper: 10,
  Shotgun: 11,
  GL: 153950757,
  FR: 9,
  LFR: 1504945536,
  RL: 13,
  Sword: 54,
  MG: 12,
};

export const ElementDefinition: Record<string, number> = {
  all: -1,
  kinetic: 1,
  arc: 2,
  solar: 3,
  void: 4,
  stasis: 6,
  strand: 7,
};

export const WeaponButtons = Object.entries(WeaponsDefinitions).map(
  ([title, id]) => ({
    title,
    id,
    type: "weapon-type",
    image: `./imgs/canvas/picker/weapon/${title.toLowerCase()}.png`,
  })
);

export const Weapons = Object.keys(WeaponsDefinitions);

export const Elements = Object.keys(ElementDefinition);
