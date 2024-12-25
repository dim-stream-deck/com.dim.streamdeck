import { useEffect } from "react";
import { GlobalSettings } from "@plugin/types";
import $, { JsonObject } from "@elgato/streamdeck";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { actionInfoAtom, infoAtom } from "../atoms";

export const useSize = () => {
  const [info] = useAtom(infoAtom);
  const [action] = useAtom(actionInfoAtom);
  const device = info?.devices.find((it: any) => it.id === action?.device);
  if (!device) {
    return { rows: 0, columns: 0 };
  }
  return {
    rows: device.size.rows,
    columns: device.size.columns + (device.type === 7 ? 1 : 0),
  };
};

export const useStreamDeck = <Settings extends JsonObject>(
  validator?: (data: unknown) => Settings
) => {
  const [info] = useAtom(infoAtom);
  const [action] = useAtom(actionInfoAtom);
  const client = useQueryClient();

  const { data } = useSuspenseQuery({
    queryKey: ["settings", validator],
    queryFn: () => $.settings.getSettings<Settings>(),
  });

  const settings = validator ? validator(data) : data;

  const { data: globalSettings } = useSuspenseQuery({
    queryKey: ["global-settings"],
    queryFn: () => $.settings.getGlobalSettings<GlobalSettings>(),
  });

  useEffect(() => {
    $.settings.onDidReceiveSettings<Settings>((e) => {
      console.log("onDidReceiveSettings", e.payload.settings);
      client.setQueryData(["settings"], e.payload.settings);
    });
    $.settings.onDidReceiveGlobalSettings<GlobalSettings>((e) => {
      console.log("onDidReceiveGlobalSettings", e.settings);
      client.setQueryData(["global-settings"], e.settings);
    });
  }, []);

  const overrideSettings = (payload: Partial<Settings>) => {
    $.settings.setSettings(payload);
    client.setQueryData(["settings"], payload);
  };

  const setSettings = async (update: Partial<Settings>) => {
    const value = {
      ...settings,
      ...update,
    };
    await $.settings.setSettings(value);
    client.setQueryData(["settings"], value);
  };

  const setGlobalSettings = async (
    partialSettings: Partial<GlobalSettings>
  ) => {
    const value = {
      ...globalSettings,
      ...partialSettings,
    };
    await $.settings.setGlobalSettings(value);
    client.setQueryData(["global-settings"], value);
  };

  return {
    action,
    info,
    os: info?.application.platform,
    settings,
    setSettings,
    overrideSettings,
    globalSettings,
    setGlobalSettings,
  };
};
