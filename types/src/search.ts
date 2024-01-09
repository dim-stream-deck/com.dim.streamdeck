export type SearchSettings = {
  /**
   * @deprecated
   * @see query
   */
  search?: string;
  query: string;
  page: string;
  behavior?: "search" | "pull" | "send-to-vault";
};

export type SearchBehavior = SearchSettings["behavior"];
