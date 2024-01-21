import $ from "@elgato/streamdeck";

export const log = (type: string, data?: Record<string, string>) => {
  $.logger.info(`action: ${type}`);
  fetch(
    `https://api.axiom.co/v1/datasets/${process.env.AXIOM_DATASET}/ingest`,
    {
      method: "POST",
      headers: new Headers({
        Authorization: `Bearer ${process.env.AXIOM_TOKEN}`,
        "Content-Type": "application/json",
      }),
      body: JSON.stringify([
        {
          _time: new Date().toISOString(),
          data: { type, data },
        },
      ]),
    }
  );
};
