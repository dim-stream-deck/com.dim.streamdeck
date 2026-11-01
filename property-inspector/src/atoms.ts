import { ActionInfo, RegistrationInfo } from "./streamdeck";
import { atom } from "jotai";

export const actionInfoAtom = atom<ActionInfo>();

export const infoAtom = atom<RegistrationInfo>();
