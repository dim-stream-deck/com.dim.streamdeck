import $, {
  DidReceiveSettingsEvent,
  KeyDownEvent,
  KeyUpEvent,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { mergeDeepRight } from "ramda";
import { GlobalSettings, GlobalSettingsSchema } from "@plugin/types";

// Global Settings

export const setGlobalSettings = async (update: Partial<GlobalSettings>) => {
  const baseSettings = await $.settings.getGlobalSettings();
  // get the current global settings
  const settings = GlobalSettingsSchema.parse(baseSettings);
  // merge old settings with the new ones
  return $.settings.setGlobalSettings(mergeDeepRight(settings, update));
};

// Settings
export type KeyUp = KeyUpEvent<{}>;
export type KeyDown = KeyDownEvent<{}>;
export type DidReceiveSettings = DidReceiveSettingsEvent<{}>;
export type WillAppear = WillAppearEvent<{}>;
export type WillDisappear = WillDisappearEvent<{}>;
