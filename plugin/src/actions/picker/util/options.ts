/**
 * Expand definitions into objects with id and image
 * @param definitions string to expand
 * @param type type of definition
 * @returns
 */
const expandDefinitions = (type: string, definitions: string[]) =>
  definitions.map((id) => ({
    id,
    image: `./imgs/canvas/picker/${type}/${id}.png`,
  }));

// Weapons Buttons

const Weapons = [
  { title: "HC", id: "hand-cannon" },
  { title: "SMG", id: "smg" },
  { title: "Sidearm", id: "sidearm" },
  { title: "Auto", id: "auto-rifle" },
  { title: "Pulse", id: "pulse-rifle" },
  { title: "Scout", id: "scout-rifle" },
  { title: "Bow", id: "bow" },
  { title: "Trace", id: "trace-rifle" },
  { title: "Glaive", id: "glaive" },
  { title: "Sniper", id: "sniper-rifle" },
  { title: "Shotgun", id: "shotgun" },
  { title: "GL", id: "grenade-launcher" },
  { title: "Fusion", id: "fusion-rifle" },
  { title: "LFR", id: "linear-fusion-rifle" },
  { title: "Rocket", id: "rocket-launcher" },
  { title: "Sword", id: "sword" },
  { title: "MG", id: "machine-gun" },
];

export const WeaponButtons = Weapons.map((item) => ({
  ...item,
  id: item.id.replace("-", ""),
  type: "weapon-type" as const,
  image: `./imgs/canvas/picker/weapon/${item.id.toLowerCase()}.png`,
}));

export const CloseWeaponButton = {
  image: `./imgs/canvas/picker/weapon/all-off.png`,
};

export const OpenWeaponButton = {
  image: `./imgs/canvas/picker/weapon/all.png`,
};

export const Elements = expandDefinitions("element", [
  "all",
  "solar",
  "void",
  "arc",
  "stasis",
  "strand",
  "kinetic",
]);

export const Crafted = expandDefinitions("crafted", [
  "all",
  "crafted",
  "randomroll",
]);

export const Classes = expandDefinitions("class", [
  "all",
  "warlock",
  "titan",
  "hunter",
]);

export const Rarity = expandDefinitions("rarity", [
  "all",
  "exotic",
  "legendary",
]);

export const Armor = expandDefinitions("armor", [
  "all",
  "helmet",
  "gauntlets",
  "chest",
  "leg",
  "classitem",
]);

// Profile Suffixes

export const Profiles = [
  "",
  "-Mini",
  "-XL",
  "",
  undefined,
  undefined,
  undefined,
  "-Plus",
];
