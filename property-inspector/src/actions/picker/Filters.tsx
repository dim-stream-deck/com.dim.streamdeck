import { useDroppable } from "@dnd-kit/core";
import { PropsWithChildren } from "react";

export const Filters = ({ children }: PropsWithChildren) => {
  const { isOver, setNodeRef } = useDroppable({
    id: "droppable",
  });
  const style = {
    color: isOver ? "green" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
};
