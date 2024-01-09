import $ from "@elgato/streamdeck";
import { mergeDeepRight } from "ramda";
import { GlobalSettings, GlobalSettingsSchema } from "shared";

// Global Settings

export const setGlobalSettings = async (update: Partial<GlobalSettings>) => {
  const baseSettings = await $.settings.getGlobalSettings();
  // get the current global settings
  const settings = GlobalSettingsSchema.parse(baseSettings);
  // merge old settings with the new ones
  return $.settings.setGlobalSettings(mergeDeepRight(settings, update));
};
