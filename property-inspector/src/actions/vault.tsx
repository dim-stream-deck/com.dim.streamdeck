import { Avatar, Divider, Group, SegmentedControl, Text } from "@mantine/core";
import { useStreamDeck } from "../hooks/useStreamDeck";
import dust from "../assets/vault/dust.png";
import glimmer from "../assets/vault/glimmer.png";
import vault from "../assets/vault/vault.png";
import { Schemas, VaultType, VaultTypeSchema } from "@plugin/types";

const resources = [
  { value: "brightDust", image: dust, label: "Bright Dust" },
  { value: "glimmer", image: glimmer, label: "Glimmer" },
  { value: "vault", image: vault, label: "Vault Items" },
] satisfies Array<{
  value: VaultType;
  image: string;
  label: string;
}>;

export default () => {
  const { settings, setSettings } = useStreamDeck(Schemas.vault);

  return (
    <div>
      <Divider labelPosition="center" label="Resource Type" mb="sm" />
      <SegmentedControl
        fullWidth
        orientation="vertical"
        value={settings.type}
        onChange={(value) =>
          setSettings({ type: VaultTypeSchema.parse(value) })
        }
        data={resources.map((it) => ({
          value: it.value,
          label: (
            <Group>
              <Avatar size="sm" src={it.image} />
              <Text ml="sm">{it.label}</Text>
            </Group>
          ),
        }))}
      />
    </div>
  );
};
