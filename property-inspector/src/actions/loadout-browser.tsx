import { Select, Stack, Text, TextInput } from "@mantine/core";
import { LoadoutBrowserClass, Schemas } from "@plugin/types";
import { useStreamDeck } from "../hooks/useStreamDeck";

export default () => {
  const { settings, setSettings } = useStreamDeck(Schemas.loadoutBrowser);
  return (
    <Stack gap="sm">
      <Select
        label="Starting class"
        allowDeselect={false}
        value={settings.classFilter}
        data={[
          { value: "current", label: "Current character" },
          { value: "all", label: "All characters" },
          { value: "titan", label: "Titan" },
          { value: "hunter", label: "Hunter" },
          { value: "warlock", label: "Warlock" },
        ]}
        onChange={(value) => value && setSettings({ classFilter: value as LoadoutBrowserClass })}
      />
      <TextInput
        label="Starting hashtag"
        description="Optional. Matches hashtags in DIM loadout names and notes."
        placeholder="#raid"
        value={settings.hashtag}
        onChange={(e) => setSettings({ hashtag: e.currentTarget.value })}
      />
      <Text size="sm" c="dimmed">
        Press the key to browse. Use Filters to choose a class or hashtag, Next to change pages, and
        Exit to return. Tap a loadout to equip it on its listed character.
      </Text>
    </Stack>
  );
};
