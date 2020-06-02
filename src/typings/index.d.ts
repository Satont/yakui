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

export interface System {
  parsers?: Array<{ 
    name?: string,
    fnc: function
  }>;
  commands?: Command[],
  init?: () => void | Promise<void>
}
