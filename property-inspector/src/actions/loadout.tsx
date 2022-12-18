import { Button, Text, Paper, Title } from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";

export default () => {
  const { settings, sendToPlugin } = useStreamDeck();
  return (
    <Paper radius="md" withBorder p="sm">
      <Title ml={2} color="white" order={5}>
        {settings.label ?? "NO LOADOUT SELECTED"}
      </Title>
      <Text ml={2} color="dimmed">
        {settings["subtitle"] ?? "Class"}
      </Text>
      <Button
        onClick={() => sendToPlugin({ action: "select" })}
        variant="gradient"
        fullWidth
        mt={8}
      >
        {settings.item ? "CHANGE" : "PICK"} ON DIM
      </Button>
    </Paper>
  );
};
