import { Action, ActionEvent } from "@elgato/streamdeck";
import { EventEmitter } from "events";
import { ButtonPosition, ResetAction, idxByPosition } from "./util/util";
import { LockManager } from "./util/LockManager";
import { PaginationManager } from "./util/PaginationManager";

export type ImageOrPromise = string | Promise<string | undefined>;

export interface Cell {
  idx?: number;
  // action
  id?: string;
  action?: Action;
  image?: ImageOrPromise | (() => ImageOrPromise);
  title?: string;
  type?: string;
  onPress?: null | ((btn: Cell) => void);
  onDialRight?: null | ((btn: Cell) => void);
  onDialLeft?: null | ((btn: Cell) => void);
  // loader while image is loading
  loader?: string;
  // touch bar for Stream Deck+ devices
  layout?: string;
  // dev can lock a button
  locked?: boolean;
}

const lastUpdates = new Map<string, number>();

export type ActionCoordinates = {
  coordinates: {
    row: number;
    column: number;
  };
};

export type Size = {
  rows: number;
  columns: number;
};

type ImagePromised =
  | string
  | null
  | undefined
  | Promise<string | null | undefined>;

export type GridExtension = {
  setup: (grid: GridHelper) => void;
  destroy?: (grid: GridHelper) => void;
};

export type Encoders = {
  enabled: boolean;
  layout?: string;
};

type Hooks = {
  onPreRender?: (cells: Cell[]) => void | Promise<void>;
  onPostRender?: (cells: Cell[]) => void | Promise<void>;
};

export class GridHelper {
  constructor(
    public readonly size: Size,
    public readonly encoders: Encoders,
    private readonly openGrid: () => void,
    private readonly destroyGrid: () => void
  ) {}

  /**
   * the current buttons array
   */
  public buttons: Cell[] = [];

  public hooks: Hooks = {};

  /**
   * all the cells to paginate inside the buttons array
   */
  public cells: Cell[] = [];

  public get hasTouchBar() {
    return this.encoders.enabled;
  }

  get available() {
    return this.buttons.filter((btn) => !btn.locked);
  }

  public lock = LockManager(this);

  public pagination = PaginationManager(this);

  /**
   * the event emitter to listen for button presses
   */
  private events = new EventEmitter();

  on(event: string, listener: (...args: any[]) => void) {
    this.events.on(event, listener);
  }

  once(event: string, listener: (...args: any[]) => void) {
    this.events.once(event, listener);
  }

  emit(event: string, ...args: any[]) {
    this.events.emit(event, ...args);
  }

  // Hooks

  onPreRender(cb: Hooks["onPreRender"]) {
    this.hooks.onPreRender = cb;
  }

  onPostRender(cb: Hooks["onPostRender"]) {
    this.hooks.onPostRender = cb;
  }

  sub2Idx(e: ActionEvent<any>, fromEncoder = false) {
    const coords = e.payload as unknown as ActionCoordinates;
    return (
      (fromEncoder ? this.size.rows - 1 : coords.coordinates.row) *
        this.size.columns +
      coords.coordinates.column
    );
  }

  /**
   * Initializes the grid
   */
  init() {
    const total = this.size.rows * this.size.columns;
    this.buttons = [...new Array(total)].map((_, idx) => ({ idx }));
  }

  /**
   * Fills the grid with the given cells
   * @param cells the cells to fill the grid with
   * @param options the options
   * @param options.keepPage if true, the current page is kept
   */
  fill(
    cells: Cell[],
    options?: {
      keepPage?: boolean;
    }
  ) {
    this.cells = cells;
    if (options?.keepPage) {
      return this.reload();
    } else {
      return this.pagination.reset();
    }
  }

  /**
   * Applies the cells to the buttons (paginated)
   */
  public async reload() {
    await this.hooks.onPreRender?.(this.cells);
    // initial paginated index
    let idx = this.pagination.current * this.available.length;
    // update buttons
    this.buttons.forEach((button) => {
      if (!button.locked) {
        Object.assign(
          button,
          // reset the button
          ResetAction,
          // apply the cell
          this.cells[idx++] ?? {}
        );
      }
    });
    await Promise.all(this.buttons.map((button) => this.renderButton(button)));
    await this.hooks.onPostRender?.(this.cells);
  }

