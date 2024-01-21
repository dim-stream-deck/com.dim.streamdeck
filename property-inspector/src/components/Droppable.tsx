import { PropsWithChildren } from "react";
import { useDroppable } from "../hooks/useDroppable";
import { Paper } from "@mantine/core";

interface DroppableProps {
  type: string;
  onSelect: (data: Record<string, any>) => void;
  onError: (error: Error, dt: string) => void;
}

export function Droppable({
  type,
  children,
  onSelect,
  onError,
}: PropsWithChildren<DroppableProps>) {
  const { isOver, props } = useDroppable(type, onSelect, onError);
  return (
    <Paper
      {...props}
      w="100%"
      radius="md"
      withBorder
      p="sm"
      style={{
        offset: "1px solid gray",
        outlineOffset: 3,
        background: isOver ? "#202020" : undefined,
      }}
    >
      {children}
    </Paper>
  );
}
