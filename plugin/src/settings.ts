import $, { DialAction, KeyAction } from "@elgato/streamdeck";
import { mergeDeep } from "remeda";
import { GlobalSettings, GlobalSettingsSchema } from "@plugin/types";

// Global Settings

export const setGlobalSettings = async (update: Partial<GlobalSettings>) => {
  const baseSettings = await $.settings.getGlobalSettings();
  // get the current global settings
  const settings = GlobalSettingsSchema.parse(baseSettings);
  // merge old settings with the new ones
  return $.settings.setGlobalSettings(mergeDeep(settings, update));
};

export type Action = KeyAction | DialAction;
