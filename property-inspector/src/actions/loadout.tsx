import { Stack, Text } from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";
import { Droppable } from "../components/Droppable";
import { DropText } from "../components/DropText";

export default () => {
  const { settings, setSettings } = useStreamDeck();
  return (
    <Droppable type="loadout" onSelect={(data) => setSettings(data)}>
      <Stack>
        {settings.label && (
          <Text fw="bold" c="white">
            {settings.label}
          </Text>
        )}
        {settings.subtitle && <Text c="dimmed">{settings.subtitle}</Text>}
        <DropText type="loadout" selected={settings.label} />
      </Stack>
    </Droppable>
  );
};
