import { connectToDb } from 'podverse-orm'
import app from "./app"

const startup = async () => {
  await connectToDb()

  app.listen(3030, () => {
    console.log("Server listening on port 3030")
  })
}

startup()
