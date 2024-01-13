import { action, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
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
      const button = grid.link(e);
      grid.render(button);
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
}
