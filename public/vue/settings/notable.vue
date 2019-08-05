<template>
<div>
  <center><h3>Notableplayers settings</h3></center>
  <button type="button" class="btn btn-block btn-sm" v-bind:class="{ 'btn-success': enabled, 'btn-danger': !enabled }"
  @click="enabled = !enabled">
    <span v-show="enabled">Enabled</span>
    <span v-show="!enabled">Disabled</span>
  </button>
  <button type="button" class="btn btn-block btn-sm btn-info" @click="save" style="margin-top: 5px;">Save</button>
  <br>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">Token</span>
    </div>
    <input class="form-control" v-model="token">
  </div>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">Notable text</span>
    </div>
    <input class="form-control" v-model="notable">
  </div>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">Last game text</span>
    </div>
    <input class="form-control" v-model="lastgametext">
  </div>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">Medals text</span>
    </div>
    <input class="form-control" v-model="medalstext">
  </div>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">Score text</span>
    </div>
    <input class="form-control" v-model="scoretext">
  </div>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">Game not found text</span>
    </div>
    <input class="form-control" v-model="gamenotfound">
  </div>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">No notable found text</span>
    </div>
    <input class="form-control" v-model="nonotable">
  </div>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">Was on text</span>
    </div>
    <input class="form-control" v-model="wason">
  </div>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">No players from last game text</span>
    </div>
    <input class="form-control" v-model="noplayersfromlastgame">
  </div>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">Stream offline text</span>
    </div>
    <input class="form-control" v-model="streamoffline">
  </div>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">Account added text</span>
    </div>
    <input class="form-control" v-model="accountadded">
  </div>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">Account text</span>
    </div>
    <input class="form-control" v-model="account">
  </div>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">Already linked text</span>
    </div>
    <input class="form-control" v-model="alreadylinked">
  </div>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">Account deleted text</span>
    </div>
    <input class="form-control" v-model="accountdeleted">
  </div>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">Account not linked text</span>
    </div>
    <input class="form-control" v-model="accountnotlinked">
  </div>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">No linked accs text</span>
    </div>
    <input class="form-control" v-model="nolinkedaccs">
  </div>
  
</div>
</template>

<script>
export default {
  data: function() {
    return {
      enabled: false, 
      token: null, 
      notable: '$gamemode ~$mmr mmr: $list',
      lastgametext: 'Players from past game: $list',
      medalstext: 'Medals in this game: $list',
      scoretext: 'Wins: $wins, Loses: $lose',
      gamenotfound: "Game wasn't found",
      nonotable: 'Notableplayers not found',
      wason: 'was on',
      noplayersfromlastgame: 'Not playing with anyone from last game',
      streamoffline: 'Stream is not live',
      accountadded: 'Account $id was successfuly added!',
      account: 'Account',
      alreadylinked: 'is already connected to channel',
      accountdeleted: 'Account $id was successfuly deleted!',
      accountnotlinked: 'is not linked to channel',
      nolinkedaccs: 'Here is no linked accs'
    };
  },
  mounted() {
    let self = this;
    this.$socket.emit('settings.notable', null, (err, list) => {
      for (const [key, value] of Object.entries(list.data)) {
        this[key] = value
      }
    })
  },
  methods: {
    save() {
      this.$socket.emit('update.settings.notable', this.$data)
    }
  }
};
</script>