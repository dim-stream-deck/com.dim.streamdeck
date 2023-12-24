import {
  Avatar,
  Divider,
  Group,
  SegmentedControl,
  Switch,
  Text,
} from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";
import Shard from "../assets/postmaster/shard.jpg";
import Spoils from "../assets/postmaster/spoils.jpg";
import Prism from "../assets/postmaster/Prism.jpg";
import PostmasterIcon from "../assets/postmaster/postmaster.png";
import Percent from "../assets/postmaster/percent.png";
import Count from "../assets/postmaster/count.png";

const resources = [
  { value: "total", image: PostmasterIcon, label: "Counter" },
  { value: "enhancementPrisms", image: Prism, label: "Enhancement Prisms" },
  { value: "ascendantShards", image: Shard, label: "Ascendant Shards" },
  { value: "spoils", image: Spoils, label: "Spoils of Conquest" },
];

const styles = [
  { value: "percentage", image: Percent, label: "Percentage" },
  { value: "counter", image: Count, label: "Counter" },
];

export default () => {
  const { settings, setSettings } = useStreamDeck();

  return (
    <div>
      {settings.postmasterItem === "total" && (
        <>
          <Divider labelPosition="center" label="Style" mb="sm" />
          <SegmentedControl
            mb="sm"
            fullWidth
            orientation="vertical"
            value={settings.style}
            onChange={(style) => setSettings({ style })}
            data={styles.map((it) => ({
              value: it.value,
              label: (
                <Group>
                  <Avatar size="sm" src={it.image} />
                  <Text ml="sm">{it.label}</Text>
                </Group>
              ),
            }))}
          />
          <Divider labelPosition="center" label="Interaction" mb="sm" />
          <Switch
            label="Collect items on tap"
            checked={settings.collectPostmaster ?? false}
            onChange={(e) =>
              setSettings({ collectPostmaster: e.currentTarget.checked })
            }
          />
        </>
      )}
      <Divider labelPosition="center" label="Item" my="sm" />
      <SegmentedControl
        fullWidth
        orientation="vertical"
        value={settings.postmasterItem}
        onChange={(postmasterItem) => setSettings({ postmasterItem })}
        data={resources.map((it) => ({
          value: it.value,
          label: (
            <Group>
              <Avatar size="sm" src={it.image} />
              <Text ml="sm">{it.label}</Text>
            </Group>
          ),
        }))}
      />
    </div>
  );
};
