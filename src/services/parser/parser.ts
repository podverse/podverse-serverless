
import { Podcast, addParameterToURL } from 'podverse-shared'
import { partytimeParseFeed } from './partytimeParser'
import { logPerformance } from '../../utility/logger'

// TODO: add proper logging

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
    const partytimeParsedFeed = await partytimeParseFeed(url, abortAPI)
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

// helpers in alphabetical order

const addCacheBustUrlParameter = (url: string, excludeCacheBust?: boolean) => {
  return !excludeCacheBust
  ? addParameterToURL(url, `cacheBust=${Date.now()}`)
  : url
}

const createAbortController = () => {
  const abortTimeLimit = 60000
  const abortController = new AbortController()
  const abortTimeout = setTimeout(() => {
    logPerformance('abortController - time exceeded')
    abortController.abort()
  }, abortTimeLimit)
  return { abortController, abortTimeout }
}
