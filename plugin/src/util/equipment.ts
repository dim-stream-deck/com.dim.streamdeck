import { State } from "@/state";

export const Equipment = new Set<string>();

export const toggleEquipment = (item: string, equipped: boolean) => {
  if (equipped) {
    Equipment.add(item);
  } else {
    Equipment.delete(item);
  }
  // update state
  const equippedItems = Array.from(Equipment);
  State.set({ equippedItems });
};
