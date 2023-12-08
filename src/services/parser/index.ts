import Koa from "koa";
import Router from "@koa/router";

import { handler } from "./handler";

const app = new Koa();
const router = new Router();

router.get("/parser", handler);

app.use(router.routes()).use(router.allowedMethods());

export default {
  path: "/api",
  service: app,
};
