import {
  Collapse,
  Divider,
  Group,
  Image,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";
import { Droppable } from "../components/Droppable";
import { useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import { DropText } from "../components/DropText";

export default () => {
  const { settings, setSettings, globalSettings, setGlobalSettings } =
    useStreamDeck();

  useEffect(() => {
    if (!settings.altActionTrigger) {
      setSettings({ altActionTrigger: "hold" });
    }
  }, [settings]);

  if (!settings || !globalSettings) {
    return;
  }

  return (
    <Stack gap="sm">
      <Droppable
        type="item"
        onSelect={(data) =>
          setSettings({ ...data, element: data.element ?? null })
        }
      >
        <Group gap="sm">
          {settings?.icon ? (
            <Image
              radius="md"
              width={64}
              height={64}
              draggable={false}
              src={`https://bungie.net${settings.icon}`}
            />
          ) : (
            <ThemeIcon variant="light" style={{ width: 64, height: 64 }}>
              <IconX />
            </ThemeIcon>
          )}
          <Stack gap="sm" style={{ flex: 1 }}>
            {settings.label && (
              <Text
                fw="bold"
                c="white"
                size="sm"
                style={{
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  maxWidth: 160,
                }}
              >
                {settings.label}
              </Text>
            )}
            <DropText type="item" selected={settings.label} />
          </Stack>
        </Group>
      </Droppable>
      {/* alt action settings */}
      <Collapse in={settings.item}>
        <Divider
          labelPosition="center"
          label="Equip (Alternative Action)"
          mb="sm"
        />
        <SegmentedControl
          w="100%"
          data={[
            { value: "double", label: "Double Press" },
            { value: "hold", label: "Hold" },
          ]}
          size="sm"
          color="dim"
          value={settings.altActionTrigger}
          onChange={(altActionTrigger) => setSettings({ altActionTrigger })}
        />
      </Collapse>
      <div>
        <Divider labelPosition="center" label="Accessibility" mb="sm" />
        <Switch
          mb="xs"
          label="(Global) Grayscale filter for not-equipped items"
          checked={globalSettings.equipmentGrayscale ?? true}
          onChange={(e) =>
            setGlobalSettings({ equipmentGrayscale: e.currentTarget.checked })
          }
        />
      </div>
    </Stack>
  );
};
