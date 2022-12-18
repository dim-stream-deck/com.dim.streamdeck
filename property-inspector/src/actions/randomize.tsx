import { Divider, Group, SegmentedControl, Title } from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";
import { Icon } from "../icon/Icon";

export default () => {
  const { settings, setSettings } = useStreamDeck();
  const weaponsOnly = settings.weaponsOnly === true;

  return (
    <div>
      <Divider labelPosition="center" label="Type" mb="sm" />
      <SegmentedControl
        fullWidth
        onChange={(value) => setSettings({ weaponsOnly: value === "weapons" })}
        color="primary"
        data={[
          {
            value: "weapons",
            label: (
              <Group>
                <Icon size={24} color="white" icon="weapons" />
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
                <Icon size={24} color="white" icon="ghost" />
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
