import { ActionIcon, Divider, Group, Text, Tooltip } from "@mantine/core";
import { useStreamDeck } from "../StreamDeck";
import Vanguard from "../assets/metrics/vanguard.png";
import Crucible from "../assets/metrics/crucible.png";
import Osiris from "../assets/metrics/osiris.png";
import IronBanner from "../assets/metrics/iron-banner.png";
import Gunsmith from "../assets/metrics/gunsmith.png";
import Gambit from "../assets/metrics/gambit.png";
import BattlePass from "../assets/metrics/battlePass.png";
import Triumphs from "../assets/metrics/triumphs.png";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import {
  IconCheckbox,
  IconGripVertical,
  IconPin,
  IconPinFilled,
  IconSquare,
} from "@tabler/icons-react";
import { Metric, MetricSchema, MetricsSettings } from "@plugin/types";

const items = [
  { id: "battlePass", icon: BattlePass, label: "Battle Pass" },
  { id: "vanguard", icon: Vanguard, label: "Vanguard" },
  { id: "gambit", icon: Gambit, label: "Gambit" },
  { id: "crucible", icon: Crucible, label: "Crucible" },
  { id: "gunsmith", icon: Gunsmith, label: "Gunsmith" },
  { id: "ironBanner", icon: IronBanner, label: "Iron Banner" },
  { id: "trials", icon: Osiris, label: "Trials of Osiris" },
  { id: "triumphs", icon: Triumphs, label: "Triumphs (Total score)" },
  { id: "triumphsActive", icon: Triumphs, label: "Triumphs (Active score)" },
] satisfies Array<{
  id: Metric;
  icon: string;
  label: string;
}>;

interface SortableMetricProps {
  id: string;
  icon: string;
  label: string;
  pinned?: boolean;
  onPinChange?: () => void;
  disabled?: boolean;
  onStatusChange?: () => void;
}

const Metric = ({
  icon,
  label,
  pinned,
  onPinChange,
  disabled,
  onStatusChange,
  ...props
}: SortableMetricProps & Record<string, any>) => {
  return (
    <Group
      wrap="nowrap"
      justify="space-between"
      p={8}
      bg="rgba(0,0,0,0.1)"
      style={{
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Group wrap="nowrap" style={{ flex: 1 }}>
        <img src={icon} alt={label} width={30} height={30} />
        <Text size="sm">{label}</Text>
      </Group>
      <Group gap={4}>
        <ActionIcon variant="transparent" c="dimmed" {...props}>
          <IconGripVertical />
        </ActionIcon>
        <Tooltip position="bottom" color="dim" withArrow label="Pin metric">
          <ActionIcon
            onClick={onPinChange}
            variant="transparent"
            c={pinned ? "dim" : "dimmed"}
          >
            {pinned ? <IconPinFilled /> : <IconPin />}
          </ActionIcon>
        </Tooltip>
        <Tooltip position="bottom" color="dim" withArrow label="Disable metric">
          <ActionIcon
            onClick={onStatusChange}
            variant="transparent"
            c="dimmed"
            style={{ cursor: "pointer" }}
          >
            {disabled ? <IconSquare /> : <IconCheckbox />}
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
};

const SortableMetric = ({ id, ...props }: SortableMetricProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Metric id={id} {...props} {...attributes} {...listeners} />
      <Divider />
    </div>
  );
};

const itemsById = items.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<string, (typeof items)[0]>
);

// metric field

export default () => {
  const { settings, setSettings } = useStreamDeck<MetricsSettings>();
  const [activeId, setActiveId] = useState<string | number | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));
  const order = settings.order ?? items.map((it) => it.id);
  const disabledMetrics = new Set(settings.disabled ?? []);

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const activeId = active.id;
    const overId = over?.id;
    if (overId && activeId !== overId) {
      const oldIndex = order.indexOf(MetricSchema.parse(activeId));
      const newIndex = order.indexOf(MetricSchema.parse(overId));
      setSettings({
        order: arrayMove(order, oldIndex, newIndex),
      });
    }
    setActiveId(null);
  }

  const dragged = activeId ? itemsById[activeId] : null;

  return (
    <div>
      <Divider labelPosition="center" label="Metric" mb="sm" />
      <Text c="dimmed" size="sm" pb="xs">
        Toggle, sort or pin your preferred metrics.
      </Text>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={order}>
          {order.map((id) => (
            <SortableMetric
              pinned={settings.pinned && id === settings.metric}
              onPinChange={() => {
                setSettings({
                  metric: id,
                  pinned: settings.metric !== id || !settings.pinned,
                });
              }}
              disabled={disabledMetrics.has(id)}
              onStatusChange={() => {
                if (disabledMetrics.has(id)) {
                  disabledMetrics.delete(id);
                } else {
                  disabledMetrics.add(id);
                }
                setSettings({
                  disabled: Array.from(disabledMetrics),
                });
              }}
              key={id}
              {...itemsById[id]}
            />
          ))}
        </SortableContext>
        <DragOverlay>{dragged ? <Metric {...dragged} /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
};
