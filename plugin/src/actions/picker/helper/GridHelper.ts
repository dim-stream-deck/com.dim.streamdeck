import { Loaders } from "@/util/images";
import $, { Action, ActionEvent } from "@elgato/streamdeck";
import { EventEmitter } from "events";

export interface Cell<Type> {
  id?: string;
  action?: Action;
  image?: string | (() => Promise<string>);
  title?: string;
  type?: "close" | "next" | Type;
  misc?: Record<string, string | boolean | number>;
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
};

type Size = {
  rows: number;
  cols: number;
};

export class GridHelper<Type> {
  constructor(
    private readonly icons: Icons,
    private readonly size: Size
  ) {}

  /**
   * the current buttons array
   */
  private buttons: Cell<Type>[] = [];

  /**
   * all the cells to paginate inside the buttons array
   */
  private cells: Cell<Type>[] = [];

  /**
   * pre-calculated indexes
   */
  private index = {
    close: 0,
    end: 0,
  };

  /**
   * the current page
   * @default 0
   * @see {@link GridHelper.onNextPage}
   * @see {@link GridHelper.applyCells}
   */
  private page: number = 0;

  /**
   * the event emitter to listen for button presses
   */
  private events = new EventEmitter();

  sub2Idx(e: ActionEvent<any>) {
    const coords = e.payload as unknown as ActionCoordinates;
    return coords.coordinates.row * this.size.cols + coords.coordinates.column;
  }

  get lastRow() {
    return this.buttons.slice(this.index.close + 1);
  }

  init() {
    const total = this.size.rows * this.size.cols;
    this.index.close = total - this.size.cols;
    this.index.end = total - 1;
    this.page = 0;
    // cleanup any listeners
    this.events.removeAllListeners();
    // fill empty buttons
    this.buttons = new Array(total).fill(null).map(() => ({}));
    // fill close button
    this.buttons[this.index.close] = {
      image: this.icons.close,
      type: "close",
    };
    // refresh the grid
    this.render();
    return this.events;
  }

  fill(cells: Cell<Type>[]) {
    this.page = 0;
    this.cells = cells;
    this.applyCells();
    this.render();
  }

  fillAvailable(cell: Cell<Type>) {
    for (let i = 0; i < this.index.close; i++) {
      const button = this.buttons[i];
      this.updateButton(button, cell);
    }
  }

  get total() {
    return Math.ceil(this.cells.length / this.index.close);
  }

  applyCells() {
    const cells = this.cells;
    const free = this.index.close;
    let idx = this.page * free;

    // update buttons
    for (let i = 0; i < Math.min(cells.length, free); i++) {
      Object.assign(
        this.buttons[i],
        cells[idx++] ?? { image: "", title: "", ...cells[idx++] }
      );
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
    const hasNext = cells.length > free;
    this.updateButton(nextButton, {
      type: "next",
      image: hasNext
        ? this.icons.next
        : this.icons.next.replace(".png", "-off.png"),
    });
  }

  private async renderButton(button: Cell<Type>) {
    const image =
      typeof button.image === "function" ? button.image() : button.image;

    // show a loader if the image is not ready
    if (typeof image !== "string") {
      const type = button.misc?.isExotic ? "exotic" : "legendary";
      await button.action?.setImage(Loaders[type]);
    }

    button.action?.setImage((await image) || "");
    button.action?.setTitle(button.title || "");
    return;
  }

  async render(button?: Cell<Type>) {
    if (button) {
      return this.renderButton(button);
    }
    return Promise.all(this.buttons.map((button) => this.renderButton(button)));
  }

  updateButton(button: Cell<Type>, update: Partial<Cell<Type>>) {
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
    const button = this.buttons[idx];

    if (button.type === "close") {
      return this.close(e);
    }

    if (button.type === "next") {
      return this.onNextPage();
    }

    this.events.emit("press", button);
  }

  onNextPage() {
    this.page = (this.page + 1) % this.total;
    this.applyCells();
    this.render();
  }
}
