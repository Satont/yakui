import { TwitchPrivateMessage } from "twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage"
import { IWebHookUserFollow, IWebHookModeratorAdd, IWebHookModeratorRemove, INewSubscriber, INewResubscriber } from "./events"
import { PubSubRedemptionMessage } from "twitch-pubsub-client/lib"

export type CommandPermission = 'viewers' | 'followers' | 'vips' | 'subscribers' | 'moderators' | 'broadcaster'
export type HostType = { viewers: number, username: string }

export interface Command {
  id?: number,
  name: string,
  response?: string,
  visible?: boolean,
  description?: string,
  aliases?: string[],
  cooldown?: number,
  permission?: CommandPermission,
  fnc?: function,
  enabled?: boolean,
  price?: number,
  type?: 'custom' | 'default'
}

export interface CommandOptions {
  message: string,
  raw: TwitchPrivateMessage
  command: Command,
  argument: string,
}

export interface ParserOptions {
  message: string,
  raw: TwitchPrivateMessage
}

export interface System {
  parsers?: Array<{
    name?: string,
    fnc: function
  }>;
  commands?: Command[],
  socket?: SocketIO.Namespace,
  init?: () => void | Promise<void>,
  onStreamEnd?: () => void | Promise<void>,
  onStreamStart?: () => void | Promise<void>,
  onDonation?: (data: DonationData) => void | Promise<void>,
  onHosting?: (data: HostType) => void | Promise<void>,
  onHosted?: (data: HostType) => void | Promise<void>,
  onRaided?: (data: HostType) => void | Promise<void>,
  listenDbUpdates?: () => void | Promise<void>,
  sockets?: (socket: SocketIO.Socket) => void | Promise<void>,
  onAddModerator?: (data: IWebHookModeratorAdd) => void | Promise<void>,
  onRemoveModerator?: (data: IWebHookModeratorRemove) => void | Promise<void>,
  onUserFollow?: (data: IWebHookUserFollow) => void | Promise<void>,
  onStreamChange?: (data: IWebHookStreamChanged) => void | Promise<void>,
  onSubscribe?: (data: INewSubscribe) => void | Promise<void>,
  onReSubscribe?: (data: INewResubscriber) => void | Promise<void>
  onRedemption?: (data: PubSubRedemptionMessage) => void | Promise<void>
  onMessageHighlight?: (data: TwitchPrivateMessage) => void | Promise<void>
}

export interface Integration extends System {

}

export interface UserPermissions {
  broadcaster: boolean,
  moderators: boolean,
  vips: boolean,
  subscribers: boolean,
  viewers: boolean,
}
export type DonationData = {
  userId?: number,
  username: string,
  amount: number,
  message: string,
  currency: string,
  inMainCurrencyAmount: number,
  timestamp?: number,
}

export type MarkerInList = {
  url: string,
  preview: string,
  description: string,
  date: any,
}
