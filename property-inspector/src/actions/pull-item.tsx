import {
  Accordion,
  Collapse,
  Divider,
  Fieldset,
  Group,
  Image,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";
import { PickerCard } from "../components/PickerCard";
import { IconAccessible, IconHandClick, IconX } from "@tabler/icons-react";
import { PickSubText, PickText } from "../components/PickText";
import { Schemas } from "@plugin/types";
import { useEffect } from "react";
import { z } from "zod";

const CommunicationSchema = z.object({
  action: z.literal("selection"),
  data: z.record(z.any()),
});

export default () => {
  const {
    log,
    settings,
    setSettings,
    globalSettings,
    setGlobalSettings,
    communication,
    sendToPlugin,
  } = useStreamDeck(Schemas.pullItem);

  if (!settings || !globalSettings) {
    return;
  }

  const gestures = [
    {
      label: "single press",
      key: "pullItemSinglePress",
    },
    {
      label: "double press",
      key: "pullItemDoublePress",
    },
    {
      label: "hold press",
      key: "pullItemHoldPress",
    },
  ] as const;

  const gesturesSettings = settings.keepGestureLocal
    ? settings
    : globalSettings;

  const setGestures = settings.keepGestureLocal
    ? setSettings
    : setGlobalSettings;

  useEffect(() => {
    const parsed = CommunicationSchema.safeParse(communication);
    if (parsed.data) {
      const data = parsed.data.data;
      setSettings({ ...data, element: data.element ?? null });
    }
  }, [communication]);

  return (
    <Stack gap="sm">
      <PickerCard>
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
          <Stack gap={4} style={{ flex: 1 }}>
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
            <PickText type="item" selected={Boolean(settings.label)} />
          </Stack>
        </Group>
        <PickSubText type="item" />
      </PickerCard>

      <Collapse in={!settings.isSubClass && !!settings.item}>
        <Accordion>
          <Accordion.Item value="gestures">
            <Accordion.Control icon={<IconHandClick />}>
              Gestures
            </Accordion.Control>
            <Accordion.Panel>
              <Stack>
                <Fieldset legend="Local Gestures">
                  <Switch
                    mt="sm"
                    label="Apply only to this action"
                    checked={settings?.keepGestureLocal ?? false}
                    onChange={(e) =>
                      setSettings({
                        keepGestureLocal: e.currentTarget.checked,
                      })
                    }
                  />
                </Fieldset>
                {gestures.map((it, i) => (
                  <Fieldset legend={it.label}>
                    <SegmentedControl
                      fullWidth
                      color="dim"
                      size="sm"
                      data={["equip", "pull", "vault"]}
                      value={gesturesSettings[it.key]}
                      onChange={(action) => {
                        setGestures({
                          [it.key]: action,
                        });
                      }}
                    />
                    {globalSettings[it.key] === "pull" && (
                      <>
                        <Divider my="xs" />
                        <Group mt="xs" wrap="nowrap">
                          <Switch
                            checked={gesturesSettings.pullItemSingleToggle}
                            onChange={(e) =>
                              setGestures({
                                pullItemSingleToggle: e.currentTarget.checked,
                              })
                            }
                          />
                          <Text c="dimmed" size="sm">
                            if the item is already equipped send it to the{" "}
                            <strong>vault</strong>
                          </Text>
                        </Group>
                      </>
                    )}
                  </Fieldset>
                ))}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="accessibility">
            <Accordion.Control icon={<IconAccessible />}>
              Accessibility
            </Accordion.Control>
            <Accordion.Panel>
              <Switch
                mt="xs"
                label="Grayscale filter for not-equipped items"
                checked={globalSettings.equipmentGrayscale ?? true}
                onChange={(e) => {
                  setGlobalSettings({
                    equipmentGrayscale: e.currentTarget.checked,
                  });
                  sendToPlugin({
                    action: "updateSettings",
                  });
                }}
              />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Collapse>
    </Stack>
  );
};
