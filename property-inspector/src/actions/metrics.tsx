import { Avatar, Divider, Group, SegmentedControl, Text } from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";
import Vanguard from "../assets/metrics/vanguard.png";
import Crucible from "../assets/metrics/crucible.png";
import Osiris from "../assets/metrics/osiris.png";
import IronBanner from "../assets/metrics/iron-banner.png";
import Gunsmith from "../assets/metrics/gunsmith.png";
import Gambit from "../assets/metrics/gambit.png";
import BattlePass from "../assets/metrics/battlePass.png";
import Triumphs from "../assets/metrics/triumphs.png";

const items = [
  { value: "vanguard", image: Vanguard, label: "Vanguard" },
  { value: "gambit", image: Gambit, label: "Gambit" },
  { value: "crucible", image: Crucible, label: "Crucible" },
  { value: "gunsmith", image: Gunsmith, label: "Gunsmith" },
  { value: "ironBanner", image: IronBanner, label: "Iron Banner" },
  { value: "trials", image: Osiris, label: "Trials of Osiris" },
  { value: "battlePass", image: BattlePass, label: "Battle Pass" },
  { value: "triumphs", image: Triumphs, label: "Triumphs (Total score)" },
  {
    value: "triumphsActive",
    image: Triumphs,
    label: "Triumphs (Active score)",
  },
];

export default () => {
  const { settings, setSettings } = useStreamDeck();
  return (
    <div>
      <Divider labelPosition="center" label="Metric" mb="sm" />
      <SegmentedControl
        fullWidth
        color="dim"
        orientation="vertical"
        value={settings.metric}
        onChange={(metric) => setSettings({ metric })}
        data={items.map((it) => ({
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
