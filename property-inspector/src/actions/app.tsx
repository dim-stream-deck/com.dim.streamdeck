import { Divider, SegmentedControl } from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";

export default () => {
  const { settings, setSettings } = useStreamDeck();
  const isBeta = settings.beta === true;

  return (
    <div>
      <Divider labelPosition="center" label="Flavor" mb="sm" />
      <SegmentedControl
        fullWidth
        onChange={(value) => setSettings({ beta: value === "beta" })}
        color={isBeta ? "cyan" : "dim"}
        data={[
          {
            value: "dim",
            label: "Stable",
          },
          { value: "beta", label: "Beta" },
        ]}
        value={isBeta ? "beta" : "dim"}
      />
    </div>
  );
};
