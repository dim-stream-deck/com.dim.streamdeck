import { action } from "@elgato/streamdeck";
import { GridAction } from "@fcannizzaro/stream-deck-grid";

/**
 * dynamic tile
 */
@action({ UUID: "com.dim.streamdeck.tile" })
export class Tile extends GridAction {}
