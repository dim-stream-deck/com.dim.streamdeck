import { Divider, Group, Image, SegmentedControl, Text } from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";
import Artifact from "../assets/max-power/artifact.png";
import Total from "../assets/max-power/total.png";
import Base from "../assets/max-power/helmet.png";

const resources = [
  { value: "all", image: Total, label: "All" },
  { value: "total", image: Total, label: "Total" },
  { value: "base", image: Base, label: "Power" },
  { value: "artifact", image: Artifact, label: "Artifact" },
];

export default () => {
  const { settings, setSettings } = useStreamDeck();
  const powerType = settings.powerType || "all";
  return (
    <div>
      <Divider labelPosition="center" label="Power Type" mb="sm" />
      <SegmentedControl
        fullWidth
        color="primary"
        orientation="vertical"
        value={powerType}
        onChange={(powerType) => setSettings({ powerType })}
        data={resources.map((it) => ({
          value: it.value,
          label: (
            <Group>
              <Image height={24} width={24} fit="contain" src={it.image} />
              <Text ml="sm">{it.label}</Text>
            </Group>
          ),
        }))}
      />
    </div>
  );
};
