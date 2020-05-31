import TwitchPrivateMessage from "twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage"

export interface Command {
  id?: number,
  name: string, 
  response?: string,
  visible?: true, 
  description?: string,
  aliases?: string[],
  cooldown?: number,
  fnc?: function
}

export interface System {
  parsers?: Array<{ 
    name?: string,
    fnc: function
  }>;
  commands?: Command[]
}