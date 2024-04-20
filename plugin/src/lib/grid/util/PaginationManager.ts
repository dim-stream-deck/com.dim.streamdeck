import { GridHelper } from "../helper";
import { mod } from "./util";

export const PaginationManager = (helper: GridHelper) => {
  let page = 0;

  const total = () => Math.ceil(helper.cells.length / helper.available.length);

  return {
    get current() {
      return page;
    },
    get required() {
      return helper.cells.length / helper.available.length > 1;
    },
    next: () => {
      page = mod(page + 1, total());
      helper.reload();
    },
    previous: () => {
      page = mod(page - 1, total());
      helper.reload();
    },
    reset: (reload = true) => {
      page = 0;
      reload && helper.reload();
    },
  };
};
