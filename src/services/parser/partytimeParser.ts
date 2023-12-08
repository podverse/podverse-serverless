import nodeFetch from 'node-fetch'
import { Episode, FeedObject, Phase1Funding, Phase4Value, parseFeed } from 'podcast-partytime'
import { userAgent } from "../../utility/constants"
import { AbortAPI } from "../../utility/types"
import { Funding, ParsedEpisode, ValueTagOriginal, podcastItunesTypeDefaultValue } from 'podverse-shared'
import { Phase4Medium, Phase4PodcastLiveItem } from 'podcast-partytime/dist/parser/phase/phase-4'
import { PhasePendingChat } from 'podcast-partytime/dist/parser/phase/phase-pending'

// TODO: can we get rid of these interfaces?
interface ExtendedPhase4PodcastLiveItem extends Phase4PodcastLiveItem {
  chat?: PhasePendingChat
  image?: string
}

interface ExtendedChat extends Omit<PhasePendingChat, 'phase'> {
  phase?: 'pending' | '4'
  url?: string
}

export const partytimeParseFeed = async (url: string, abortAPI: AbortAPI) => {
  try {
    const { abortController } = abortAPI
    const response = await nodeFetch(url, {
      headers: { 'User-Agent': userAgent },
      follow: 5,
      size: 40000000,
      signal: abortController.signal
    })

    if (response.ok) {
      const xml = await response.text()
      const parsedFeed = parseFeed(xml, { allowMissingGuid: true })
      
      if (!parsedFeed) {
        throw new Error('parseFeedUrl invalid partytime parser response')
      }

      const podcast = podcastCompat(parsedFeed)
      const episodes = parsedFeed.items.map(episodeCompat)
      // TODO: any...why are the types incompatible?
      const liveItems = podcast.liveItems.map(liveItemCompatToEpisode as any)

      return { podcast, episodes, liveItems }
    } else {
      const errorBody = await response.text()
      throw new Error(errorBody)
    }    
  } catch (error) {
    throw new Error(error)
  }
}

// The compat functions convert the podcast-partytime schema to the podverse schema

const fundingCompat = (funding: Phase1Funding): Funding => {
  return {
    value: funding.message,
    url: funding.url
  }
}

const valueCompat = (val: Phase4Value): ValueTagOriginal => {
  return {
    type: val.type,
    method: val.method,
    suggested: val.suggested,
    recipients: val.recipients.map((r) => {
      return {
        name: r.name,
        type: r.type,
        address: r.address,
        split: r.split.toString(),
        fee: r.fee,
        customKey: r.customKey,
        customValue: r.customValue
      }
    }),
    // TODO: get rid of / resolve valueTimeSplits type issue?
    valueTimeSplits: val.valueTimeSplits as any || []
  }
}

const podcastCompat = (feed: FeedObject) => {
  return {
    author: Array.isArray(feed.author) ? feed.author : feed.author ? [feed.author] : [],
    blocked: feed.itunesBlock,
    categories: feed.itunesCategory,
    description: feed.description,
    explicit: feed.explicit,
    funding: Array.isArray(feed.podcastFunding) ? feed.podcastFunding?.map((f) => fundingCompat(f)) : [],
    generator: feed.generator,
    guid: feed.guid,
    imageURL: feed.itunesImage || feed.image?.url,
    itunesType: feed.itunesType || podcastItunesTypeDefaultValue,
    language: feed.language,
    lastBuildDate: feed.lastBuildDate,
    link: feed.link,
    liveItems: feed.podcastLiveItems ?? [],
    medium: feed.medium ?? Phase4Medium.Podcast,
    owner: feed.owner,
    pubDate: feed.pubDate,
    subtitle: feed.subtitle,
    summary: feed.summary,
    title: feed.title,
    type: feed.itunesType,
    value: feed.value ? [valueCompat(feed.value)] : []
  }
}

// Convert the podcast-partytime schema to a podverse compatible schema.
const episodeCompat = (episode: Episode) => {
  return {
    alternateEnclosures: episode.alternativeEnclosures ?? [],
    author: [episode.author],
    chapters: episode.podcastChapters,
    // TODO: why does contentLinks exist on liveItem but not episode type?
    contentLinks: episode.contentLinks || [],
    description: episode.content || episode.description,
    duration: episode.duration,
    enclosure: episode.enclosure,
    explicit: episode.explicit,
    // funding: Array.isArray(episode.podcastFunding) ? episode.podcastFunding?.map((f) => fundingCompat(f)) : [],
    guid: episode.guid,
    imageURL: episode.image,
    itunesEpisode: episode.podcastEpisode?.number || episode.itunesEpisode,
    itunesEpisodeType: episode.itunesEpisodeType,
    itunesSeason: episode.podcastSeason?.number || episode.itunesSeason,
    link: episode.link,
    pubDate: episode.pubDate,
    socialInteraction: episode.podcastSocialInteraction ?? [],
    soundbite: episode.podcastSoundbites ?? [],
    subtitle: episode.subtitle,
    summary: getLongerSummary(episode.content, episode.description),
    title: episode.title,
    transcript: episode.podcastTranscripts ?? [],
    value: episode.value ? [valueCompat(episode.value)] : []
  } as ParsedEpisode
}

// TODO: there is duplication here with episodeCompat...can we reuse?
const liveItemCompatToEpisode = (liveItem: ExtendedPhase4PodcastLiveItem) => {
  const getChatEmbedUrlValue = (chat?: ExtendedChat) => {
    if (chat?.phase === 'pending' && chat.embedUrl) {
      return chat.embedUrl
    }
    // deprecated embed value
    else if (chat?.phase === '4' && chat.url) {
      return chat.url
    }
    return ''
  }

  return {
    chat: getChatEmbedUrlValue(liveItem.chat),
    end: liveItem.end,
    episode: episodeCompat({
      ...liveItem,
      contentLinks: liveItem.contentLinks, // TODO:
      duration: 0,
      explicit: false, // TODO: liveItem.explicit
      socialInteraction: [],
      soundbite: [],
      subtitle: '', // TODO: liveItem.subtitle
      summary: '', // TODO: liveItem.summary,
      transcript: []
    }),
    start: liveItem.start,
    status: liveItem.status?.toLowerCase()
  }
}

// Whichever summary is longer we are assuming is the "full summary" and
// assigning to the summary column.
const getLongerSummary = (content?: string, description?: string) => {
  const contentLength = content ? content.length : 0
  const descriptionLength = description ? description.length : 0
  const longerSummary = contentLength >= descriptionLength ? content : description
  return longerSummary
}
