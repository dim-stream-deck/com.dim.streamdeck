import {
  Box,
  Button,
  Divider,
  Group,
  Paper,
  Switch,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";

export default () => {
  const {
    settings,
    setSettings,
    sendToPlugin,
    globalSettings,
    setGlobalSettings,
  } = useStreamDeck();
  if (!settings.altActionTrigger) {
    setSettings({ altActionTrigger: "long" });
  }
  if (!settings.altAction) {
    setSettings({ altAction: "equip" });
  }
  return (
    <>
      <Paper radius="md" withBorder p="sm">
        <Title ml={2} color="white" order={5}>
          {settings.label ?? "NO ITEM SELECTED"}
        </Title>
        <Text ml={2} color="dimmed">
          {settings["subtitle"] ?? "Item type"}
        </Text>
        <Group grow mt={8}>
          <Button
            onClick={() => sendToPlugin({ action: "select" })}
            variant="gradient"
          >
            {settings.item ? "CHANGE" : "PICK ON DIM"}
          </Button>
          {settings.item && (
            <Button
              onClick={() =>
                sendToPlugin({ action: "show", id: settings.item })
              }
              ml={12}
              variant="default"
            >
              SHOW
            </Button>
          )}
        </Group>
      </Paper>
      {/* alt action settings */}
      {settings.item && (
        <Box p="sm">
          <Divider labelPosition="center" label="Gestures" mb="sm" />
          <Group spacing="xs" mb="xs">
            <Title ml={2} color="white" order={5}>
              Equip
            </Title>
            <Text size="sm" color="dimmed">
              (Alternative Action)
            </Text>
          </Group>
          <Tabs
            variant="pills"
            value={settings.altActionTrigger}
            onTabChange={(altActionTrigger) =>
              setSettings({ altActionTrigger })
            }
          >
            <Tabs.List grow mt={8}>
              <Tabs.Tab value="double">Double Press</Tabs.Tab>
              <Tabs.Tab value="hold">Hold</Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </Box>
      )}
      <Divider labelPosition="center" label="Accessibility" my="sm" />
      <Switch
        label="(Global) Grayscale filter for not-equipped items"
        checked={globalSettings.grayscale ?? true}
        onChange={(e) =>
          setGlobalSettings({ grayscale: e.currentTarget.checked })
        }
      />
    </>
  );
};
