import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface StreamDeckProps {
  children: any;
  port: number;
  uuid: string;
  event: string;
  action: any;
}

const StreamDeckContext = createContext<StreamDeckContext>({
  settings: {},
  globalSettings: {},
  setSettings: () => {},
  setGlobalSettings: () => {},
  openURL: () => {},
  sendToPlugin: () => {},
});

type Settings = Record<string, any>;

interface StreamDeckContext {
  settings: Settings;
  setSettings: (settings: Partial<Settings>) => void;
  globalSettings: Settings;
  setGlobalSettings: (settings: Partial<Settings>) => void;
  openURL: (url?: string) => void;
  sendToPlugin: (payload: Record<string, any>) => void;
}

export const StreamDeck: FC<StreamDeckProps> = ({
  uuid,
  event,
  port,
  action,
  children,
}) => {
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
    (partialSettings: Partial<Settings>) => {
      const payload = {
        ...settings,
        ...partialSettings,
      };
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

  if (!ready) {
    return null;
  }

  return (
    <StreamDeckContext.Provider
      value={{
        settings,
        globalSettings,
        setSettings: setPartialSettings,
        setGlobalSettings: setPartialGlobalSettings,
        openURL,
        sendToPlugin,
      }}
    >
      {children}
    </StreamDeckContext.Provider>
  );
};

export const useStreamDeck = () => {
  return useContext(StreamDeckContext);
};
