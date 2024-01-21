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

export const Support = () => {
  const { globalSettings } = useStreamDeck();

  if (globalSettings.setupDate) {
    const diff =
      new Date().getTime() - new Date(globalSettings.setupDate).getTime();
    const days = Math.floor(diff / (1000 * 3600 * 24));
    if (false || days > 3) {
      return (
        <Card>
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

          <Button color="dim" fullWidth mt="md" radius="md">
            Become a patreon
          </Button>
        </Card>
      );
    }
  }

  return null;
};

export default Support;
