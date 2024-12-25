import {
  Badge,
  Button,
  Card,
  CardSection,
  Group,
  Image,
  Text,
} from "@mantine/core";
import { useStreamDeck } from "../hooks/useStreamDeck";
import patreon from "../assets/patreon.png";
import { log } from "../logger";
import dayjs from "dayjs";
import $ from "@elgato/streamdeck";

export const Support = () => {
  const { globalSettings, setGlobalSettings } = useStreamDeck();
  const { setupDate, promptSupport } = globalSettings;

  if (setupDate) {
    const days = dayjs().diff(dayjs(setupDate), "day");
    if (promptSupport && days > 3) {
      return (
        <Card mb="md">
          <CardSection bg="white">
            <Image src={patreon} />
          </CardSection>
          <Group justify="space-between" mt="md" mb="xs" wrap="nowrap">
            <Text fw={500}>Support me!</Text>
            <Badge size="sm" color="dim">
              1$/month
            </Badge>
          </Group>
          <Text size="sm" c="dimmed">
            Hello! If you want to support this project, and other plugins I'm
            working on for Stream Deck, please consider becoming a patron. 😊
          </Text>
          <Text size="sm" c="dimmed" mt="md">
            I have new tiers, starting from 1$/month!
          </Text>
          <Button
            color="dim"
            fullWidth
            mt="md"
            radius="md"
            onClick={() => {
              $.system.openUrl(import.meta.env.VITE_PATREON);
              log("support:open");
              setGlobalSettings({
                promptSupport: false,
              });
            }}
          >
            Become a patreon
          </Button>
          <Group wrap="nowrap" mt="md">
            <Button
              flex={1}
              variant="light"
              color="dim"
              radius="md"
              onClick={() => {
                // add 3 days to the setup date
                log("support:remind");
                setGlobalSettings({
                  setupDate: dayjs(setupDate).add(3, "day").toISOString(),
                });
              }}
            >
              Remind me later
            </Button>
            <Button
              variant="light"
              color="gray"
              radius="md"
              onClick={() => {
                log("support:dismiss");
                setGlobalSettings({
                  promptSupport: false,
                });
              }}
            >
              Dismiss
            </Button>
          </Group>
        </Card>
      );
    }
  }

  return null;
};

export default Support;
