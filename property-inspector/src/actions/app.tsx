import { Divider, Group, SegmentedControl, Stack, Switch } from "@mantine/core";
import { useStreamDeck } from "../hooks/useStreamDeck";
import {
  IconBrandChrome,
  IconBrandEdge,
  IconBrandWindows,
  IconBrowser,
} from "@tabler/icons-react";
import { AppType, AppTypeSchema, Schemas } from "@plugin/types";

const Options = [
  {
    value: "browser",
    label: "Browser",
    icon: <IconBrowser />,
  },
  {
    value: "chrome",
    label: "Chrome App",
    icon: <IconBrandChrome />,
  },
  {
    value: "edge",
    label: "Edge App",
    icon: <IconBrandEdge />,
  },
  {
    value: "windows",
    label: "Windows App",
    icon: <IconBrandWindows />,
  },
] satisfies Array<{
  value: AppType;
  label: string;
  icon: React.ReactNode;
}>;

export default () => {
  const { settings, setSettings } = useStreamDeck(Schemas.app);

  const data = Options.map((it) => ({
    ...it,
    label: (
      <Group>
        {it.icon}
        {it.label}
      </Group>
    ),
  }));

  return (
    <Stack gap="xs">
      <Divider labelPosition="center" label="Open" />
      <SegmentedControl
        fullWidth
        orientation="vertical"
        onChange={(value) => {
          const open = AppTypeSchema.parse(value);
          setSettings({
            open,
            beta: open === "windows" ? false : settings.beta,
          });
        }}
        color="dim"
        data={data}
        value={settings.open}
      />
      <Divider labelPosition="center" label="Flavor" />
      <Switch
        label="Beta"
        checked={settings.beta}
        onChange={(e) => setSettings({ beta: e.target.checked })}
      />
    </Stack>
  );
};
