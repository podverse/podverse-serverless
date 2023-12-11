
import { PartytimeService } from 'podverse-parser'
import { Podcast, addCacheBustUrlParameter, createAbortController } from 'podverse-shared'
import { logPerformance } from '../../utility/logger'
import { config } from '../../config'

// TODO: add proper logging

const parser = new PartytimeService({
  userAgent: config.userAgent
})

export const parseFeed = async (
  url: string,
  databasePodcast?: Podcast
) => {
  logPerformance(`parseRSSFeedUrl ${url} started...`)
  const { excludeCacheBust } = databasePodcast || {}
  const abortAPI = createAbortController()
  const { abortTimeout } = abortAPI

  try {
    const urlToParse = addCacheBustUrlParameter(url, excludeCacheBust)
    logPerformance(`urlToParse ${urlToParse}`)

    logPerformance(`fetchFeed start`)
    const partytimeParsedFeed = await parser.parseFeed(url, abortAPI)
    logPerformance(`fetchFeed end`)

    clearTimeout(abortTimeout)

    logPerformance(`parseRSSFeedUrl ${url} finished`)
    return {
      podcast: partytimeParsedFeed.podcast,
      episodes: partytimeParsedFeed.episodes,
      liveItems: partytimeParsedFeed.liveItems
    }

  } catch (error) {
    logPerformance(`parseRSSFeedUrl ${url} error`)
    throw(error)
  }
}
