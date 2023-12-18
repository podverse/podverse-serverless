import { createServer, proxy } from "aws-serverless-express"
import app from "./app"

const server = createServer(app.callback())

// TODO: why doesn't the linter catch that no types are defined for event and context?
// TODO: add types
export const handler = (event, context) => proxy(server, event, context)
