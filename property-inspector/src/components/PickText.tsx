import { Divider, Text } from "@mantine/core";

interface DropTextProps {
  selected: boolean;
  type: "item" | "loadout" | "inventory-item";
}

export const PickText = ({ selected, type }: DropTextProps) => (
  <Text
    size="sm"
    c="dimmed"
    style={{ textAlign: selected ? "left" : "center" }}
  >
    Click <strong>"Open on Stream Deck"</strong> on DIM to select a new {type}
  </Text>
);

export const PickSubText = ({ type }: Pick<DropTextProps, "type">) => (
  <>
    <Divider mt="sm" />
    <Text size="xs" c="dimmed" pt="sm">
      You can find this button in the{" "}
      {type === "loadout"
        ? "loadout card / in-game loadout menu"
        : "item sidebar"}
    </Text>
  </>
);
