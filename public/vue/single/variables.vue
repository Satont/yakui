<template>
  <table class="table table-dark table-sm">
    <thead>
      <tr>
        <th colspan="2">{{ title }}:</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>$sender</td>
        <td>Sender name</td>
      </tr>
      <tr>
        <td>$uptime</td>
        <td>Uptime of stream</td>
      </tr>
      <tr>
        <td>$param</td>
        <td>Thats what user typed</td>
      </tr>
      <tr>
        <td>$np</td>
        <td>List of notableplayers</td>
      </tr>
      <tr>
        <td>$lastgame</td>
        <td>Players from last game</td>
      </tr>
      <tr>
        <td>$gammedals</td>
        <td>Medals in current game</td>
      </tr>
      <tr>
        <td>$addacc</td>
        <td>Just set command response as <b>$addacc</b>. Then use this command like <b>!command id</b>, where id is dota id</td>
      </tr>
      <tr>
        <td>$delacc</td>
        <td>Just set command response as <b>$addacc</b>. Then use this command like <b>!command id</b>, where id is dota id</td>
      </tr>
      <tr>
        <td>$listacc</td>
        <td>List of linked accounts</td>
      </tr>
      <tr>
        <td>$medal</td>
        <td>Highest medal of accounts what linked to channel</td>
      </tr>
      <tr>
        <td>$score</td>
        <td>Score per stream</td>
      </tr>
      <tr>
        <td>$followtime</td>
        <td>User followtime</td>
      </tr>
      <tr>
        <td>(random.0-99999)</td>
        <td>Random beetwen some numbers</td>
      </tr>
      <tr>
        <td>(random.viewer)</td>
        <td>Choose random viewer from chat</td>
      </tr>
      <tr>
        <td>$subs</td>
        <td>Subs count on channel</td>
      </tr>
      <tr>
        <td>$stream_viewers</td>
        <td>Current stream viewers</td>
      </tr>
      <tr>
        <td>$stream_game</td>
        <td>Current stream game</td>
      </tr>
      <tr>
        <td>$stream_title</td>
        <td>Current stream title</td>
      </tr>
      <tr>
        <td>$channel_views</td>
        <td>Views of channel</td>
      </tr>
      <tr>
        <td>$channel_followers</td>
        <td>Followers of channel</td>
      </tr>
      <tr>
        <td>$commands</td>
        <td>List of commands</td>
      </tr>
      <tr>
        <td>$commands</td>
        <td>List of variables</td>
      </tr>
      <tr>
        <td>$latestSub</td>
        <td>Nickname of latest subscriber</td>
      </tr>
      <tr>
        <td>$latestReSub</td>
        <td>Nickname of latest resubscriber</td>
      </tr>
      <tr>
        <td>$messages</td>
        <td>User messages</td>
      </tr>
      <tr>
        <td>$points</td>
        <td>User points</td>
      </tr>
      <tr>
        <td>$pointsName</td>
        <td>Name of points</td>
      </tr>
      <tr>
        <td>$watched</td>
        <td>User watched time</td>
      </tr>
      <tr>
        <td>$bits</td>
        <td>User bits donate amout</td>
      </tr>
      <tr>
        <td>$tips</td>
        <td>User tips donate amount</td>
      </tr>
      <tr>
        <td>$top_watched</td>
        <td>Top 10 users by watched time</td>
      </tr>
      <tr>
        <td>$top_points</td>
        <td>Top 10 users by points</td>
      </tr>
      <tr>
        <td>$top_messages</td>
        <td>Top 10 users by messages</td>
      </tr>
      <tr>
        <td>$top_tips</td>
        <td>Top 10 users by tips</td>
      </tr>
      <tr>
        <td>$top_bits</td>
        <td>Top 10 users by bits</td>
      </tr>
      <tr>
        <td>$song?vk dj lastfm da</td>
        <td>Use it like: $song?vk=123&dj=1231&lastfm=nickname&da=stray228. Where <b>da</b> = donationalerts</td>
      </tr>
      <tr>
        <td>(api|link)</td>
        <td>Make request to some api (JSON), if api response is string, then use (api._response)</td>
      </tr>
      <tr>
        <td>(eval js)</td>
        <td>Run javascript in command. Must have <b>return</b> for this. Example: (eval const ranks = ['Herald', 'Crusader']; return _.sample(ranks);). Avaliable variables: username, displayname, _ = lodash, axios, user (object of user from db); Avaliable functions: say(msg), timeout(username, 600)</td>
      </tr>
      <tr v-for="(variable, index) in variables" :key="index">
        <td>$_{{ variable.name }}</td>
        <td>{{ variable.value }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  data: function() {
    return {
      title: "Variables list",
      variables: null
    };
  },
  mounted() {
    let self = this;
    this.$socket.emit('list.variables', null, (err, list) => this.variables = list)
  }
};
</script>