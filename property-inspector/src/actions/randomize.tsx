import { Divider, Group, SegmentedControl, Title } from "@mantine/core";
import { useStreamDeck } from "../hooks/useStreamDeck";
import { Icon } from "../icon/Icon";
import { Schemas } from "@plugin/types";

export default () => {
  const { settings, setSettings } = useStreamDeck(Schemas.randomize);
  const weaponsOnly = settings.weaponsOnly;

  return (
    <div>
      <Divider labelPosition="center" label="Type" mb="sm" />
      <SegmentedControl
        fullWidth
        onChange={(value) => setSettings({ weaponsOnly: value === "weapons" })}
        color="dim"
        data={[
          {
            value: "weapons",
            label: (
              <Group>
                <Icon size={20} color="white" icon="weapons" />
                <Title ml="sm" order={6}>
                  Weapons
                </Title>
              </Group>
            ),
          },
          {
            value: "all",
            label: (
              <Group>
                <Icon size={20} color="white" icon="ghost" />
                <Title ml="sm" order={6}>
                  All
                </Title>
              </Group>
            ),
          },
        ]}
        value={weaponsOnly ? "weapons" : "all"}
      />
    </div>
  );
};
