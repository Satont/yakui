interface IWebHookModeratorEvent {
  event_timestamp: string,
  event_type: string,
}

export interface IWebHookModeratorRemove extends IWebHookModeratorEvent {
  event_data: {
    broadcaster_id: string,
    broadcaster_name: string,
    user_id: string,
    user_name: string,
  }
  event_type: 'moderation.moderator.remove'
}

export interface IWebHookModeratorAdd extends IWebHookModeratorEvent {
  event_data: {
    broadcaster_id: string,
    broadcaster_name: string,
    user_id: string,
    user_name: string,
  }
  event_type: 'moderation.moderator.add'
}

export interface IWebHookUserFollow {
  from_id: string,
  from_name: string,
  to_id: string,
  to_name: string,
  followed_at: string
}

export interface IWebHookStreamChanged {
  id: string,
  user_id: string,
  user_name: string,
  game_id: string | null,
  community_ids: string[],
  title: string | null,
  viewer_count: number,
  started_at: string,
  language: string,
  thumbnail_url: string
}