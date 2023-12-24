import {
  Autocomplete,
  Box,
  Center,
  Divider,
  SegmentedControl,
} from "@mantine/core";
import { IconHandGrab, IconSearch } from "@tabler/icons-react";
import { useStreamDeck } from "../StreamDeck";

export default () => {
  const { settings, setSettings } = useStreamDeck();

  return (
    <div>
      <Divider labelPosition="center" mb="sm" label="Search" />
      <Autocomplete
        radius="xs"
        data={[]}
        defaultValue={settings.query ?? settings.search ?? ""}
        placeholder="Search item/perk"
        onChange={(value) => setSettings({ search: value })}
      />
      <Divider labelPosition="center" my="sm" label="Page" />
      <SegmentedControl
        color="dim"
        size="xs"
        transitionDuration={300}
        radius="xs"
        transitionTimingFunction="linear"
        fullWidth
        value={settings.page}
        onChange={(value) => setSettings({ page: value })}
        data={[
          { label: "Inventory", value: "inventory" },
          { label: "Progress", value: "progress" },
          { label: "Vendors", value: "vendors" },
          { label: "Records", value: "records" },
        ]}
      />
      <Divider labelPosition="center" my="sm" label="Behavior" />
      <SegmentedControl
        fullWidth
        radius="xs"
        size="xs"
        color="dim"
        transitionDuration={300}
        transitionTimingFunction="linear"
        value={settings.pullItems ? "pull" : "search"}
        onChange={(value) => setSettings({ pullItems: value === "pull" })}
        data={[
          {
            label: (
              <Center>
                <IconSearch size={16} />
                <Box ml={10}>Search Only</Box>
              </Center>
            ),
            value: "search",
          },
          {
            label: (
              <Center>
                <IconHandGrab size={16} />
                <Box ml={10}>Pull Items</Box>
              </Center>
            ),
            value: "pull",
          },
        ]}
      />
    </div>
  );
};
