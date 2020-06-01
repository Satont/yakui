import tmi from "./tmi"

export default new class Cache {
  streamMetaData: {
    viewers: number,
    game: string,
    title: string,
    startedAt: Date
  } = {
    viewers: 0,
    game: 'No data',
    title: 'No data',
    startedAt: null
  }

  channelMetaData: {
    views: number
  } = {
    views: 0
  }

  constructor() {
    this.getStreamData()
    this.getChannelData()
  }

  private async getStreamData() {
    const data = await tmi?.clients?.bot?.helix.streams.getStreamByUserId(tmi.channel.id)
 
    if (data) {
      this.streamMetaData = {
        viewers: data.viewers,
        game: (await data.getGame())?.name ?? 'No data',
        title: data.title ?? 'No data',
        startedAt: data.startDate
      }
    }

    setTimeout(() => this.getStreamData(), 1 * 60 * 1000)
  }

  private async getChannelData() {
    const data = await tmi?.clients?.bot?.helix.users.getUserById(tmi.channel.id)

    this.channelMetaData = {
      views: data?.views ?? 0
    }

    setTimeout(() => this.getChannelData(), 1 * 60 * 1000)
  }
}
