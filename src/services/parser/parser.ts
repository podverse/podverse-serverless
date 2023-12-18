
import { getFeedUrlByUrlIgnoreProtocolForPublicPodcast } from 'podverse-orm'
import { Podcast, addCacheBustUrlParameter, generateAbortAPI } from 'podverse-shared'
import { logPerformance } from '../../utility/logger'
import { partytimeInstance } from '../../factories/partytime'
import { _logEnd, _logStart } from '../../../../podverse-shared/dist'

// TODO: add proper logging

export const parseFeed = async (
  url: string,
  databasePodcast?: Podcast
) => {
  logPerformance(`parseRSSFeedUrl ${url} started...`)
  const { excludeCacheBust } = databasePodcast || {}
  const abortAPI = generateAbortAPI()

  try {
    let databasePodcast = null
    try {
      const feedUrl = await getFeedUrlByUrlIgnoreProtocolForPublicPodcast(url)
      databasePodcast = feedUrl?.podcast
    } catch (error) {
      //
    }

    if (databasePodcast) {
      // Return just the podcastId, so the client app can decide what to do with it.
      return {
        podcastId: databasePodcast.id,
        podcast: null,
        episodes: null,
        liveItems: null
      }
    } else {
      const urlToParse = addCacheBustUrlParameter(url, excludeCacheBust)
      logPerformance(`urlToParse ${urlToParse}`, _logStart)
  
      logPerformance(`fetchFeed`, _logStart)
      const partytimeParsedFeed = await partytimeInstance.parseFeed(url, abortAPI)
      clearTimeout(abortAPI.abortTimeout)
      logPerformance(`fetchFeed`, _logEnd)
  
      logPerformance(`parseRSSFeedUrl ${urlToParse}`, _logEnd)
      return {
        podcastId: null,
        podcast: partytimeParsedFeed.podcast,
        episodes: partytimeParsedFeed.episodes,
        liveItems: partytimeParsedFeed.liveItems
      }
    }
  } catch (error) {
    logPerformance(`error: parseRSSFeedUrl ${url}`, _logEnd)
    throw(error)
  }
}
