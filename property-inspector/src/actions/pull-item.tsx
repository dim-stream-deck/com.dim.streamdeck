import {Button, Divider, Group, Paper, SegmentedControl, Switch, Tabs, Text, Title} from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";
const resources = [
  { value: "equip", label: "Equip" },
  { value: "vault", label: "Vault" },
];

export default () => {
  const { settings, setSettings, sendToPlugin, globalSettings, setGlobalSettings } = useStreamDeck();
  if (!settings.altActionTrigger) {
    setSettings({altActionTrigger: "hold"})
  }
  if (!settings.altAction) {
    setSettings({altAction: "equip"})
  }
  return (<>
    <Paper radius="md" withBorder p="sm">
      <Title ml={2} color="white" order={5}>
        {settings.label ?? "NO ITEM SELECTED"}
      </Title>
      <Text ml={2} color="dimmed">
        {settings["subtitle"] ?? "Item type"}
      </Text>
      <Group grow mt={8}>
        <Button
          onClick={() => sendToPlugin({ action: "select" })}
          variant="gradient"
        >
          {settings.item ? "CHANGE" : "PICK ON DIM"}
        </Button>
        {settings.item && (
          <Button
            onClick={() => sendToPlugin({ action: "show", id: settings.item })}
            ml={12}
            variant="default"
          >
            SHOW
          </Button>
        )}
      </Group>

      <Paper withBorder mt={12} p={8}>
        <Title ml={2}  color="white" order={5}>
          {"Alt Action"}
        </Title>
        {settings.item && <div>
          <Tabs
            variant="pills"
            value={settings.altActionTrigger}
            onTabChange={altActionTrigger => setSettings({altActionTrigger})}
          >
            <Tabs.List grow mt={8}>
              <Tabs.Tab value="double">Double Press</Tabs.Tab>
              <Tabs.Tab value="hold">Hold</Tabs.Tab>
            </Tabs.List>
            </Tabs>
            <Divider mt={2}/>
            <SegmentedControl
              fullWidth
              color="primary"
              orientation="vertical"
              value={settings.altAction}
              onChange={(altAction) => setSettings({ altAction })}
              data={resources.map((it) => ({
                value: it.value,
                label: (
                  <Group>
                    <Text ml="sm">{it.label}</Text>
                  </Group>
                ),
              }))}
            />
        </div>}
      </Paper>
    </Paper>
      <Divider labelPosition="center" label="Accessibility" my="sm" />
      <Switch
          label="(Global) Grayscale filter for not-equipped items"
          checked={globalSettings.grayscale ?? true}
          onChange={(e) =>
              setGlobalSettings({ grayscale: e.currentTarget.checked })
          }
      />
      </>
  );
};
