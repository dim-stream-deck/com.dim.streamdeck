import { FC } from "react";
import { render } from "./util";
import search from "./actions/search";
import vault from "./actions/vault";
import loadout from "./actions/loadout";
import app from "./actions/app";
import postmaster from "./actions/postmaster";
import randomize from "./actions/randomize";
import metrics from "./actions/metrics";
import checkpoint from "./actions/checkpoint";
import pullItem from "./actions/pull-item";
import maxPower from "./actions/max-power";
import { StreamDeck, useStreamDeck } from "./StreamDeck";
import "./index.css";
import { ActionIcon, Alert, Group, Text } from "@mantine/core";
import {
  IconBrandDiscord,
  IconBrandPatreon,
  IconWorldWww,
} from "@tabler/icons-react";
import soloMode from "./actions/solo-mode";
import { NoSetting } from "./components/NoSettings";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

export interface AppProps {
  action: any;
}

const components = {
  search,
  vault,
  loadout,
  app,
  postmaster,
  randomize,
  metrics,
  checkpoint,
  "max-power": maxPower,
  "pull-item": pullItem,
  "solo-mode": soloMode,
};

type Action = keyof typeof components;

interface AuthorizationRequiredProps {
  missing: string[];
}

const AuthorizationRequired: FC<AuthorizationRequiredProps> = ({ missing }) => {
  return (
    <Alert
      radius="sm"
      mb="md"
      variant="outline"
      title="Authorization"
      color="red"
    >
      <Text mt={-4}>Confirm the connection on the DIM app.</Text>
    </Alert>
  );
};

const Links = () => {
  const { openURL } = useStreamDeck();
  return (
    <Group mt="sm" justify="center" wrap="nowrap">
      <ActionIcon
        title="Donate on Patreon"
        onClick={() => openURL(import.meta.env.VITE_PATREON)}
        color="gray"
        variant="default"
        radius="xl"
        size="lg"
      >
        <IconBrandPatreon size={18} color="white" />
      </ActionIcon>
      <ActionIcon
        title="Discord Server"
        onClick={() => openURL(import.meta.env.VITE_DISCORD)}
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
        onClick={() => openURL("https://dimstreamdeck.vercel.app")}
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
