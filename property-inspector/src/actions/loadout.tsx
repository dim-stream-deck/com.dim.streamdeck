import { Group, Image, Stack, Text, ThemeIcon } from "@mantine/core";
import { useStreamDeck } from "../hooks/useStreamDeck";
import { PickerCard } from "../components/PickerCard";
import { PickSubText, PickText } from "../components/PickText";
import { IconX } from "@tabler/icons-react";
import { Schemas } from "@plugin/types";
import { useEffect } from "react";
import $ from "@elgato/streamdeck";

export default () => {
  const { settings, overrideSettings } = useStreamDeck(Schemas.loadout);

  useEffect(() => {
    $.plugin.registerRoute("/selection", (req, res) => {
      overrideSettings(req.body as any);
      res.send(200);
    });
  }, []);

  return (
    <PickerCard>
      <div>
        <Group>
          {settings.icon ? (
            <Image
              radius="md"
              w={64}
              h={64}
              src={`https://bungie.net${settings.icon}`}
            />
          ) : settings.inGameIcon ? (
            <Image
              style={{
                background: `url("https://bungie.net${settings.inGameIcon.background}")`,
              }}
              radius="md"
              draggable={false}
              w={64}
              h={64}
              src={`https://bungie.net${settings.inGameIcon.icon}`}
            />
          ) : (
            <ThemeIcon variant="light" style={{ width: 64, height: 64 }}>
              <IconX />
            </ThemeIcon>
          )}
          <Stack gap="sm" flex={1}>
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
            <PickText type="loadout" selected={Boolean(settings.label)} />
          </Stack>
        </Group>
        <PickSubText type="loadout" />
      </div>
    </PickerCard>
  );
};
