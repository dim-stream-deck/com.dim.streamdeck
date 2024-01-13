import { Button } from "@mantine/core";
import { PickerFilterType } from "@plugin/types";
import { useDraggable } from "@dnd-kit/core";

interface FilterProps {
  type: PickerFilterType;
  picked?: boolean;
}

export const hasSettings = new Set(["weapon", "filters", "perk"]);

export const Filter = ({ type, picked }: FilterProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: type,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <Button
      variant={picked ? "filled" : "light"}
      miw={90}
      h={72}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        flex: 1,
        ...style,
      }}
    >
      {type}
    </Button>
  );
};
