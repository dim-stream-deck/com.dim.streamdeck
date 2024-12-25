import { FC, Suspense, lazy } from "react";
import { render } from "./util";
import "./index.css";
import { ActionIcon, Center, Group, Loader } from "@mantine/core";
import {
  IconBrandDiscord,
  IconBrandPatreon,
  IconWorldWww,
} from "@tabler/icons-react";
import { NoSetting } from "./components/NoSettings";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import streamDeck from "@elgato/streamdeck";
import { GlobalSettings } from "@plugin/types";
import { createStore, Provider } from "jotai";
import { actionInfoAtom, globalsSettingsAtom, infoAtom } from "./atoms";

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

const store = createStore();

const Links = () => {
  return (
    <Group mt="sm" justify="center" wrap="nowrap">
      <ActionIcon
        title="Donate on Patreon"
        onClick={() => streamDeck.system.openUrl(import.meta.env.VITE_PATREON)}
        color="gray"
        variant="default"
        radius="xl"
        size="lg"
      >
        <IconBrandPatreon size={18} color="white" />
      </ActionIcon>
      <ActionIcon
        title="Discord Server"
        onClick={() => streamDeck.system.openUrl(import.meta.env.VITE_DISCORD)}
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
        onClick={() =>
          streamDeck.system.openUrl("https://dimstreamdeck.vercel.app")
        }
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

streamDeck.onConnected(async (info, actionInfo) => {
  // init store
  store.set(
    globalsSettingsAtom,
    await streamDeck.settings.getGlobalSettings<GlobalSettings>()
  );

  store.set(actionInfoAtom, actionInfo);
  store.set(infoAtom, info);
  render(
    <Suspense>
      <Provider store={store}>
        <QueryClientProvider client={client}>
          <App action={actionInfo} />
        </QueryClientProvider>
      </Provider>
    </Suspense>
  );
});
