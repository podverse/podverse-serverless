
import { getPodcastByFeedUrl } from 'podverse-orm'
import { Podcast, addCacheBustUrlParameter } from 'podverse-shared'
import { logPerformance } from '../../utility/logger'
import { partytimeInstance } from '../../factories/partytime'

// TODO: add proper logging

export const parseFeed = async (
  url: string,
  databasePodcast?: Podcast
) => {
  logPerformance(`parseRSSFeedUrl ${url} started...`)
  const { excludeCacheBust } = databasePodcast || {}

  try {
    /*
      parseFeed will take 2 different paths depending on whether
      a podcast for that feed already exists in our database.
    */
    let databasePodcast = null
    try {
      databasePodcast = await getPodcastByFeedUrl(url)
    } catch (error) {
      //
    }

    if (databasePodcast) {
      // Return just the podcastId, so the client app can decide what to do with it.
      return {
        podcastId: databasePodcast.id
      }
    } else {
      const urlToParse = addCacheBustUrlParameter(url, excludeCacheBust)
      logPerformance(`urlToParse ${urlToParse}`)
  
      logPerformance(`fetchFeed start`)
      const partytimeParsedFeed = await partytimeInstance.parseFeed(url)
      logPerformance(`fetchFeed end`)
  
      logPerformance(`parseRSSFeedUrl ${url} finished`)
      return {
        podcast: partytimeParsedFeed.podcast,
        episodes: partytimeParsedFeed.episodes,
        liveItems: partytimeParsedFeed.liveItems
      }
    }
  } catch (error) {
    logPerformance(`parseRSSFeedUrl ${url} error`)
    throw(error)
  }
}
