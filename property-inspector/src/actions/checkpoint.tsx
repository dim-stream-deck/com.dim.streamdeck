import {
  Anchor,
  Card,
  CardSection,
  Divider,
  Grid,
  Group,
  Image,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { useStreamDeck } from "../hooks/useStreamDeck";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Schemas, CheckpointGroup } from "@plugin/types";
import $ from "@elgato/streamdeck";

const loadDefinitions = async () => {
  const res = await $.plugin.fetch("checkpoints-activities");
  if (!res.ok) return [];
  return res.body as unknown as CheckpointGroup[];
};

const difficulties = [
  { label: "Standard", value: "standard" },
  { label: "Master", value: "master" },
];

export default () => {
  const {
    globalSettings,
    overrideSettings,
    setGlobalSettings,
    settings,
    setSettings,
  } = useStreamDeck(Schemas.checkpoint);

  const { data = [] } = useQuery({
    queryKey: ["checkpoints"],
    queryFn: loadDefinitions,
    staleTime: Infinity,
  });

  const activityById = Object.fromEntries(
    data.flatMap((group) =>
      group.items.flatMap((item) =>
        Object.entries(item.ids).map(([key, value]) => [
          value,
          {
            ...item,
            difficulty: key,
          },
        ])
      )
    )
  );

  const [difficulty, setDifficulty] = useState("standard");

  const items = useMemo(() => {
    return data.map(({ group, items }) => ({
      group,
      items: items
        .filter((item) =>
          difficulty === "master" ? item.ids.master : item.ids.standard
        )
        .map((item) => ({
          label: item.name,
          value: item.ids[difficulty as "standard" | "master"],
        })),
    }));
  }, [data, difficulty]);

  const checkpoint = settings.id ? activityById[settings.id] : null;

  console.log(items, checkpoint);

  const encounters = checkpoint
    ? checkpoint.encounters.map((label, value) => ({
        label,
        value: value.toString(),
      }))
    : [];

  useEffect(() => {
    if (checkpoint) {
      setDifficulty(checkpoint.difficulty);
    }
  }, [checkpoint]);

  const image = checkpoint
    ? `${checkpoint.images}/${settings.encounter}.webp`
    : undefined;

  return (
    <Stack gap="sm" mb="sm">
      <Divider labelPosition="center" label="Activity" mb="sm" />
      <Card withBorder radius="md">
        {image && (
          <CardSection pb="md">
            <Image
              draggable={false}
              alt="Step image"
              src={image}
              width="100%"
              height="auto"
            />
          </CardSection>
        )}
        <Grid align="center" gutter="sm">
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
              value={difficulty}
              onChange={(difficulty) => {
                setDifficulty(difficulty);
                overrideSettings({});
              }}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Text size="sm" fw="bold">
              Activity
            </Text>
          </Grid.Col>
          <Grid.Col span={8}>
            <Select
              data={items}
              clearable
              value={settings.id ?? null}
              onChange={(activity) => {
                if (activity) {
                  setSettings({ id: activity, encounter: 0 });
                } else {
                  overrideSettings({});
                }
              }}
            />
          </Grid.Col>
          {encounters.length > 0 && (
            <>
              <Grid.Col span={4}>
                <Text size="sm" fw="bold">
                  Encounter
                </Text>
              </Grid.Col>
              <Grid.Col span={8}>
                <Select
                  style={{ flex: 1 }}
                  data={encounters}
                  value={settings.encounter?.toString() ?? null}
                  onChange={(encounter) => {
                    if (encounter !== null) {
                      setSettings({ encounter: +encounter });
                    }
                  }}
                />
              </Grid.Col>
            </>
          )}
          {difficulties.length > 0 && <></>}
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
      <Text c="dimmed" size="sm">
        *This field should be filled only if you don't use{" "}
        <strong>English</strong> as your game language.
      </Text>
      <Divider labelPosition="center" label="Type in chat" />
      <Switch
        label="Paste the command"
        checked={globalSettings.checkpointPaste}
        onChange={(e) =>
          setGlobalSettings({ checkpointPaste: e.target.checked })
        }
      />
      <Text size="sm" c="dimmed">
        If enabled, you can press this button to write the join command. Just
        remember to open the game chat 🤣.
      </Text>
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
