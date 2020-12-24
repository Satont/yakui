<template>
  <div>
    <b-form>
      <b-form-group label="Channel" label-for="channel">
        <b-form-input size="sm" id="channel" v-model="settings.channel" type="text" required placeholder="Enter channel name"></b-form-input>
      </b-form-group>

      <b-form-group label="Client id" label-for="clientId">
        <b-form-input size="sm" id="clientId" v-model="settings.clientId" type="text" required placeholder="Enter clientId"></b-form-input>
      </b-form-group>

      <b-form-group label="Client secret" label-for="clientId">
        <b-form-input size="sm" id="clientId" v-model="settings.clientSecret" type="text" required placeholder="Enter clientSecret"></b-form-input>
      </b-form-group>

      <b-form-group label="Bot">
        <b-btn class="mt-1" block size="sm" variant="info" :href="generateAuthLink('bot')" target="_blank">Generate bot tokens</b-btn>
      </b-form-group>

       <b-form-group label="Broadcaster">
        <b-btn class="mt-1" block size="sm" variant="info" :href="generateAuthLink('broadcaster')" target="_blank">Generate broadcaster tokens</b-btn>
      </b-form-group>

      <b-button class="btn-block" @click="save()" variant="primary">Save</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import querystring from 'querystring'
import { Vue, Component } from 'vue-property-decorator'
import { Settings } from '../helpers/mixins'

@Component({
  mixins: [Settings]
})
export default class Oauth extends Vue {
  private readonly requestScopes = ['user_read', 'user_blocks_edit', 'user_blocks_read', 'user_follows_edit', 'channel_read', 'channel_editor', 'channel_commercial', 'channel_stream', 'channel_subscriptions', 'user_subscriptions', 'channel_check_subscription', 'channel_feed_read', 'channel_feed_edit', 'collections_edit', 'communities_edit', 'communities_moderate', 'viewing_activity_read', 'openid', 'analytics:read:extensions', 'user:edit', 'user:read:email', 'clips:edit', 'bits:read', 'analytics:read:games', 'user:edit:broadcast', 'user:read:broadcast', 'chat:read', 'chat:edit', 'channel:moderate', 'channel:read:subscriptions', 'whispers:read', 'whispers:edit', 'moderation:read', 'channel:read:redemptions', 'channel:edit:commercial', 'channel:read:hype_train', 'channel:read:stream_key', 'channel:manage:extensions', 'channel:manage:broadcast', 'user:edit:follows', 'channel:manage:redemptions']

  settings = {
    space: 'oauth',
    channel: '',
    clientId: '',
    clientSecret: '',
  }

  private generateAuthLink(type: 'bot' | 'broadcaster') {
    const query = querystring.stringify({
      client_id: this.settings.clientId,
      redirect_uri: `${window.location.origin}/twitch/auth/callback`,
      state: type,
      response_type: 'code',
      scope: this.requestScopes.join(' '),
    })

    return `https://id.twitch.tv/oauth2/authorize?${query}`
  }
}
</script>
