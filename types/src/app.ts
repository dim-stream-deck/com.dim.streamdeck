export type AppSettings = {
  beta?: boolean;
  type?:
    | "app-browser"
    | "beta-browser"
    | "app-chrome"
    | "beta-chrome"
    | "app-windows";
};

export type AppType = AppSettings["type"];
