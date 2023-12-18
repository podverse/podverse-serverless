import Koa from "koa"
import cors from "@koa/cors"
import bodyparser from "koa-bodyparser"
import mount from "koa-mount"
import loggerMw from "koa-mw-logger"
import { middlewares } from "./middlewares"
import { services } from "./services"

const app = new Koa()

app.use(cors())
app.use(bodyparser())
app.use(loggerMw())

middlewares.forEach((mw) => {
  app.use(mw)
})

services.forEach((svc) => {
  app.use(mount(svc.path, svc.service))
})

export default app
