import { PrivateMessage } from '@twurple/chat';
import { EventSubChannelFollowEvent, EventSubChannelModeratorEvent, EventSubChannelUpdateEvent } from '@twurple/eventsub';
import { PubSubRedemptionMessage } from '@twurple/pubsub';
import { DonationData, HostType } from 'typings';
import { INewResubscriber, INewSubscriber } from 'typings/events';
import { loadedSystems } from './loader';
import { donate, follow, highlight, hosted, hosting, info, moded, raided, redemption, resub, sub, unmoded } from './logger';

export const onStreamStart = () => {
  info(`TWITCH: Stream started`);
  for (const system of loadedSystems) {
    if (typeof system.onStreamStart === 'function') system.onStreamStart();
  }
};

export const onStreamEnd = () => {
  info(`TWITCH: Stream ended`);
  for (const system of loadedSystems) {
    if (typeof system.onStreamEnd === 'function') system.onStreamEnd();
  }
};

export const onDonation = (data: DonationData) => {
  donate(`username: ${data.username}, amount: ${data.amount}${data.currency}, message: ${data.message}`);

  for (const system of loadedSystems) {
    if (typeof system.onDonation === 'function') system.onDonation(data);
  }
};

export const onHosting = ({ username, viewers }: HostType) => {
  hosting(`${username}, ${viewers}`);

  for (const system of loadedSystems) {
    if (typeof system.onHosting === 'function') system.onHosting({ username, viewers });
  }
};

export const onHosted = ({ username, viewers }: HostType) => {
  hosted(`${username}, ${viewers}`);

  for (const system of loadedSystems) {
    if (typeof system.onHosted === 'function') system.onHosted({ username, viewers });
  }
};

export const onRaided = ({ username, viewers }: HostType) => {
  raided(`${username}, ${viewers}`);

  for (const system of loadedSystems) {
    if (typeof system.onRaided === 'function') system.onRaided({ username, viewers });
  }
};

export const onAddModerator = (data: EventSubChannelModeratorEvent) => {
  moded(data.userName);

  for (const system of loadedSystems) {
    if (typeof system.onAddModerator === 'function') system.onAddModerator(data);
  }
};

export const onRemoveModerator = (data: EventSubChannelModeratorEvent) => {
  unmoded(data.userName);

  for (const system of loadedSystems) {
    if (typeof system.onRemoveModerator === 'function') system.onRemoveModerator(data);
  }
};

export const onUserFollow = (data: EventSubChannelFollowEvent) => {
  follow(data.userName);

  for (const system of loadedSystems) {
    if (typeof system.onUserFollow === 'function') system.onUserFollow(data);
  }
};

export const onStreamChange = (data: EventSubChannelUpdateEvent) => {
  info(`STREAM CHANGED | TITLE: ${data.streamTitle} | GAME ${data.categoryName}`);

  for (const system of loadedSystems) {
    if (typeof system.onStreamChange === 'function') system.onStreamChange(data);
  }
};

export const onSubscribe = (data: INewSubscriber) => {
  sub(`${data.username}, tier: ${data.tier}`);

  for (const system of loadedSystems) {
    if (typeof system.onSubscribe === 'function') system.onSubscribe(data);
  }
};

export const onReSubscribe = (data: INewResubscriber) => {
  resub(`${data.username}, tier: ${data.tier}, months: ${data.months}, overallMonths: ${data.overallMonths}`);

  for (const system of loadedSystems) {
    if (typeof system.onReSubscribe === 'function') system.onReSubscribe(data);
  }
};

export const onRedemption = (data: PubSubRedemptionMessage) => {
  redemption(`${data.userName}, name: ${data.rewardTitle}, points: ${data.rewardCost}`);

  for (const system of loadedSystems) {
    if (typeof system.onRedemption === 'function') system.onRedemption(data);
  }
};

export const onMessageHighlight = (data: PrivateMessage) => {
  highlight(`${data.userInfo.userName}, message: ${data.content.value}`);

  for (const system of loadedSystems) {
    if (typeof system.onMessageHighlight === 'function') system.onMessageHighlight(data);
  }
};
