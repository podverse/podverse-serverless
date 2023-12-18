import { PartytimeService } from 'podverse-parser'
import { config } from '../config'

export const partytimeInstance = new PartytimeService({
  userAgent: config.userAgent
})
