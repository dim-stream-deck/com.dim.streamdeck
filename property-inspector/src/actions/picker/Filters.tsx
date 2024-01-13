import { useDroppable } from "@dnd-kit/core";
import { Card } from "@mantine/core";
import { PropsWithChildren } from "react";

export const Filters = ({ children }: PropsWithChildren) => {
  const { isOver, setNodeRef } = useDroppable({
    id: "droppable",
  });
  const style = {
    color: isOver ? "green" : undefined,
  };

  return (
    <Card
      withBorder
      p="xs"
      bg="rgba(0,0,0,.2)"
      radius="md"
      w="100%"
      ref={setNodeRef}
      style={style}
    >
      {children}
    </Card>
  );
};
