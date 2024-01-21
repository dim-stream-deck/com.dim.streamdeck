import { Card, Checkbox, SimpleGrid, Stack } from "@mantine/core";
import auto from "../../assets/picker/auto_rifle.svg";
import scout from "../../assets/picker/scout_rifle.svg";
import pulse from "../../assets/picker/pulse_rifle.svg";
import hc from "../../assets/picker/hand_cannon.svg";
import sidearm from "../../assets/picker/sidearm.svg";
import smg from "../../assets/picker/smg.svg";
import shotgun from "../../assets/picker/shotgun.svg";
import sniper from "../../assets/picker/sniper_rifle.svg";
import fusion from "../../assets/picker/fusion_rifle.svg";
import gl from "../../assets/picker/grenade_launcher.svg";
import sword from "../../assets/picker/sword.svg";
import linear from "../../assets/picker/linear.svg";
import machineGun from "../../assets/picker/machine_gun.svg";
import bow from "../../assets/picker/bow.svg";
import trace from "../../assets/picker/trace_rifle.svg";
import rocket from "../../assets/picker/rocket_launcher.svg";
import { PickerFilterSchema } from "@plugin/types";

const options = [
  {
    value: "auto-rifle",
    icon: auto,
  },
  {
    value: "scout-rifle",
    icon: scout,
  },
  {
    value: "pulse-rifle",
    icon: pulse,
  },
  {
    value: "hand-cannon",
    icon: hc,
  },
  {
    value: "sidearm",
    icon: sidearm,
  },
  {
    value: "smg",
    icon: smg,
  },
  {
    value: "shotgun",
    icon: shotgun,
  },
  {
    value: "sniper-rifle",
    icon: sniper,
  },
  {
    value: "fusion-rifle",
    icon: fusion,
  },
  {
    label: "grenade-launcher",
    value: "GL",
    icon: gl,
  },
  {
    value: "rocket-launcher",
    icon: rocket,
  },
  {
    value: "sword",
    icon: sword,
  },
  {
    value: "linear-fusion-rifle",
    icon: linear,
  },
  {
    value: "machine-gun",
    icon: machineGun,
  },
  {
    value: "bow",
    icon: bow,
  },
  {
    value: "trace-rifle",
    icon: trace,
  },
] as const;

const defaultValues = options.map((it) => it.value);

interface SettingsProps {
  picked: string[];
  value?: string[];
  onChange?(value: string[]): void;
}

export const WeaponSettings = ({ value, onChange }: SettingsProps) => {
  return (
    <Checkbox.Group defaultValue={value ?? defaultValues} onChange={onChange}>
      <SimpleGrid cols={3}>
        {options.map((option) => (
          <Card key={option.value} radius="md" withBorder>
            <Stack align="center" gap="xs">
              <Checkbox value={option.value} mb="xs" />
              <img height={16} src={option.icon} alt={option.value} />
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Checkbox.Group>
  );
};

// Filters

const filtersOptions = PickerFilterSchema.options.filter(
  (it) => it !== "filters"
);

export const FiltersSettings = ({ picked, value, onChange }: SettingsProps) => {
  const selected = (value ?? filtersOptions).filter(
    (it) => !picked.includes(it)
  );
  return (
    <Checkbox.Group defaultValue={selected} onChange={onChange}>
      <Stack>
        {filtersOptions.map((option) => (
          <Checkbox key={option} label={option} value={option} />
        ))}
      </Stack>
    </Checkbox.Group>
  );
};

export const Settings: Record<string, React.FC<SettingsProps>> = {
  weapon: WeaponSettings,
  filters: FiltersSettings,
};
