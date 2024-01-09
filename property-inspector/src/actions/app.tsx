import { Divider, Group, SegmentedControl } from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";
import {
  IconBrandChrome,
  IconBrandWindows,
  IconBrowser,
} from "@tabler/icons-react";
import { AppSettings, AppType } from "shared";

export default () => {
  const { settings, setSettings } = useStreamDeck<AppSettings>();
  const type =
    settings.beta === true ? "beta-browser" : settings.type ?? "app-browser";
  const color = settings.type?.startsWith("beta") ? "cyan" : "dim";

  const data = [
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
    { value: "app-chrome", label: "Chrome PWA", icon: <IconBrandChrome /> },
    {
      value: "beta-chrome",
      label: "Chrome PWA (Beta)",
      icon: <IconBrandChrome />,
    },
    { value: "app-windows", label: "Windows App", icon: <IconBrandWindows /> },
  ].map((it) => ({
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
        onChange={(value) =>
          setSettings({ type: value as AppType }, { replace: true })
        }
        color={color}
        data={data}
        value={type}
      />
    </div>
  );
};
