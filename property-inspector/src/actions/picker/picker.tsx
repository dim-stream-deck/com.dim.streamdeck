import {
  Accordion,
  Collapse,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { useStreamDeck } from "../../StreamDeck";
import { PickerFilterSchema, PickerFilterType, Schemas } from "@plugin/types";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Filters } from "./Filters";
import { Filter } from "./Filter";
import { IconSettings } from "@tabler/icons-react";
import { Settings } from "./Settings";

export default () => {
  const { settings, size, setSettings } = useStreamDeck(Schemas.picker);
  const slots = size.columns - 2;
  const picked = settings.filters;

  function handleDragEnd(e: DragEndEvent) {
    const type = e.active.id as PickerFilterType;
    if (e.over && e.over.id === "droppable" && !picked.includes(type)) {
      if (picked.length < slots) {
        setSettings({
          filters: [...picked, type],
        });
      }
    }
    if (!e.over && picked.includes(type)) {
      setSettings({
        filters: picked.filter((it) => it !== type),
      });
    }
  }

  const pickedWithSettings = ["weapon", "filters"] as const;

  return (
    <Stack>
      <div>
        <Divider labelPosition="center" label="Filters (Last row)" />
        <Text size="sm" c="dimmed">
          Customize the filters that appear on the last row of the picker
          (between exit and pagination).
        </Text>
      </div>
      <DndContext onDragEnd={handleDragEnd}>
        <Filters>
          {picked.length === 0 ? (
            <Text ta="center" c="dimmed" p="md">
              Drag and drop filters here
            </Text>
          ) : (
            <Group gap={8}>
              {picked.map((type) => (
                <Filter picked key={type} type={type} />
              ))}
            </Group>
          )}
        </Filters>

        <Collapse in={picked.length < slots}>
          <SimpleGrid spacing={8} cols={3}>
            {PickerFilterSchema.options
              .filter((it) => !picked.includes(it))
              .map((type) => (
                <Filter
                  disabled={picked.length >= slots}
                  key={type}
                  type={type}
                />
              ))}
          </SimpleGrid>
        </Collapse>

        <div>
          <Divider labelPosition="center" label="Settings" />
          <Accordion>
            {pickedWithSettings.map((type) => {
              const SettingsComponent = Settings[type];
              return (
                <Accordion.Item key={type} value={type}>
                  <Accordion.Control icon={<IconSettings />}>
                    Settings for <strong>{type}</strong>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <SettingsComponent
                      picked={picked}
                      value={settings.options[type]}
                      onChange={(value) => {
                        setSettings({
                          options: {
                            ...settings.options,
                            [type]: value,
                          },
                        });
                      }}
                    />
                  </Accordion.Panel>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </div>
      </DndContext>
    </Stack>
  );
};
