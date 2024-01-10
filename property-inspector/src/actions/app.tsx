import { Divider, Group, SegmentedControl } from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";
import {
  IconBrandChrome,
  IconBrandWindows,
  IconBrowser,
} from "@tabler/icons-react";
import { AppType, AppTypeSchema, Schemas } from "@plugin/types";

const Options = [
  {
    value: "app-browser",
    label: "app.destinyitemmanager.com",
    icon: <IconBrowser />,
  },
  {
    value: "beta-browser",
    label: "beta.destinyitemmanager.com",
    icon: <IconBrowser />,
  },
  {
    value: "app-chrome",
    label: "Chrome PWA",
    icon: <IconBrandChrome />,
  },
  {
    value: "beta-chrome",
    label: "Chrome PWA (Beta)",
    icon: <IconBrandChrome />,
  },
  {
    value: "app-windows",
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
  const color = settings.type?.startsWith("beta") ? "cyan" : "dim";

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
    <div>
      <Divider labelPosition="center" label="Flavor" mb="sm" />
      <SegmentedControl
        fullWidth
        orientation="vertical"
        onChange={(value) => {
          const type = AppTypeSchema.parse(value);
          setSettings({ type }, { replace: true });
        }}
        color={color}
        data={data}
        value={settings.type}
      />
    </div>
  );
};
