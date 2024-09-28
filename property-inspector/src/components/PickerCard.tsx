import { PropsWithChildren } from "react";
import { Paper } from "@mantine/core";

export function PickerCard({ children }: PropsWithChildren) {
  return (
    <Paper
      w="100%"
      radius="md"
      withBorder
      p="sm"
      style={{
        offset: "1px solid gray",
        outlineOffset: 3,
      }}
    >
      {children}
    </Paper>
  );
}
