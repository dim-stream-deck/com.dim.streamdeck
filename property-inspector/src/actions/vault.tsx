import { Avatar, Divider, Group, SegmentedControl, Text } from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";
import shards from "../assets/vault/shards.png";
import dust from "../assets/vault/dust.png";
import glimmer from "../assets/vault/glimmer.png";
import vault from "../assets/vault/vault.png";
import { VaultSettings, VaultType } from "@plugin/types";

const resources = [
  { value: "shards", image: shards, label: "Legendary Shards" },
  { value: "brightDust", image: dust, label: "Bright Dust" },
  { value: "glimmer", image: glimmer, label: "Glimmer" },
  { value: "vault", image: vault, label: "Vault Items" },
] satisfies Array<{
  value: VaultType;
  image: string;
  label: string;
}>;

export default () => {
  const { settings, setSettings } = useStreamDeck<VaultSettings>();

  return (
    <div>
      <Divider labelPosition="center" label="Resource Type" mb="sm" />
      <SegmentedControl
        fullWidth
        orientation="vertical"
        value={settings.item ?? "vault"}
        onChange={(value) => setSettings({ item: value as VaultType })}
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
