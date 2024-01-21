import { mod } from "@/util/cyclic";
import { Loaders } from "@/util/images";
import $, { Action, ActionEvent } from "@elgato/streamdeck";
import { EventEmitter } from "events";
import { ImageIcon } from "../util/ImageIcon";

export interface Cell<Type> {
  id?: string;
  action?: Action;
  image?: string | (() => Promise<string>);
  title?: string;
  type?: "close" | "next" | Type;
  loadingType?: "exotic" | "legendary";
  encoder?: boolean;
  layout?: string;
  direction?: "right" | "left";
}

export type ActionCoordinates = {
  coordinates: {
    row: number;
    column: number;
  };
};

type Icons = {
  close: string;
  next: {
    on: string;
    off: string;
  };
};

type Size = {
  rows: number;
  cols: number;
};

export class GridHelper<Type> {
  constructor(
    private readonly icons: Icons,
    private readonly size: Size,
    private readonly hasTouchScreen: boolean
  ) {}

  /**
   * the current buttons array
   */
  private buttons: Cell<Type>[] = [];

  /**
   * the current touch buttons array
   */
  private touchButtons: Cell<Type>[] = [];

  /**
   * all the cells to paginate inside the buttons array
   */
  private cells: Cell<Type>[] = [];

  /**
   * pre-calculated indexes
   */
  private index = {
    free: 0,
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
    return this.hasTouchScreen
      ? this.touchButtons
      : this.buttons.slice(this.index.close);
  }

  init() {
    const total = this.size.rows * this.size.cols;
    this.index.free = this.hasTouchScreen ? total : total - this.size.cols;
    this.index.close = this.hasTouchScreen ? 0 : total - this.size.cols;
    this.index.end = this.hasTouchScreen ? this.size.cols - 1 : total - 1;
    this.page = 0;
    // cleanup any listeners
    this.events.removeAllListeners();
    // fill empty buttons
    this.buttons = new Array(total).fill(null).map(() => ({}));
    // fill touch buttons
    if (this.hasTouchScreen) {
      this.touchButtons = new Array(this.size.cols).fill(null).map(() => ({
        encoder: true,
        layout: "picker-layout.json",
      }));
    } else {
      // fill close button (only for non Stream Deck+ devices)
      Object.assign(this.lastRow[0], {
        image: this.icons.close,
        type: "close",
      });
    }
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

  get total() {
    return Math.ceil(this.cells.length / this.index.free);
  }

  applyCells() {
    const cells = this.cells;
    let idx = this.page * this.index.free;

    // update buttons
    for (let i = 0; i < Math.min(cells.length, this.index.free); i++) {
      Object.assign(
        this.buttons[i],
        Object.assign(
          {},
          { image: "", title: "", loadingType: undefined },
          cells[idx++]
        )
      );
    }

    // cleanup buttons
    for (let i = idx; i < this.index.free; i++) {
      const { action } = this.buttons[i];
      this.buttons[i] = {
        action,
        image: "",
        title: "",
      };
    }

    // update next button
    const nextButton = this.lastRow[this.lastRow.length - 1];
    const hasNext = cells.length > this.index.free;
    this.updateButton(nextButton, {
      type: "next",
      layout: "picker-layout-full.json",
      image: hasNext ? this.icons.next.on : this.icons.next.off,
    });
  }

  private async renderButton(btn: Cell<Type>) {
    if (!btn.action) {
      return;
    }

    let image = typeof btn.image === "function" ? btn.image() : btn.image;

    if (typeof image === "string" && image.startsWith("/")) {
      image = ImageIcon(image);
    }

    // show a loader if the image is not ready
    if (typeof image !== "string" && btn.loadingType) {
      await btn.action.setImage(Loaders[btn.loadingType]);
    }

    const awaited = (await image) || "";

    if (btn.encoder) {
      btn.action.setFeedbackLayout(btn.layout || "");
      btn.action.setFeedback({
        icon: awaited,
        title: btn.title || "",
      });
      btn.action.setImage("./imgs/actions/picker/state.png");
    } else {
      btn.action.setImage(awaited);
      btn.action.setTitle(btn.title || "");
    }
    return;
  }

  async render(button?: Cell<Type>) {
    if (button) {
      return this.renderButton(button);
    }
    return Promise.all(
      [...this.buttons, ...this.touchButtons].map((button) =>
        this.renderButton(button)
      )
    );
  }

  updateButton(button: Cell<Type>, update: Partial<Cell<Type>>) {
    Object.assign(button, update);
    this.render(button);
  }

  link(e: ActionEvent<any>, fromEncoder = false) {
    const idx = this.sub2Idx(e);
    const button = fromEncoder ? this.touchButtons[idx] : this.buttons[idx];
    button.action = e.action;
    this.render(button);
    return button;
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

  onClick(e: ActionEvent<any>, fromEncoder = false) {
    const idx = this.sub2Idx(e);
    const btn = fromEncoder ? this.touchButtons[idx] : this.buttons[idx];

    if (btn.type === "close") {
      return this.close(e);
    }

    if (btn.type === "next") {
      return this.onNextPage(e);
    }

    this.events.emit("press", btn);
  }

  onDial(e: ActionEvent<any>, clockwise: boolean) {
    const idx = this.sub2Idx(e);
    const btn = this.touchButtons[idx];
    if (btn.type === "next") {
      return clockwise ? this.onNextPage(e) : this.onPrevPage();
    }
    btn.direction = clockwise ? "right" : "left";
    this.events.emit("press", btn);
  }

  dialPress(e: ActionEvent<any>) {
    const idx = this.sub2Idx(e);
    const btn = this.touchButtons[idx];
    if (btn.type === "next") {
      this.close(e);
    }
  }

  onNextPage(e: ActionEvent<any>) {
    const hasNext = this.cells.length > this.index.free;
    if (!hasNext) {
      return this.close(e);
    }
    this.page = (this.page + 1) % this.total;
    this.applyCells();
    this.render();
  }

  onPrevPage() {
    this.page = mod(this.page - 1, this.total);
    this.applyCells();
    this.render();
  }
}
