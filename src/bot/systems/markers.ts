import humanizeDuration from 'humanize-duration'
import moment from 'moment'
import 'moment-precise-range-plugin'

import { System, Command, CommandOptions, MarkerInList } from '@src/typings'
import tmi from '@bot/libs/tmi'
import { error } from '@bot/libs/logger'
import { CommandPermission } from '../entities/Command'

export default new class Markers implements System {
  commands: Command[] = [
    {
      name: 'marker add',
      aliases: ['highlight', 'addMarker', 'newMarker', 'marker new', 'new marker', 'marker'],
      permission: CommandPermission.MODERATORS,
      description: 'Create new stream marker',
      visible: false,
      fnc: this.addMarker,
    },
  ]

  async addMarker(opts: CommandOptions) {
    try {
      const marker = await tmi.clients.bot.helix.streams.createStreamMarker(tmi.channel?.id, opts.argument)
      const timestamp = humanizeDuration(marker.positionInSeconds * 1000, { language: 'en' })

      return `$sender ✅ marker was created on ${timestamp} time.`
    } catch (e) {
      error(e)
      return `$sender seems like i can't create marker. You need to be sure VODs are enabled, stream is online, and bot have access to create markers (editor role).`
    }
  }

  async getList(): Promise<Array<MarkerInList>> {
    const result: MarkerInList[] = []
    const markers = await tmi.clients.bot.helix.streams.getStreamMarkersForUser(tmi.channel?.id)

    for (const marker of markers.data) {
      const video = await marker.getVideo()
      const timestamp = moment.preciseDiff(moment.utc(video.creationDate), moment.utc(marker.creationDate), true)

      result.push({
        date: new Date(marker.creationDate).toISOString(),
        url: `${video.url}?t=${timestamp.hours}h${timestamp.minutes}m${timestamp.seconds}s`,
        preview: video.thumbnailUrl,
        description: marker.description,
      })
    }

    return result.reverse()
  }
}
