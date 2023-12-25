import { Alert, Button, Divider, Group, Text } from "@mantine/core";
import { IconApps, IconBrandWindows, IconX } from "@tabler/icons-react";
import { useStreamDeck } from "../StreamDeck";
import { useEffect, useState } from "react";

export default () => {
  const { openURL, globalSettings, sendToPlugin } = useStreamDeck();
  const { enabledSoloService = false } = globalSettings;
  const [prev, setPrev] = useState(enabledSoloService);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prev !== enabledSoloService) {
      setLoading(false);
      setPrev(enabledSoloService);
    }
  }, [enabledSoloService, prev]);

  return (
    <div>
      <Alert
        radius="md"
        mb="sm"
        icon={<IconBrandWindows size={24} />}
        color="#222222"
        variant="filled"
        title="Platform"
      >
        <Text mt={-4} c="dimmed">
          This action works only on <strong>Windows 10/11</strong> pc.
        </Text>
      </Alert>

      <Divider labelPosition="center" label="Windows Service" my="sm" />

      <Group mb="xs" gap={0}>
        <Text size="sm">
          This action is required only the first time. For more info about how
          this "solo mode" works please see the{" "}
        </Text>
        <Text
          size="sm"
          mx={4}
          c="dim"
          fw="bold"
          style={{ cursor: "pointer" }}
          onClick={() =>
            openURL(
              "https://github.com/dim-stream-deck/com.dim.streamdeck/wiki/Solo-Mode-(Action)"
            )
          }
        >
          wiki
        </Text>
        <Text size="sm">on GitHub.</Text>
      </Group>

      <Button
        variant="filled"
        color={enabledSoloService ? "#202020" : "dim"}
        loading={loading}
        onClick={() => {
          setLoading(true);
          sendToPlugin({
            action: enabledSoloService ? "remove-service" : "install-service",
          });
        }}
        fullWidth
        leftSection={
          enabledSoloService ? <IconX size={20} /> : <IconApps size={20} />
        }
      >
        {enabledSoloService ? "Remove" : "Install"} the service
      </Button>
    </div>
  );
};
