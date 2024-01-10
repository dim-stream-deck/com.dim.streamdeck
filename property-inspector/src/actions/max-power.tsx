import { Divider, Group, Image, SegmentedControl, Text } from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";
import Artifact from "../assets/max-power/artifact.png";
import Total from "../assets/max-power/total.png";
import Base from "../assets/max-power/helmet.png";
import { MaxPowerType, MaxPowerTypeSchema, Schemas } from "@plugin/types";

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
  const { settings, overrideSettings } = useStreamDeck(Schemas.maxPower);
  return (
    <div>
      <Divider labelPosition="center" label="Power Type" mb="sm" />
      <SegmentedControl
        fullWidth
        color="dim"
        orientation="vertical"
        value={settings.type}
        onChange={(value) => {
          const type = MaxPowerTypeSchema.parse(value);
          overrideSettings({ type });
        }}
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
