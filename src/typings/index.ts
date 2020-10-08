import { TwitchPrivateMessage } from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import { 
  IWebHookUserFollow,
  IWebHookModeratorAdd,
  IWebHookModeratorRemove,
  INewSubscriber,
  INewResubscriber,
  IWebHookStreamChanged,
} from './events'
import { PubSubRedemptionMessage } from 'twitch-pubsub-client/lib'
import { File } from '../bot/entities/File'
import { CommandPermission } from '@bot/entities/Command'

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
  fnc?(opt: CommandOptions): any | Promise<any>,
  enabled?: boolean,
  price?: number,
  type?: 'custom' | 'default',
  sound_volume?: number,
  sound_file?: File | number,
  system?: System,
  usage?: number
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
    fnc(opt: ParserOptions): any | Promise<any>
  }>;
  commands?: Command[],
  socket?: SocketIO.Namespace,
  clients?: SocketIO.Socket[],
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
  onSubscribe?: (data: INewSubscriber) => void | Promise<void>,
  onReSubscribe?: (data: INewResubscriber) => void | Promise<void>
  onRedemption?: (data: PubSubRedemptionMessage) => void | Promise<void>
  onMessageHighlight?: (data: TwitchPrivateMessage) => void | Promise<void>
}

export type Integration = System

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