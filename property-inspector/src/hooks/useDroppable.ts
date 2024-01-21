import { useCallback, useState } from "react";
import { notifications } from "@mantine/notifications";
import { log } from "../logger";

export const useDroppable = (
  type: string,
  onSelect: (data: Record<string, any>) => void
) => {
  const [isOver, setIsOver] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const dt = e.dataTransfer.getData("text");
      try {
        const data = JSON.parse(dt);
        if (data.type !== type) {
          return notifications.show({
            color: "red",
            title: "Error",
            message: `Wrong type of data dropped, expected ${type}, got ${data.type}`,
          });
        }
        onSelect(data);
      } catch (e) {
        console.log(e);
        if (e instanceof Error) {
          log(`drop-error-${type}`, { message: e.message, dt });
        }
        notifications.show({
          color: "red",
          title: "Error",
          message: "Failed to parse dropped data",
        });
      }
    },
    [type, onSelect]
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  }, []);

  const onDragEnd = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
  }, []);

  return {
    isOver,
    props: {
      onDrop,
      onDragOver,
      onDragEnd,
    },
  };
};
