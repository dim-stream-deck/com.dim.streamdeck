import {
  Card,
  Collapse,
  Divider,
  Grid,
  Group,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";
import { Icon360, IconActivity, IconFlag3Filled } from "@tabler/icons-react";
import { useEffect } from "react";

interface Checkpoint {
  activity: string;
  step: string;
  difficulty: string;
}

export default () => {
  const {
    communication,
    globalSettings,
    setGlobalSettings,
    settings,
    setSettings,
  } = useStreamDeck();

  const checkpoints = (communication?.items ?? {}) as Record<
    string,
    Checkpoint[]
  >;

  const activities = Object.keys(checkpoints);

  const difficulties = (checkpoints[settings.activity] ?? []).some(
    (checkpoint) => checkpoint.difficulty
  )
    ? ["normal", "master"]
    : [];

  const steps = Array.from(
    new Set(
      (checkpoints[settings.activity] ?? [])
        .map((checkpoint) => checkpoint.step)
        .filter(Boolean)
    )
  );

  const type = settings.cyclic ? "cyclic" : "activity";

  useEffect(() => {
    if (difficulties.length == 0) {
      setSettings({ difficulty: null });
    }
  }, [difficulties]);

  const types = [
    {
      label: "Activity",
      icon: <IconFlag3Filled />,
      value: "activity",
    },
    {
      label: "Cyclic",
      icon: <Icon360 />,
      value: "cyclic",
    },
  ].map((it) => ({
    label: (
      <Group gap="xs" justify="center" align="center">
        {it.icon}
        <Text size="xs">{it.label}</Text>
      </Group>
    ),
    value: it.value,
  }));

  return (
    <Stack gap="sm">
      <SegmentedControl
        w="100%"
        color="dim"
        value={type}
        onChange={(type) => {
          setSettings({
            cyclic: type === "cyclic",
          });
        }}
        data={types}
      />
      <Text
        size="xs"
        c="dimmed"
        dangerouslySetInnerHTML={{
          __html:
            type === "cyclic"
              ? "You can <strong><u>tap</u></strong> the button to cycle through all activities and <strong><u>hold</u></strong> it to copy the join command to your clipboard"
              : "You can <strong><u>tap</u></strong> the button to copy the join command to your clipboard",
        }}
      />
      <Collapse in={type === "activity"}>
        <Divider labelPosition="center" label="Activity" mb="sm" />
        <Card withBorder radius="md">
          <Grid align="center" gutter="sm">
            <Grid.Col span={4}>
              <Text size="sm" fw="bold">
                Activity
              </Text>
            </Grid.Col>
            <Grid.Col span={8}>
              <Select
                data={activities}
                value={settings.activity}
                onChange={(activity) =>
                  setSettings({
                    activity,
                    step: null,
                    difficulty: null,
                  })
                }
              />
            </Grid.Col>
            {steps.length > 0 && (
              <>
                <Grid.Col span={4}>
                  <Text size="sm" fw="bold">
                    Step
                  </Text>
                </Grid.Col>
                <Grid.Col span={8}>
                  <Select
                    style={{ flex: 1 }}
                    data={steps}
                    value={settings.step}
                    onChange={(step) => setSettings({ step })}
                  />
                </Grid.Col>
              </>
            )}
            {difficulties.length > 0 && (
              <>
                <Grid.Col span={4}>
                  <Text size="sm" fw="bold">
                    Difficulty
                  </Text>
                </Grid.Col>
                <Grid.Col span={8}>
                  <Select
                    style={{ flex: 1 }}
                    data={difficulties}
                    value={settings.difficulty ?? "normal"}
                    onChange={(difficulty) => setSettings({ difficulty })}
                  />
                </Grid.Col>
              </>
            )}
          </Grid>
        </Card>
      </Collapse>
      <Divider labelPosition="center" label="Chat command" />
      <Group gap="xs" wrap="nowrap">
        <TextInput
          style={{ flex: 1 }}
          placeholder="/join"
          variant="filled"
          defaultValue={globalSettings.checkpointJoinPrefix}
          onChange={(e) =>
            setGlobalSettings({ checkpointJoinPrefix: e.target.value })
          }
        />
        <Text c="dimmed" size="sm">
          Checkpoint#1111
        </Text>
      </Group>
    </Stack>
  );
};
