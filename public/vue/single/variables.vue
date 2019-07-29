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
        <td>$followtime</td>
        <td>User followtime</td>
      </tr>
      <tr>
        <td>$random(0-99999)</td>
        <td>Random beetwen some numbers</td>
      </tr>
      <tr>
        <td>$subs</td>
        <td>Subs count on channel</td>
      </tr>
      <tr>
        <td>$commands</td>
        <td>List of commands</td>
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
        <td>$song?vk dj lastfm da</td>
        <td>Use it like: $song?vk=123&dj=1231&lastfm=nickname&da=stray228. Where <b>da</b> = donationalerts</td>
      </tr>
      <tr>
        <td>(api|link)</td>
        <td>Make request to some api (JSON), if api response is string, then use (api._response)</td>
      </tr>
      <tr>
        <td>(eval js)</td>
        <td>Run javascript in command. Must have <b>return</b> for this. Example: (eval const ranks = ['Herald', 'Crusader']; return _.sample(ranks);). Avaliable variables: username, displayname, _ = lodash, axios; Avaliable functions: say(msg), timeout(username, 600)</td>
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