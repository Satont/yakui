import { TwitchPrivateMessage } from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage';

export interface INewSubscriber {
  isPrime: boolean;
  username: string;
  tier: string;
  message?: string;
}

export interface INewResubscriber extends INewSubscriber {
  months?: number;
  overallMonths?: number;
}

export interface IMessageHighLighted {
  msg: TwitchPrivateMessage;
}
