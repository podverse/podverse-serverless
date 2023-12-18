import * as Koa from 'koa'
import { parseFeed } from './parser'

export async function handler(ctx: Koa.BaseContext, next: () => Promise<void>) {
  const { query } = ctx
  // TODO: remove any?
  const { feedUrl } = query as any

  if (!feedUrl) {
    throw new Error('A feedUrl parameter must be provided')
  }

  const response = await parseFeed(feedUrl)
  ctx.body = response
  return next()
}
  