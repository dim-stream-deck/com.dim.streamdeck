import $, { Action, ActionEvent } from "@elgato/streamdeck";
import { EventEmitter } from "events";

export interface Cell {
  id?: string | number;
  action?: Action;
  image?: string;
  title?: string;
  type?: "close" | "next" | "prev" | "dequeue" | string;
}

export type ActionCoordinates = {
  coordinates: {
    row: number;
    column: number;
  };
};

type Icons = {
  close: string;
  next: string;
  prev: string;
};

export class GridHelper {
  constructor(private readonly icons: Icons) {}

  private buttons: Cell[] = [];
  private cells: Cell[] = [];
  private size = {
    rows: 0,
    cols: 0,
  };

  private index = {
    close: 0,
    end: 0,
  };

  private page: number = 0;

  private events = new EventEmitter();

  sub2Idx(e: ActionEvent<any>) {
    const coords = e.payload as unknown as ActionCoordinates;
    return coords.coordinates.row * this.size.cols + coords.coordinates.column;
  }

  lastRow() {
    return this.buttons.slice(this.index.close + 1);
  }

  init(rows: number, cols: number) {
    this.size = { rows, cols };
    this.index.close = (rows - 1) * cols;
    this.index.end = rows * cols - 1;
    this.page = 0;
    // cleanup any listeners
    this.events.removeAllListeners();
    // fill empty buttons
    this.buttons = new Array(rows * cols).fill(null).map(() => ({}));
    // fill close button
    this.buttons[this.index.close] = {
      image: this.icons.close,
      type: "close",
    };
    return this.events;
  }

  fill(cells: Cell[]) {
    this.page = 0;
    this.cells = cells;
    this.applyCells();
    this.render();
  }

  applyCells() {
    const cells = this.cells;
    const free = this.index.close;
    const total = Math.ceil(this.cells.length / free) - 1;
    let idx = this.page * free;

    // update buttons
    for (let i = 0; i < Math.min(cells.length, free); i++) {
      Object.assign(this.buttons[i], cells[idx++] ?? { image: "", title: "" });
    }

    // cleanup buttons
    for (let i = idx; i < free; i++) {
      const { action } = this.buttons[i];
      this.buttons[i] = {
        action,
        image: "",
        title: "",
      };
    }

    // update next button
    const nextButton = this.buttons[this.index.end];
    const hasNext = this.page < total && cells.length > free;
    nextButton.image = hasNext
      ? this.icons.next
      : this.icons.next.replace(".png", "-off.png");
    nextButton.type = hasNext ? "next" : "";

    // update prev button
    const prevButton = this.buttons[this.index.end - 1];
    const hasPrev = this.page > 0;
    prevButton.image = hasPrev
      ? this.icons.prev
      : this.icons.prev.replace(".png", "-off.png");
    prevButton.type = hasPrev ? "prev" : "";
  }

  render(button?: Cell) {
    if (button) {
      button.action?.setImage(button.image ?? "");
      button.action?.setTitle(button.title ?? "");
      return;
    }
    this.buttons.forEach((button) => {
      button?.action?.setImage(button.image ?? "");
      button?.action?.setTitle(button.title ?? "");
    });
  }

  updateButton(button: Cell, update: Partial<Cell>) {
    Object.assign(button, update);
    this.render(button);
  }

  link(e: ActionEvent<any>) {
    const idx = this.sub2Idx(e);
    this.buttons[idx].action = e.action;
    return this.buttons[idx];
  }

  free(e: ActionEvent<any>) {
    const idx = this.sub2Idx(e);
    this.buttons[idx].action = undefined;
  }

  button(action: ActionEvent<any>) {
    const idx = this.sub2Idx(action);
    return this.buttons[idx];
  }

  // cleanup
  close(e: ActionEvent<any>) {
    this.cells = [];
    this.events.removeAllListeners();
    $.profiles.switchToProfile(e.deviceId);
  }

  onClick(e: ActionEvent<any>) {
    const idx = this.sub2Idx(e);
    this.events.emit("press", this.buttons[idx]);
  }

  onNextPage() {
    this.page++;
    this.applyCells();
    this.render();
  }

  onPrevPage() {
    this.page--;
    this.applyCells();
    this.render();
  }
}
