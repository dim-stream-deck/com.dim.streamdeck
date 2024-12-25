import { Alert, Button, Divider, Group, Text } from "@mantine/core";
import { IconApps, IconBrandWindows, IconX } from "@tabler/icons-react";
import { useStreamDeck } from "../hooks/useStreamDeck";
import streamDeck from "@elgato/streamdeck";
import { useMutation } from "@tanstack/react-query";

export default () => {
  const { os, globalSettings } = useStreamDeck();
  const { enabledSoloService = false } = globalSettings;

  const { isPending, mutate } = useMutation({
    mutationKey: ["solo-mode", enabledSoloService],
    mutationFn: async (action: string) =>
      streamDeck.plugin.fetch("update-solo-service", action),
  });

  return (
    <div>
      {os !== "windows" ? (
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
      ) : (
        <>
          <Alert title="Warning" color="#222222" variant="filled">
            <Text mt={-4} c="dimmed">
              This actions works only if you use{" "}
              <strong>Windows Defender</strong> as Firewall
            </Text>
          </Alert>

          <Divider labelPosition="center" label="Windows Service" my="sm" />

          <Group mb="xs" gap={0}>
            <Text size="sm">
              This is required the first time only. For more info about how this
              "solo mode" works please see the
              <Text
                component="span"
                inline
                mx={4}
                c="dim"
                fw="bold"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  streamDeck.system.openUrl(
                    "https://github.com/dim-stream-deck/com.dim.streamdeck/wiki/Solo-Mode-(Action)"
                  )
                }
              >
                wiki
              </Text>
              on GitHub.
            </Text>
          </Group>

          <Button
            variant="filled"
            color={enabledSoloService ? "#202020" : "dim"}
            loading={isPending}
            onClick={() => mutate(enabledSoloService ? "remove" : "install")}
            fullWidth
            leftSection={
              enabledSoloService ? <IconX size={20} /> : <IconApps size={20} />
            }
          >
            {enabledSoloService ? "Remove" : "Install"} the service
          </Button>
        </>
      )}
    </div>
  );
};
