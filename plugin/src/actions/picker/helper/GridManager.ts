import { PickerFilterType } from "@plugin/types";
import { GridHelper } from "./GridHelper";
import { ActionEvent } from "@elgato/streamdeck";

const grids = new Map<string, GridHelper<PickerFilterType>>();

export const getGrid = (e: ActionEvent<any>) => grids.get(e.deviceId);

export const registerPickerGrid = (id: string, rows: number, cols: number) => {
  if (!grids.has(id)) {
    const grid = new GridHelper<PickerFilterType>(
      {
        close: "./imgs/canvas/picker/close.png",
        next: "./imgs/canvas/picker/next.png",
      },
      {
        rows,
        cols,
      }
    );
    grids.set(id, grid).get(id);
  }
  return grids.get(id)!;
};
