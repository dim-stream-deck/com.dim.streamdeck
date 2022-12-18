import { Alert, Text } from "@mantine/core";
import { IconRefreshAlert } from "@tabler/icons";

export default () => {
  return (
    <div>
      <Alert
        radius="md"
        icon={<IconRefreshAlert size={24} />}
        title="Work in progress"
        color="orange"
      >
        <Text mt={-4} color="dimmed">
          Available in the next release
        </Text>
      </Alert>
    </div>
  );
};
