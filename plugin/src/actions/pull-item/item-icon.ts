import { cache } from "@/util/cache";
import { CanvasKit, grayscale, withCanvas } from "@/util/canvas";
import { bungify, equippedMark, exotic, legendary, itemFont } from "@/util/images";
import { downloadAsArrayBuffer } from "@/lib/image";
import { GlobalSettings, PullItemSettings } from "@plugin/types";
import { EmulatedCanvas2DContext } from "canvaskit-wasm";

interface ItemIconOptions {
  grayscale?: boolean;
  equipped?: boolean;
  layout?: GlobalSettings["pullItemTileLayout"];
}

export const itemIconCacheKey = (item: PullItemSettings, options?: ItemIconOptions) => [
  "item-v8",
  item.icon,
  options?.layout ?? "dim",
  item.overlay,
  item.tier,
  item.power,
  item.breaker,
  item.badge,
  item.seasonIcon,
  item.masterwork,
  item.locked,
  item.element,
  item.isCrafted,
  item.craftedOverlay,
  item.craftedBackground,
  item.isExotic,
  item.isSubClass,
  options?.grayscale ?? false,
  options?.equipped ?? false,
];

export const ItemIcon = async (item: PullItemSettings, options?: ItemIconOptions) => {
  // Check if the image is already cached
  const cacheKey = itemIconCacheKey(item, options);
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  if (!item.icon) {
    return "";
  }

  // Generate the image
  const source = await downloadAsArrayBuffer(bungify(item.icon));
  if (!source) return "";
  const Canvas = await CanvasKit;
  return withCanvas(Canvas, 144, 144, async (canvas, decode) => {
    const ctx = canvas.getContext("2d") as EmulatedCanvas2DContext;
    const image = decode(source);
    const rarityImage = decode(item.isExotic ? exotic : legendary);

    const artHeight = options?.layout === "fill" ? 116 : 144;
    ctx.save();
    if (!item.isSubClass) {
      // DIM style fits the full tile; fill mode uses the key width and crops the artwork.
      const scale = 144 / (artHeight + 28);
      ctx.translate((144 - 144 * scale) / 2, 0);
      ctx.scale(scale, scale);
    }
    ctx.drawImage(image, 0, 0, 144, 144);

    // skip some overlay stuff for subclasses
    if (!item.isSubClass) {
      if (item.overlay && !item.seasonIcon) {
        const overlayImage = decode(await downloadAsArrayBuffer(bungify(item.overlay)));
        if (overlayImage) ctx.drawImage(overlayImage, 0, 0, 144, 144);
      }
      ctx.drawImage(rarityImage, 0, 0, 144, 144);
      // DIM's crafted layers belong to the image, above the power strip.
      for (const path of [
        item.craftedBackground ??
          (item.isCrafted ? "/img/destiny_content/items/crafted-icon-background.png" : undefined),
        item.craftedOverlay ??
          (item.isCrafted ? "/img/destiny_content/items/crafted-icon-overlay.png" : undefined),
      ]) {
        if (!path) continue;
        const layer = decode(await downloadAsArrayBuffer(bungify(path)));
        if (layer) ctx.drawImage(layer, 0, 0, 144, artHeight);
      }
      if (item.seasonIcon) {
        const season = decode(await downloadAsArrayBuffer(bungify(item.seasonIcon)));
        if (season) ctx.drawImage(season, 9, 3, 22, 22);
      }
      if (item.badge) {
        const badge = decode(await downloadAsArrayBuffer(bungify(item.badge)));
        if (badge) ctx.drawImage(badge, 108, 4, 32, 32);
      }

      ctx.fillStyle = "#fcff99";
      // DIM starts showing pips at tier 2, with one pip per tier.
      if (item.tier > 1) {
        const count = Math.min(item.tier, 5);
        const top = 29;
        // The crafted symbol starts at row 73 of Bungie's 96px overlay.
        const bottom = item.isCrafted ? (artHeight * 73) / 96 - 2 : artHeight - 2;
        const size = Math.min(20, (bottom - top - (count - 1) * 2) / count);
        const radius = size / (2 * Math.SQRT2);
        for (let i = 0; i < count; i++) {
          ctx.save();
          ctx.translate(20, top + size / 2 + i * (size + 2));
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
          ctx.restore();
        }
      }

      if (item.power != null || item.element || item.breaker) {
        ctx.fillStyle = item.masterwork ? "#745700" : "black";
        ctx.fillRect(0, artHeight, 144, 28);
        canvas.loadFont(itemFont, { family: "Item" });
        ctx.font = "26px Item";
        ctx.fillStyle = "white";
        const power = item.power != null ? String(item.power) : "";
        const powerWidth = power ? ctx.measureText(power).width : 0;
        if (power) ctx.fillText(power, 140 - powerWidth, artHeight + 23);
        let x = 136 - powerWidth;
        for (const icon of [item.element, item.breaker]) {
          if (!icon) continue;
          const image = decode(await downloadAsArrayBuffer(bungify(icon)));
          if (image) {
            x -= 24;
            ctx.drawImage(image, x, artHeight + 3, 22, 22);
          }
        }
      }

      if (item.masterwork) {
        ctx.strokeStyle = "#eade8b";
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, 142, artHeight + 26);
      }
      if (item.locked) {
        ctx.strokeStyle = "#36e24a";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(130, artHeight - 17, 5, Math.PI, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = "#36e24a";
        ctx.fillRect(122, artHeight - 17, 16, 13);
      }
    }

    if (options?.equipped && !options.grayscale) {
      const mark = decode(equippedMark);
      const size = 24;
      ctx.drawImage(
        mark,
        item.isSubClass ? 12 : 4,
        item.isSubClass ? 108 : artHeight + 2,
        size,
        size,
      );
    }
    ctx.restore();

    if (!options?.equipped && options?.grayscale) {
      grayscale(ctx);
    }

    // Cache the image
    const generated = canvas.toDataURL();
    cache.set(cacheKey, generated);
    return generated;
  });
};
