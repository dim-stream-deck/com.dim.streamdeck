import { Button, Group, Paper, Text, Title } from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";

export default () => {
  const { settings, sendToPlugin } = useStreamDeck();
  return (
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
  );
};
