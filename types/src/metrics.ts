// Metrics

export const MetricTypes = [
  "battlePass",
  "crucible",
  "gambit",
  "gunsmith",
  "ironBanner",
  "trials",
  "triumphs",
  "triumphsActive",
  "vanguard",
] as const;

export type MetricType = (typeof MetricTypes)[number];

export type MetricsSettings = {
  metric?: MetricType;
  disabled?: MetricType[];
  order?: MetricType[];
  pinned?: boolean;
};
