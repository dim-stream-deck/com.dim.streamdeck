export type PullItemAction = "equip" | "pull" | "vault";

export type PullItemSettings = {
  item?: string;
  icon?: string;
  inventory?: boolean;
  isExotic?: boolean;
  isSubClass?: boolean;
  label?: string;
  overlay?: string;
  subtitle?: string;
  element?: string;
};
