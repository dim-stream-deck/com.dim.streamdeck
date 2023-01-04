import {Button, Divider, Group, Paper, Switch, Text, Title} from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";

export default () => {
  const { settings, sendToPlugin, globalSettings, setGlobalSettings } = useStreamDeck();
  return (<>
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
            onClick={() => sendToPlugin({ action: "show", id: settings.item })}
            ml={12}
            variant="default"
          >
            SHOW
          </Button>
        )}
      </Group>
    </Paper>
      <Divider labelPosition="center" label="Accessibility" my="sm" />
      <Switch
          label="Grayscale filter for not-equipped items (this setting is global)"
          checked={globalSettings.grayscale ?? true}
          onChange={(e) =>
              setGlobalSettings({ grayscale: e.currentTarget.checked })
          }
      />
      </>
  );
};
