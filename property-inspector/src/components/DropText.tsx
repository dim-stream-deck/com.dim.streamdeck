import { Text } from "@mantine/core";

interface DropTextProps {
  selected: boolean;
  type: "item" | "loadout";
}

export const DropText = ({ selected, type }: DropTextProps) => (
  <Text
    size="sm"
    c="dimmed"
    style={{ textAlign: selected ? "left" : "center" }}
  >
    Drop here to
    {selected ? " " : <br />}
    <strong>select</strong> or <strong>change {type}</strong>
  </Text>
);
