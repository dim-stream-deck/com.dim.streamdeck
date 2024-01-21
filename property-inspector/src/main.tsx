import { FC, Suspense, lazy } from "react";
import { render } from "./util";
import { StreamDeck, useStreamDeck } from "./StreamDeck";
import "./index.css";
import { ActionIcon, Center, Group, Loader } from "@mantine/core";
import {
  IconBrandDiscord,
  IconBrandPatreon,
  IconWorldWww,
} from "@tabler/icons-react";
import { NoSetting } from "./components/NoSettings";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const client = new QueryClient();

const Support = lazy(() => import("./components/Support"));
const app = lazy(() => import("./actions/app"));
const search = lazy(() => import("./actions/search"));
const vault = lazy(() => import("./actions/vault"));
const loadout = lazy(() => import("./actions/loadout"));
const postmaster = lazy(() => import("./actions/postmaster"));
const randomize = lazy(() => import("./actions/randomize"));
const metrics = lazy(() => import("./actions/metrics"));
const checkpoint = lazy(() => import("./actions/checkpoint"));
const pullItem = lazy(() => import("./actions/pull-item"));
const maxPower = lazy(() => import("./actions/max-power"));
const picker = lazy(() => import("./actions/picker/picker"));
const soloMode = lazy(() => import("./actions/solo-mode"));

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
      <Suspense>
        <Support />
      </Suspense>
      <Suspense
        fallback={
          <Center py="md">
            <Loader size="md" c="dim" />
          </Center>
        }
      >
        {!Component ? <NoSetting /> : <Component />}
      </Suspense>
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
        info,
      }}
    >
      <QueryClientProvider client={client}>
        <App action={action} />
      </QueryClientProvider>
    </StreamDeck>
  );
};
