import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GlobalSettings } from "@plugin/types";

interface StreamDeckProps {
  children: any;
  port: number;
  uuid: string;
  event: string;
  action: any;
  info: any;
}

type Settings = Record<string, any>;

type Device = {
  id: string;
  size: {
    columns: number;
    rows: number;
  };
};

interface StreamDeckContext<TSettings> {
  communication?: any;
  size: Device["size"];
  os?: "windows" | "mac";
  log: (message: string) => void;
  settings: TSettings;
  setSettings: (settings: Partial<TSettings>) => void;
  overrideSettings: (settings: Partial<TSettings>) => void;
  globalSettings: Partial<GlobalSettings>;
  setGlobalSettings: (settings: Partial<GlobalSettings>) => void;
  openURL: (url?: string) => void;
  sendToPlugin: (payload: Record<string, any>) => void;
}

const StreamDeckContext = createContext<StreamDeckContext<Settings>>({
  size: { columns: 0, rows: 0 },
  settings: {},
  globalSettings: {},
  log: () => {},
  setSettings: () => {},
  overrideSettings: () => {},
  setGlobalSettings: () => {},
  openURL: () => {},
  sendToPlugin: () => {},
});

export const StreamDeck: FC<StreamDeckProps> = ({
  uuid,
  event,
  port,
  action,
  info,
  children,
}) => {
  const [communication, setCommunication] = useState<any>();
  const [settings, setSettings] = useState<Settings>({});
  const [globalSettings, setGlobalSettings] = useState<Settings>({});
  const [ready, setReady] = useState(false);
  const websocket = useRef<WebSocket>();

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:" + port);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          event,
          uuid,
        })
      );
      ws.send(
        JSON.stringify({
          event: "getSettings",
          context: uuid,
        })
      );
      ws.send(
        JSON.stringify({
          event: "getGlobalSettings",
          context: uuid,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.event) {
        case "didReceiveGlobalSettings":
          setGlobalSettings(data.payload.settings);
          break;
        case "sendToPropertyInspector":
          setCommunication(data.payload);
          break;
        case "didReceiveSettings":
          setSettings(data.payload.settings);
          setReady(true);
          break;
      }
    };

    websocket.current = ws;
  }, []);

  const send = useCallback(
    (event: string, data: Record<string, any>) => {
      websocket.current?.send(
        JSON.stringify({
          event,
          context: uuid,
          ...data,
        })
      );
    },
    [websocket]
  );

  const setPartialSettings = useCallback(
    (update: Partial<Settings>) => {
      const payload = {
        ...settings,
        ...update,
      };
      send("setSettings", { payload });
      setSettings(payload);
    },
    [settings, send]
  );

  const overrideSettings = useCallback(
    (payload: Partial<Settings>) => {
      send("setSettings", { payload });
      setSettings(payload);
    },
    [settings, send]
  );

  const setPartialGlobalSettings = useCallback(
    (partialSettings: Partial<Settings>) => {
      const payload = {
        ...globalSettings,
        ...partialSettings,
      };
      send("setGlobalSettings", { payload });
      setGlobalSettings(payload);
    },
    [globalSettings, send]
  );

  const openURL = useCallback(
    (url?: string) => {
      send("openUrl", { payload: { url } });
    },
    [send]
  );

  const sendToPlugin = useCallback(
    (payload: Record<string, any>) => {
      send("sendToPlugin", { action: action.action, payload });
    },
    [send]
  );

  const size = useMemo(() => {
    const device = info.devices.find((it: any) => it.id === action.device);
    return {
      rows: device.size.rows,
      columns: device.size.columns + (device.type === 7 ? 1 : 0),
    };
  }, [info]);

  const log = useCallback(
    (message: string) => {
      send("logMessage", { payload: { message } });
    },
    [send]
  );

  if (!ready) {
    return null;
  }

  return (
    <StreamDeckContext.Provider
      value={{
        size,
        os: info.application.platform,
        openURL,
        sendToPlugin,
        communication,
        log,
        settings,
        globalSettings,
        overrideSettings,
        setSettings: setPartialSettings,
        setGlobalSettings: setPartialGlobalSettings,
      }}
    >
      {children}
    </StreamDeckContext.Provider>
  );
};

export const useStreamDeck = <TSettings = any,>(
  validator?: (data: unknown) => TSettings
) => {
  const props = useContext(StreamDeckContext) as StreamDeckContext<TSettings>;
  return {
    ...props,
    settings: validator ? validator(props.settings) : props.settings,
  };
};
