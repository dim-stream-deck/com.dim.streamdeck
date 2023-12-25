import { Alert, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

export const NoSetting = () => {
  return (
    <Alert
      radius="md"
      icon={<IconCheck size={24} />}
      title="All done"
      variant="filled"
      color="#222222"
    >
      <Text mt={-4} c="dimmed">
        No setting required for this action
      </Text>
    </Alert>
  );
};
