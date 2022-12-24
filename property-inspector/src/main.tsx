import { FC } from "react";
import { render } from "./util";
import search from "./actions/search";
import vault from "./actions/vault";
import loadout from "./actions/loadout";
import app from "./actions/app";
import postmaster from "./actions/postmaster";
import randomize from "./actions/randomize";
import metrics from "./actions/metrics";
import pullItem from "./actions/pull-item";
import rotation from "./actions/rotation";
import power from "./actions/max-power";
import { StreamDeck, useStreamDeck } from "./StreamDeck";
import "./index.css";
import { ActionIcon, Alert, Button, Center, Group, Text } from "@mantine/core";
import {
  IconBrandDiscord,
  IconBrandPatreon,
  IconCheck,
  IconWorldWww,
} from "@tabler/icons";

export interface AppProps {
  action: any;
}

const randomID = Math.random().toString(36).slice(2, 6).toUpperCase();

const components = {
  search,
  vault,
  loadout,
  app,
  postmaster,
  randomize,
  metrics,
  rotation,
  power,
  "pull-item": pullItem,
};

type Action = keyof typeof components;

interface AuthorizationRequiredProps {
  missing: string[];
}

const AuthorizationRequired: FC<AuthorizationRequiredProps> = ({ missing }) => {
  const { sendToPlugin } = useStreamDeck();
  return (
    <Alert
      radius="sm"
      mb="md"
      variant="outline"
      title="Authorization"
      color="red"
    >
      <Text mt={-4}>Confirm the connection on the DIM app.</Text>

      <Center>
        <Text
          mt="xs"
          px="sm"
          py="xs"
          sx={{
            background: "rgba(0,0,0,.4)",
            fontSize: 32,
          }}
        >
          {randomID}
        </Text>
      </Center>

      <Button
        fullWidth
        mt="md"
        variant="filled"
        color="red"
        onClick={() =>
          missing.forEach((id) => {
            sendToPlugin({
              authorization: id,
              code: randomID,
            });
          })
        }
      >
        AUTHORIZE
      </Button>
    </Alert>
  );
};

const NoSetting = () => {
  return (
    <Alert
      radius="md"
      icon={<IconCheck size={24} />}
      title="All done"
      color="green"
    >
      <Text mt={-4} color="dimmed">
        No setting required for this action
      </Text>
    </Alert>
  );
};

const Links = () => {
  const { openURL } = useStreamDeck();
  return (
    <Group mt="sm" position="center" noWrap>
      <ActionIcon
        title="Donate on Patreon"
        onClick={() => openURL(process.env.REACT_APP_PATREON)}
        color="gray"
        variant="default"
        radius="xl"
        size="lg"
      >
        <IconBrandPatreon size={18} color="white" />
      </ActionIcon>
      <ActionIcon
        title="Discord Server"
        onClick={() => openURL(process.env.REACT_APP_DISCORD)}
        ml="sm"
        color="gray"
        variant="default"
        radius="xl"
        size="lg"
      >
        <IconBrandDiscord size={18} color="white" />
      </ActionIcon>
      <ActionIcon
        title="Website"
        onClick={() => openURL("https://dim-stream-deck.vercel.app")}
        ml="sm"
        color="gray"
        variant="default"
        radius="xl"
        size="lg"
      >
        <IconWorldWww size={18} color="white" />
      </ActionIcon>
    </Group>
  );
};

const App: FC<AppProps> = ({ action }) => {
  const id: Action = action.action.slice("com.dim.streamdeck.".length);

  const Component: any = components[id];
  const { globalSettings } = useStreamDeck();
  const authorized = (globalSettings?.missing ?? []).length === 0;

  return (
    <>
      {!Component ? (
        <NoSetting />
      ) : authorized ? (
        <Component />
      ) : (
        <AuthorizationRequired missing={globalSettings.missing ?? []} />
      )}
      <Links />
    </>
  );
};

window.connectElgatoStreamDeckSocket = (
  port: number,
  uuid: string,
  event: string,
  info: any,
  action: any
) => {
  action = JSON.parse(action);
  render(
    <StreamDeck
      {...{
        port,
        uuid,
        event,
        action,
        info: JSON.parse(info),
      }}
    >
      <App action={action} />
    </StreamDeck>
  );
};
