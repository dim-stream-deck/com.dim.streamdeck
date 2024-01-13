import $, {
  action,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { GridHelper } from "./GridHelper";
import { KeyDown, WillDisappear } from "@/settings";

export const grid = new GridHelper({
  close: "./imgs/canvas/picker/close.png",
  next: "./imgs/canvas/picker/next.png",
  prev: "./imgs/canvas/picker/prev.png",
});

/**
 * Show a item picker
 */
@action({ UUID: "com.dim.streamdeck.tile" })
export class Tile extends SingletonAction {
  onWillAppear(e: WillAppearEvent<{}>) {
    const button = grid.link(e);
    e.action.setTitle(button.title);
    e.action.setImage(button.image);
  }

  onWillDisappear(e: WillDisappear) {
    grid.free(e);
  }

  onKeyDown(e: KeyDown) {
    const button = grid.button(e);
    if (button.type === "close") {
      grid.close(e);
    } else if (button.type === "next") {
      grid.onNextPage();
    } else if (button.type === "prev") {
      grid.onPrevPage();
    } else {
      grid.onClick(e);
    }
  }
}
