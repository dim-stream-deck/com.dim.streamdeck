import { Group, Image, Stack, Text, ThemeIcon } from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";
import { Droppable } from "../components/Droppable";
import { DropText } from "../components/DropText";
import { IconX } from "@tabler/icons-react";
import { Schemas } from "@plugin/types";

export default () => {
  const { settings, setSettings } = useStreamDeck(Schemas.loadout);
  return (
    <Droppable
      type="loadout"
      onSelect={(data) =>
        setSettings(data, {
          replace: true,
        })
      }
    >
      <Stack gap="sm">
        <Group wrap="nowrap">
          {settings?.icon ? (
            <Image
              radius="md"
              width={64}
              height={64}
              src={`https://bungie.net${settings.icon}`}
            />
          ) : settings.inGameIcon ? (
            <Image
              style={{
                background: `url("https://bungie.net${settings.inGameIcon.background}")`,
              }}
              radius="md"
              draggable={false}
              width={64}
              height={64}
              src={`https://bungie.net${settings.inGameIcon.icon}`}
            />
          ) : (
            <ThemeIcon variant="light" style={{ width: 64, height: 64 }}>
              <IconX />
            </ThemeIcon>
          )}
          <Stack gap="sm">
            {settings.label && (
              <Group gap={4}>
                <Text fw="bold" c="white" size="sm">
                  {settings.label}
                </Text>
                <Text inline size="xs" c="dimmed">
                  ({settings.subtitle || "in-game"})
                </Text>
              </Group>
            )}
            <DropText type="loadout" selected={Boolean(settings.label)} />
          </Stack>
        </Group>
      </Stack>
    </Droppable>
  );
};
