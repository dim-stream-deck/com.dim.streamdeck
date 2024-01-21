export const log = (type: string, data?: Record<string, string>) => {
  fetch(
    `https://api.axiom.co/v1/datasets/${import.meta.env.VITE_AXIOM_DATASET}/ingest`,
    {
      method: "POST",
      headers: new Headers({
        Authorization: `Bearer ${import.meta.env.VITE_AXIOM_TOKEN}`,
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
