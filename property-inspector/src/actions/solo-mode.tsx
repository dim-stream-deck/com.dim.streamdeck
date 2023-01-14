import { Alert, Button, Divider, Group, Text } from "@mantine/core";
import { IconApps, IconSettings, IconTrash } from "@tabler/icons";
import { useStreamDeck } from "../StreamDeck";

export default () => {
  const { openURL, globalSettings, sendToPlugin } = useStreamDeck();
  const { enabledSoloService = false } = globalSettings;
  return (
    <div>
      <Alert
        radius="md"
        mb="sm"
        icon={<IconSettings size={24} />}
        color="blue"
        variant="outline"
        title="Platform"
      >
        <Text mt={-4} color="dimmed">
          This action works only on <strong>Windows 10/11</strong> pc.
        </Text>
      </Alert>

      <Divider labelPosition="center" label="Windows Service" my="sm" />

      <Group mb="xs" spacing={0}>
        <Text size="sm" color="dimmed">
          This action is required only the first time. For info about how this
          works please visit the{" "}
        </Text>
        <Text
          size="sm"
          mx={4}
          color="blue"
          fw="bold"
          sx={{ cursor: "pointer" }}
          onClick={() =>
            openURL(
              "https://github.com/dim-stream-deck/com.dim.streamdeck/wiki/Solo-Mode-(Action)"
            )
          }
        >
          wiki
        </Text>
        <Text size="sm" color="dimmed">
          on GitHub.
        </Text>
      </Group>

      <Button
        variant="filled"
        color={enabledSoloService ? "red" : "blue"}
        onClick={() =>
          sendToPlugin({
            action: enabledSoloService ? "remove-service" : "install-service",
          })
        }
        fullWidth
        leftIcon={
          enabledSoloService ? <IconTrash size={24} /> : <IconApps size={24} />
        }
      >
        {enabledSoloService ? "Remove" : "Install"} the service
      </Button>
    </div>
  );
};
