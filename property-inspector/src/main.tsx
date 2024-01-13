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
import picker from "./actions/picker/picker";
import { StreamDeck, useStreamDeck } from "./StreamDeck";
import "./index.css";
import { ActionIcon, Group } from "@mantine/core";
import {
  IconBrandDiscord,
  IconBrandPatreon,
  IconWorldWww,
} from "@tabler/icons-react";
import soloMode from "./actions/solo-mode";
import { NoSetting } from "./components/NoSettings";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const client = new QueryClient();

export interface AppProps {
  action: any;
}

const components = {
  search,
  vault,
  loadout,
  app,
  picker,
  postmaster,
  randomize,
  metrics,
  checkpoint,
  "max-power": maxPower,
  "pull-item": pullItem,
  "solo-mode": soloMode,
};

type Action = keyof typeof components;

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

  return (
    <>
      {!Component ? <NoSetting /> : <Component />}
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
  info = JSON.parse(info);
  render(
    <StreamDeck
      {...{
        port,
        uuid,
        event,
        action,
        info
      }}
    >
      <QueryClientProvider client={client}>
        <App action={action} />
      </QueryClientProvider>
    </StreamDeck>
  );
};
