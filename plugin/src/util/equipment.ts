import { setGlobalSettings } from "@/main";

export const Equipment = new Set<string>();

export const toggleEquipment = (item: string, equipped: boolean) => {
  if (equipped) {
    Equipment.add(item);
  } else {
    Equipment.delete(item);
  }
  return setGlobalSettings({
    equippedItems: Array.from(Equipment),
  });
};
