import {
  Autocomplete,
  Checkbox,
  Divider,
  Group,
  SegmentedControl,
  Switch,
} from "@mantine/core";
import { IconArrowBackUp, IconHandGrab, IconSearch } from "@tabler/icons-react";
import { useStreamDeck } from "../hooks/useStreamDeck";
import { Schemas, SearchBehavior } from "@plugin/types";
import React from "react";

const Behaviors = [
  {
    label: "Search Only",
    icon: <IconSearch />,
    value: "search",
  },
  {
    label: "Pull Items",
    icon: <IconHandGrab />,
    value: "pull",
  },
  {
    label: "Send to Vault",
    icon: <IconArrowBackUp />,
    value: "send-to-vault",
  },
] satisfies Array<{
  label: string;
  icon: React.ReactNode;
  value: SearchBehavior;
}>;

export default () => {
  const { settings, setSettings } = useStreamDeck(Schemas.search);

  const behavior = Behaviors.map((it) => ({
    ...it,
    label: (
      <Group>
        {it.icon}
        {it.label}
      </Group>
    ),
  }));

  return (
    <div>
      <Divider labelPosition="center" mb="sm" label="Search" />
      <Autocomplete
        radius="xs"
        data={[]}
        defaultValue={settings.query}
        placeholder="Search item/perk"
        onChange={(query) => setSettings({ query })}
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
        color="dim"
        orientation="vertical"
        transitionDuration={300}
        transitionTimingFunction="linear"
        value={settings.behavior}
        onChange={(value) => setSettings({ behavior: value as SearchBehavior })}
        data={behavior}
      />
      {settings.behavior === "search" && (
        <>
          <Divider labelPosition="center" my="sm" label="Additive Filter" />
          <Switch
            mt="sm"
            label="Append query to existing filters"
            checked={settings.append}
            onChange={(e) => setSettings({ append: e.target.checked })}
          />
        </>
      )}
    </div>
  );
};
