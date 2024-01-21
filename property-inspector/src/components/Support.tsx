import {
  Badge,
  Button,
  Card,
  CardSection,
  Group,
  Image,
  Text,
} from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";
import patreon from "../assets/patreon.png";

const DAY = 1000 * 3600 * 24;

export const Support = () => {
  const { globalSettings, openURL, setGlobalSettings } = useStreamDeck();

  if (globalSettings.setupDate) {
    const setupDate = new Date(globalSettings.setupDate).getTime();
    const diff = new Date().getTime() - setupDate;
    const days = Math.floor(diff / DAY);

    if (globalSettings.promptSupport && days > 3) {
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
              openURL(import.meta.env.VITE_PATREON);
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
                setGlobalSettings({
                  setupDate: new Date(setupDate + 3 * DAY),
                });
              }}
            >
              Remind me later
            </Button>
            <Button
              variant="light"
              color="gray"
              radius="md"
              onClick={() =>
                setGlobalSettings({
                  promptSupport: false,
                })
              }
            >
              No
            </Button>
          </Group>
        </Card>
      );
    }
  }

  return null;
};

export default Support;
