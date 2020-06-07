import { loadedSystems } from './loader'
import { DonationData } from 'typings'
import { info, donate } from './logger'

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
