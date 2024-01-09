export type PostmasterType =
  | ""
  | "total"
  | "enhancementPrisms"
  | "ascendantShards"
  | "spoils";

export type CounterStyle = "percentage" | "counter";

export type PostmasterSettings = {
  postmasterItem: PostmasterType;
  collectPostmaster?: boolean;
  style: CounterStyle;
};
