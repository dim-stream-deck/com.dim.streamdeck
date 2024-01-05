import { useCallback, useState } from "react";
import { notifications } from "@mantine/notifications";

export const useDroppable = (
  type: string,
  onSelect: (data: Record<string, any>) => void
) => {
  const [isOver, setIsOver] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      try {
        const data = JSON.parse(e.dataTransfer.getData("text"));
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
