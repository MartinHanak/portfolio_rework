export { onBeforePrerenderStart };

import type { OnBeforePrerenderStartAsync } from "vike/types";
import { locales } from "../../../utils/locales";

const onBeforePrerenderStart: OnBeforePrerenderStartAsync =
  async (): ReturnType<OnBeforePrerenderStartAsync> => {
    return locales.map((value) => `/${value}/editor`);
  };
