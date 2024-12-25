import { ActionInfo, RegistrationInfo } from "@elgato/streamdeck";
import { GlobalSettings } from "@plugin/types";
import { atom } from "jotai";

export const globalsSettingsAtom = atom<Partial<GlobalSettings>>({});

export const actionInfoAtom = atom<ActionInfo>();

export const infoAtom = atom<RegistrationInfo>();
