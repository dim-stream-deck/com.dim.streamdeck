import { useStreamDeck } from "../StreamDeck";
import record from "../assets/progress/record.png";
import weapon from "../assets/progress/weapon.png";
import { Button, Paper, Text, Title } from "@mantine/core";

export default () => {
  const { settings, sendToPlugin } = useStreamDeck();

  return (
    <div>
      <Paper radius="md" mt="sm" withBorder p="sm" pb={0}>
        <Title ml={2} color="white" order={5}>
          {settings.label ?? "NO ITEM SELECTED"}
        </Title>
        <Text ml={2} color="dimmed">
          {settings["subtitle"] ?? "Item type"}
        </Text>

        <Button
          mt="sm"
          fullWidth
          leftIcon={<img src={record} alt="record" height={20} />}
          onClick={() => sendToPlugin({ action: "select", type: "record" })}
          variant="gradient"
        >
          PICK RECORD
        </Button>
        <Button
          my="sm"
          fullWidth
          leftIcon={<img src={weapon} alt="weapon" height={20} />}
          onClick={() => sendToPlugin({ action: "select", type: "weapon" })}
          variant="gradient"
        >
          PICK WEAPON
        </Button>
        {settings.item && (
          <Button
            fullWidth
            onClick={() => sendToPlugin({ action: "show", id: settings.item })}
            variant="default"
          >
            SHOW
          </Button>
        )}

        <Text color="dimmed">
          <p>
            <strong>RECORD</strong> triumphs, challenges, bounties
          </p>
          <p>
            <strong>WEAPON</strong> crafted or deepsight
          </p>
        </Text>
      </Paper>
    </div>
  );
};
