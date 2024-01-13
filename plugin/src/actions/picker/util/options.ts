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

// Element Buttons

export const Elements = [
  {
    id: "all",
    image: "./imgs/canvas/picker/element/all.png",
  },
  {
    id: "kinetic",
    image: "./imgs/canvas/picker/element/kinetic.png",
  },
  {
    id: "arc",
    image: "./imgs/canvas/picker/element/arc.png",
  },
  {
    id: "solar",
    image: "./imgs/canvas/picker/element/solar.png",
  },
  {
    id: "void",
    image: "./imgs/canvas/picker/element/void.png",
  },
  {
    id: "stasis",
    image: "./imgs/canvas/picker/element/stasis.png",
  },
  {
    id: "strand",
    image: "./imgs/canvas/picker/element/strand.png",
  },
];

// Crafted Buttons

export const Crafted = [
  {
    id: "all",
    image: "./imgs/canvas/picker/crafted/all.png",
  },
  {
    id: "crafted",
    image: "./imgs/canvas/picker/crafted/crafted.png",
  },
  {
    id: "randomroll",
    image: "./imgs/canvas/picker/crafted/not-crafted.png",
  },
];

// Classes

export const Classes = [
  {
    id: "all",
    image: "./imgs/canvas/picker/class/all.png",
  },
  {
    id: "warlock",
    image: "./imgs/canvas/character/warlock.png",
  },
  {
    id: "titan",
    image: "./imgs/canvas/character/titan.png",
  },
  {
    id: "hunter",
    image: "./imgs/canvas/character/hunter.png",
  },
];

// Rarity

export const Rarity = [
  {
    id: "all",
    image: "./imgs/canvas/picker/rarity/all.png",
  },
  {
    id: "exotic",
    image: "./imgs/canvas/picker/rarity/exotic.png",
  },
  {
    id: "legendary",
    image: "./imgs/canvas/picker/rarity/legendary.png",
  },
];

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
