import { Text } from "@mantine/core";

interface DropTextProps {
  selected: boolean;
  type: "item" | "loadout";
}

export const DropText = ({ selected, type }: DropTextProps) => (
  <div>
    <Text
      size="sm"
      c="dimmed"
      style={{ textAlign: selected ? "left" : "center" }}
    >
      Click "Open on Stream Deck" on DIM to select a new ${type}
    </Text>
    <br />
    <Text
      size="xs"
      c="dimmed"
      style={{ textAlign: selected ? "left" : "center" }}
    >
      You can find this button in the{" "}
      {type === "loadout" ? "loadout view / loadout menu" : "item sidebar"}
    </Text>
  </div>
);
