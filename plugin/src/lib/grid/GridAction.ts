import {
  DialDownEvent,
  DialRotateEvent,
  KeyUpEvent,
  SingletonAction,
  TouchTapEvent,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { getGrid } from "./manager";

export class GridAction extends SingletonAction {
  onWillAppear(e: WillAppearEvent) {
    const grid = getGrid(e);
    grid?.link(e, e.payload.controller === "Encoder");
  }

  onWillDisappear(e: WillDisappearEvent) {
    const grid = getGrid(e);
    grid?.unlink();
  }

  onKeyUp(e: KeyUpEvent) {
    const grid = getGrid(e);
    grid?.onPress(e);
  }

  onTouchTap(e: TouchTapEvent) {
    const grid = getGrid(e);
    grid?.onPress(e, true);
  }

  onDialDown(e: DialDownEvent) {
    const grid = getGrid(e);
    grid?.onPress(e, true);
  }

  onDialRotate(e: DialRotateEvent) {
    const grid = getGrid(e);
    grid?.onDial(e, e.payload.ticks > 0);
  }
}
