import {
	Anchor,
	Card,
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
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useMemo } from "react";

const CheckpointsSchema = z
  .object({
    activity: z.string(),
    image: z.string(),
    group: z.string(),
    steps: z.string().array(),
    difficulties: z.string().array(),
  })
  .array();

type Checkpoint = z.infer<typeof CheckpointsSchema>[number];

const checkpointDefinitions = async () => {
  const res = await fetch(import.meta.env.VITE_CHECKPOINTS_GIST);
  return CheckpointsSchema.parse(await res.json()).reduce((acc, checkpoint) => {
    acc.set(checkpoint.activity, checkpoint);
    return acc;
  }, new Map<string, Checkpoint>());
};

export default () => {
  const { globalSettings, setGlobalSettings, settings, setSettings } =
    useStreamDeck();

  const { data = new Map<string, Checkpoint>() } = useQuery({
    queryKey: ["checkpoints"],
    queryFn: checkpointDefinitions,
    staleTime: Infinity,
  });

  const checkpoint = data.get(settings.activity);

  const activities = useMemo(() => {
    const groups = new Map<string, string[]>();
    data.forEach((checkpoint) => {
      const group = groups.get(checkpoint.group) ?? [];
      group.push(checkpoint.activity);
      groups.set(checkpoint.group, group);
    });
    return Array.from(groups.entries()).map(([group, items]) => ({
      group,
      items,
    }));
  }, [data]);

  const difficulties = checkpoint?.difficulties ?? [];

  const steps = checkpoint?.steps ?? [];

  return (
    <Stack gap="sm" mb="sm">
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
              onChange={(activity) => {
                if (activity) {
                  setSettings({
                    activity,
                    image: data.get(activity)?.image,
                    step: null,
                    difficulty: null,
                  });
                }
              }}
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
                <SegmentedControl
                  color="dim"
                  size="sm"
                  w="100%"
                  data={difficulties}
                  value={settings.difficulty}
                  onChange={(difficulty) => setSettings({ difficulty })}
                />
              </Grid.Col>
            </>
          )}
        </Grid>
      </Card>
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
      <Divider labelPosition="center" label="Credits" />
      <Text c="dimmed">
        Checkpoints are provided by{" "}
        <Anchor
          td="underline"
          href={`https://${import.meta.env.VITE_CHECKPOINTS}`}
          target="_blank"
        >
          {import.meta.env.VITE_CHECKPOINTS}
        </Anchor>
        , <strong>donate</strong> to them if you can!
      </Text>
    </Stack>
  );
};