  /**
   * Renders a button
   * @param btn the button to render
   */
  async renderButton(btn: Cell) {
    const now = Date.now();

    // the button is not yet linked to an action
    if (!btn.action) return;

    // load the image if it's a promise
    let imageRes: ImagePromised =
      typeof btn.image === "function" ? btn.image() : btn.image;

    // show a loader if the image is not ready
    if (typeof imageRes !== "string" && btn.loader) {
      await btn.action.setImage(btn.loader);
    }

    // wait for the image to load
    const image = (await imageRes) ?? "";

    // if the button is not updated in the meantime, update it
    if (Number(lastUpdates.get(btn.id!)) > now) {
      return;
    }

    if (btn.layout) {
      btn.action.setFeedbackLayout(btn.layout);
      btn.action.setFeedback({
        image,
        title: btn.title ?? "",
      });
    } else {
      btn.action.setImage(image);
      btn.action.setTitle(btn.title);
    }

    lastUpdates.set(btn.id!, now);
  }

  /**
   * Updates a button with the given data
   * @param button the button to update
   * @param update the update data
   */
  update(button: Cell | number | ButtonPosition, update: Partial<Cell>) {
    if (typeof button === "number") {
      button = this.buttons[button];
    } else if (typeof button === "string") {
      button = this.buttons[idxByPosition(button, this.size)];
    } else {
      button = this.buttons[button.idx!];
    }
    Object.assign(button, update);
    return this.renderButton(button);
  }

  /**
   * Resets a button
   * @param button the button to reset
   */
  reset(button: number | ButtonPosition) {
    return this.update(button, ResetAction);
  }

  /**
   * Links a action instance to a button
   * @param e the event with the action
   * @param fromEncoder if the action comes from an encoder
   */
  link(e: ActionEvent<any>, fromEncoder = false) {
    const idx = this.sub2Idx(e, fromEncoder);
    const button = this.buttons[idx];
    // update the action
    button.action = e.action;
    // update the layout
    if (fromEncoder) {
      button.layout = this.encoders.layout;
    }
    this.renderButton(button);
    // emit ready if all buttons are linked
    if (this.buttons.every((btn) => btn.action)) {
      this.events.emit("ready");
    }
  }

  /**
   * Unlinks a button
   * @param e the event with the action
   */
  unlink() {
    this.destroy();
  }

  /**
   * Opens the grid
   */
  open() {
    this.openGrid();
  }

  /**
   * Closes the grid
   */
  destroy() {
    if (this.buttons.length === 0) {
      return;
    }
    this.buttons = [];
    this.cells = [];
    this.events.removeAllListeners();
    this.destroyGrid();
    this.emit("close");
  }

  /**
   * Method invoked when a button is pressed
   * @param e the event
   * @param fromEncoder if the action comes from an encoder
   */
  onPress(e: ActionEvent<any>, fromEncoder = false) {
    const idx = this.sub2Idx(e, fromEncoder);
    const btn = this.buttons[idx];

    if (btn.onPress) {
      return btn.onPress(btn);
    }
    // emit action
    // this.events.emit(btn.type!);
    this.events.emit("press", btn);
  }

  /**
   * Method invoked when a dial is rotated
   * @param e the event
   * @param clockwise if the dial is rotated clockwise
   */
  onDial(e: ActionEvent<any>, clockwise: boolean) {
    const idx = this.sub2Idx(e, true);
    const btn = this.buttons[idx];
    if (clockwise && btn.onDialRight) {
      return btn.onDialRight(btn);
    }
    if (!clockwise && btn.onDialLeft) {
      return btn.onDialLeft(btn);
    }
    this.events.emit("press", {
      ...btn,
      clockwise,
    });
  }
}
