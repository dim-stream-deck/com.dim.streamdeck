import {
  action,
  DialDownEvent,
  DialRotateEvent,
  SingletonAction,
  TouchTapEvent,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { KeyDown, WillDisappear } from "@/settings";
import { getGrid } from "./helper/GridManager";

/**
 * dynamic tile
 */
@action({ UUID: "com.dim.streamdeck.tile" })
export class Tile extends SingletonAction {
  onWillAppear(e: WillAppearEvent<{}>) {
    const grid = getGrid(e);
    if (grid) {
      grid.link(e, e.payload.controller === "Encoder");
    }
  }

  onWillDisappear(e: WillDisappear) {
    const grid = getGrid(e);
    grid?.free(e);
  }

  onKeyDown(e: KeyDown) {
    const grid = getGrid(e);
    grid?.onClick(e);
  }

  onTouchTap(e: TouchTapEvent<{}>) {
    const grid = getGrid(e);
    grid?.onClick(e, true);
  }

  onDialDown(e: DialDownEvent<{}>) {
    const grid = getGrid(e);
    grid?.dialPress(e);
  }

  onDialRotate(e: DialRotateEvent<{}>) {
    const grid = getGrid(e);
    grid?.onDial(e, e.payload.ticks > 0);
  }
}
