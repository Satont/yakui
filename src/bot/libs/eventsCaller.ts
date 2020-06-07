import { loadedSystems } from './loader'
import { DonationData, HostType } from 'typings'
import { info, donate, hosted, hosting, raided, moded, unmoded, follow } from './logger'
import { IWebHookModeratorAdd, IWebHookModeratorRemove, IWebHookUserFollow, IWebHookStreamChanged } from 'typings/webhooks'

export const onStreamStart = () => {
  info(`TWITCH: Stream started`)
  for (const system of loadedSystems) {
    if (typeof system.onStreamStart === 'function') system.onStreamStart()
  }
}

export const onStreamEnd = () => {
  info(`TWITCH: Stream ended`)
  for (const system of loadedSystems) {
    if (typeof system.onStreamEnd === 'function') system.onStreamEnd()
  }
}

export const onDonation = (data: DonationData) => {
  donate(`username: ${data.username}, amount: ${data.amount}${data.currency}, message: ${data.message}`)

  for (const system of loadedSystems) {
    if (typeof system.onDonation === 'function') system.onDonation(data)
  }
}

export const onHosting = ({ username, viewers }: HostType) => {
  hosting(`${username}, ${viewers}`)

  for (const system of loadedSystems) {
    if (typeof system.onHosting === 'function') system.onHosting({ username, viewers })
  }
}


export const onHosted = ({ username, viewers }: HostType) => {
  hosted(`${username}, ${viewers}`)

  for (const system of loadedSystems) {
    if (typeof system.onHosted === 'function') system.onHosted({ username, viewers })
  }
}

export const onRaided = ({ username, viewers }: HostType) => {
  raided(`${username}, ${viewers}`)

  for (const system of loadedSystems) {
    if (typeof system.onRaided === 'function') system.onRaided({ username, viewers })
  }
}

export const onAddModerator = (data: IWebHookModeratorAdd) => {
  moded(data.event_data.user_name)

  for (const system of loadedSystems) {
    if (typeof system.onAddModerator === 'function') system.onAddModerator(data)
  }
}

export const onRemoveModerator = (data: IWebHookModeratorRemove) => {
  unmoded(data.event_data.user_name)

  for (const system of loadedSystems) {
    if (typeof system.onRemoveModerator === 'function') system.onRemoveModerator(data)
  }
}

export const onUserFollow = (data: IWebHookUserFollow) => {
  follow(data.from_name)

  for (const system of loadedSystems) {
    if (typeof system.onUserFollow === 'function') system.onUserFollow(data)
  }
}

export const onStreamChange = (data: IWebHookStreamChanged) => {
  info(`STREAM CHANGED | TITLE: ${data.title} | GAME ${data.game_id}`)

  for (const system of loadedSystems) {
    if (typeof system.onStreamChange === 'function') system.onStreamChange(data)
  }
}

