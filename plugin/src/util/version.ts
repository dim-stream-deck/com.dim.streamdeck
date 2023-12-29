import fs from "fs";
import { z } from "zod";

const ManifestSchema = z.object({
  Version: z.string(),
});

export const manifest = ManifestSchema.parse(
  JSON.parse(fs.readFileSync("./manifest.json", "utf-8"))
);
