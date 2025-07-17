import {
  ActionIcon,
  Divider,
  Flex,
  Group,
  Image,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useStreamDeck } from "../hooks/useStreamDeck";
import { PickerCard } from "../components/PickerCard";
import { IconTrash, IconX } from "@tabler/icons-react";
import { PickText } from "../components/PickText";
import { Schemas, VaultSettings } from "@plugin/types";
import { useEffect } from "react";
import $ from "@elgato/streamdeck";

type VaultItem = VaultSettings["items"][number];

export default () => {
  const { settings, overrideSettings } = useStreamDeck(Schemas.vault);

  if (!settings) {
    return;
  }

  useEffect(() => {
    $.plugin.registerRoute("/selection", (req, res) => {
      const newItems = [...(settings.items ?? []), req.body as VaultItem];
      overrideSettings({
        items: newItems,
        current: settings.current,
      });
      res.send(200);
    });
  }, [settings]);

  return (
    <Stack gap="sm">
      <PickerCard>
        <Group gap="sm">
          <Stack gap={4} style={{ flex: 1 }}>
            <PickText type="inventory-item" selected={false} />
          </Stack>
        </Group>
      </PickerCard>
      {settings.items.map((item, index) => (
        <>
          <Group>
            {item?.icon ? (
              <Image
                radius="md"
                w={64}
                h={64}
                draggable={false}
                src={`https://bungie.net${item.icon}`}
              />
            ) : (
              <ThemeIcon variant="light" style={{ width: 64, height: 64 }}>
                <IconX />
              </ThemeIcon>
            )}
            <Flex flex={1} direction="column">
              <Text variant="text">{item.label}</Text>
              <Text variant="text" c="dimmed">
                {item.subtitle}
              </Text>
            </Flex>
            <ActionIcon
              variant="subtle"
              c="dim"
              onClick={() => {
                const newItems = settings.items.filter((_, i) => i !== index);
                overrideSettings({
                  items: newItems,
                  current: settings.current % newItems.length || 0,
                });
              }}
            >
              <IconTrash />
            </ActionIcon>
          </Group>
          {index < settings.items.length - 1 && <Divider />}
        </>
      ))}
    </Stack>
  );
};
