import $, {
	DialDownEvent,
	DialRotateEvent,
	KeyDownEvent,
	KeyUpEvent,
	TouchTapEvent,
	WillAppearEvent,
	WillDisappearEvent,
} from "@elgato/streamdeck";
import { GridHelper, Encoders, Size } from "./helper";

const grids = new Map<string, GridHelper>();

export type OpenProfileGridOptions = {
  streamDeck: typeof $;
  device: string;
  size: Size;
  profile: string;
  encoders?: Encoders;
};

export const setupProfileGrid = ({
  streamDeck,
  profile,
  device,
  size,
  encoders,
}: OpenProfileGridOptions) => {
  if (!grids.has(device)) {
    const grid = new GridHelper(
      {
        columns: size.columns,
        rows: size.rows + (encoders?.enabled ? 1 : 0),
      },
      encoders ?? { enabled: false },
      () => {
        streamDeck.profiles.switchToProfile(device, profile);
      },
      () => {
        grids.delete(device);
        streamDeck.profiles.switchToProfile(device);
      }
    );
    grids.set(device, grid);
  }
  return grids.get(device)!;
};

export const getGrid = (
  e:
    | WillAppearEvent
    | WillDisappearEvent
    | KeyUpEvent
    | TouchTapEvent
    | DialDownEvent
    | DialRotateEvent
    | KeyDownEvent
) => {
  return grids.get(e.action.device.id);
};
