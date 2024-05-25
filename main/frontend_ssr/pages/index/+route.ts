// /pages/product/index/+route.ts

export { route };
import type { RouteSync } from "vike/types";
import { redirect } from "vike/abort";

const route: RouteSync = (pageContext): ReturnType<RouteSync> => {
  // TODO: redirect from Nginx
  if (pageContext.urlParsed.pathname === "/") {
    throw redirect("/en", 301);
  } else {
    return true;
  }
};
