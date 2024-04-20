import { GridAction } from "@/lib/grid";
import { action } from "@elgato/streamdeck";

/**
 * dynamic tile
 */
@action({ UUID: "com.dim.streamdeck.tile" })
export class Tile extends GridAction {}
