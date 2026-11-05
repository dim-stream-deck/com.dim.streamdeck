import { Select } from "@mantine/core";
import { AutoOpenDimSchema } from "@plugin/types";
import { useStreamDeck } from "../hooks/useStreamDeck";

export const AutoOpenDim = () => {
  const { globalSettings, setGlobalSettings } = useStreamDeck();

  return (
    <Select
      mt="md"
      label="Automatically open DIM"
      description="When DIM is disconnected. Applies to all actions."
      allowDeselect={false}
      value={globalSettings.autoOpenDim ?? "stable"}
      data={[
        { value: "stable", label: "Stable DIM" },
        { value: "beta", label: "Beta DIM" },
        { value: "disabled", label: "Disabled" },
      ]}
      onChange={(value) => setGlobalSettings({ autoOpenDim: AutoOpenDimSchema.parse(value) })}
    />
  );
};
