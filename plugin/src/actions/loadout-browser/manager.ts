import { randomUUID } from "node:crypto";
import {
  BrowserLoadout,
  BrowserLoadouts,
  LoadoutBrowserClass,
  LoadoutBrowserSettings,
} from "@plugin/types";
import { DIM } from "@/dim/api";
import { GridHelper } from "@/lib/grid";
import { downloadAsBase64 } from "@/lib/image";
import { ev } from "@/util/ev";
import { bungify } from "@/util/images";
import { LoadoutIcon } from "../loadout/loadout-icon";

const classes = ["titan", "hunter", "warlock"];
const classOptions = ["current", "all", ...classes] as const;
const normalizeTag = (tag: string) => tag.trim().replace(/^#/, "").toLowerCase();
const title = (text: string) =>
  Array.from(text)
    .slice(0, 30)
    .join("")
    .match(/.{1,10}/gu)
    ?.join("\n") ?? "";
const fallbackIcon = "./imgs/actions/loadout/state.png";

export const onLoadoutBrowserActivate = (
  grid: GridHelper,
  device: string,
  settings: LoadoutBrowserSettings,
) => {
  grid.init();
  const requestId = randomUUID();
  const event = `loadouts:${device}`;
  let data: BrowserLoadouts | undefined;
  let classFilter: LoadoutBrowserClass = settings.classFilter;
  let hashtag = normalizeTag(settings.hashtag);
  let panel = false;
  let timedOut = false;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const key = (loadout: BrowserLoadout) => `${loadout.loadout}:${loadout.character}`;

  const render = () => {
    if (panel) {
      const tags = [
        ...new Set([hashtag, ...(data?.loadouts.flatMap((l) => l.tags.map(normalizeTag)) ?? [])]),
      ]
        .filter(Boolean)
        .sort();
      grid.fill([
        ...classOptions.map((value) => ({
          type: "browser:class",
          id: value,
          title: title(value === "current" ? "Current" : value),
          image: `./imgs/canvas/picker/class/${classes.includes(value) ? value : "all"}.png`,
        })),
        { type: "browser:tag", id: "", title: "All tags", image: "" },
        ...tags.map((tag) => ({
          type: "browser:tag",
          id: tag,
          title: title(`#${tag}`),
          image: "",
        })),
      ]);
      return;
    }
    if (!data) {
      grid.fill([
        { title: timedOut ? "Check DIM\nUpdate &\nreopen" : "Loading\nloadouts", image: "" },
      ]);
      return;
    }
    const { currentCharacter } = data;
    const loadouts = data.loadouts.filter((loadout) => {
      const matchesClass =
        classFilter === "all" ||
        (classFilter === "current"
          ? loadout.character === currentCharacter
          : classes[loadout.classType] === classFilter);
      return (
        matchesClass && (!hashtag || loadout.tags.some((tag) => normalizeTag(tag) === hashtag))
      );
    });
    grid.fill(
      loadouts.length
        ? loadouts.map((loadout) => ({
            type: "browser:loadout",
            id: key(loadout),
            title: `${title(Array.from(loadout.label).slice(0, 20).join(""))}\n${classes[loadout.classType]}`,
            image: async () =>
              (loadout.inGameIcon
                ? await LoadoutIcon(loadout.inGameIcon)
                : loadout.icon && (await downloadAsBase64(bungify(loadout.icon)))) || fallbackIcon,
          }))
        : [{ title: "No matching\nloadouts\nUse Filters", image: "" }],
    );
  };

  grid.onPreRender(() => {
    grid.lock.add("last-row", {});
    const start = (grid.size.rows - 1) * grid.size.columns;
    grid.update(start, {
      title: grid.hasTouchBar ? "" : panel ? "Back" : "Exit",
      type: "navigation",
      image: `./imgs/canvas/picker/${panel ? "prev" : "close"}.png`,
      onPress: () => {
        if (panel) {
          panel = false;
          render();
        } else grid.destroy();
      },
    });
    grid.update(start + 1, {
      title: grid.hasTouchBar
        ? ""
        : panel
          ? "Filters"
          : title(`Filters\n${classFilter}\n${hashtag ? `#${hashtag}` : "All tags"}`),
      type: "navigation",
      image: grid.hasTouchBar ? "./imgs/canvas/picker/filters/all.png" : "",
      onPress: () => {
        panel = !panel;
        render();
      },
    });
    grid.update("bottom-right", {
      title:
        !grid.hasTouchBar && grid.pagination.required
          ? `${grid.pagination.current + 1}/${Math.ceil(grid.cells.length / grid.available.length)}`
          : "",
      type: "navigation",
      image: grid.pagination.required ? "./imgs/canvas/picker/next.png" : "",
      onPress: () => {
        if (grid.pagination.required) grid.pagination.next();
      },
      onDialLeft: () => {
        if (grid.pagination.required) grid.pagination.previous();
      },
      onDialRight: () => {
        if (grid.pagination.required) grid.pagination.next();
      },
    });
  });

  grid.on("press", (button: { type?: string; id?: string }) => {
    if (button.type === "browser:class") {
      classFilter = button.id as LoadoutBrowserClass;
      panel = false;
      render();
    } else if (button.type === "browser:tag") {
      hashtag = button.id ?? "";
      panel = false;
      render();
    } else if (button.type === "browser:loadout") {
      const loadout = data?.loadouts.find((loadout) => key(loadout) === button.id);
      if (loadout) DIM.equipLoadout({ loadout: loadout.loadout, character: loadout.character });
    }
  });

  const receive = (response: BrowserLoadouts) => {
    if (response.requestId !== requestId) return;
    clearTimeout(timeout);
    data = response;
    render();
  };
  grid.once("ready", () => {
    ev.on(event, receive);
    render();
    timeout = setTimeout(() => {
      timedOut = true;
      render();
    }, 8000);
    timeout.unref();
    DIM.requestLoadouts({ device, requestId });
  });
  grid.once("close", () => {
    clearTimeout(timeout);
    ev.removeListener(event, receive);
  });
  grid.open();
};
