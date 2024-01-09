import { Divider, Group, Image, SegmentedControl, Text } from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";
import Artifact from "../assets/max-power/artifact.png";
import Total from "../assets/max-power/total.png";
import Base from "../assets/max-power/helmet.png";
import { MaxPowerSettings, MaxPowerType } from "@plugin/types";

const resources = [
  { value: "total", image: Total, label: "Total" },
  { value: "base", image: Base, label: "Power" },
  { value: "artifact", image: Artifact, label: "Artifact" },
] satisfies Array<{
  value: MaxPowerType;
  image: string;
  label: string;
}>;

export default () => {
  const { settings, setSettings } = useStreamDeck<MaxPowerSettings>();
  const powerType = settings.powerType || "total";
  return (
    <div>
      <Divider labelPosition="center" label="Power Type" mb="sm" />
      <SegmentedControl
        fullWidth
        color="dim"
        orientation="vertical"
        value={powerType}
        onChange={(value) => setSettings({ powerType: value as MaxPowerType })}
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
