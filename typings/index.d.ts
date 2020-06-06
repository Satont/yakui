import TwitchPrivateMessage from "twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage"

export type CommandPermission = 'viewers' | 'followers' | 'vips' | 'subscribers' | 'moderators' | 'broadcaster'

export interface Command {
  id?: number,
  name: string, 
  response?: string,
  visible?: true, 
  description?: string,
  aliases?: string[],
  cooldown?: number,
  permission?: CommandPermission,
  fnc?: function,
  enabled?: boolean,
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
  init?: () => void | Promise<void>,
  onStreamEnd?: () => void | Promise<void>,
  onStreamStart?: () => void | Promise<void>,
  onDonation?: (data) => void | Promise<void>,
  listenDbUpdates?: () => void | Promise<void>
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
}