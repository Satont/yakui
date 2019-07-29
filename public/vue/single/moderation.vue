<template>
  <div>
    <button
      type="button"
      v-if="main.enabled === true"
      class="btn btn-block btn-sm btn-success"
      @click="switchEnabled"
    >Enabled</button>
    <button
      type="button"
      v-else
      class="btn btn-block btn-sm btn-danger"
      @click="switchEnabled"
    >Disabled</button>
    <button
      type="button"
      class="btn btn-block btn-sm btn-info"
      @click="save"
      style="margin-top: 5px;"
    >Save</button>
    <br>
    <div class="row cards">
      <!-- черный список -->
      <div class="col-md-6">
        <div class="card bg-dark">
          <div class="card-header">Blacklist</div>
          <center style="padding-top: 15px;"><span>One record per line</span></center>
          <div class="card-body">
            <textarea type="text" class="form-control" v-model.trim="blacklist.settings.list"></textarea>
          </div>
        </div>
      </div>
      <!-- черный список -->
      <!-- ссылки -->
      <div class="col-md-6">
        <div class="card bg-dark">
          <div class="card-header">Links</div>
          <div class="card-body">
            <div class="btn-group btn-group-sm d-flex">
              <button
                type="button"
                class="btn btn-sm w-100"
                v-bind:class="{ 'btn-success': links.enabled, 'btn-danger': !links.enabled }"
                @click="links.enabled = !links.enabled"
              >
                <span v-show="links.enabled">Enabled</span>
                <span v-show="!links.enabled">Disabled</span>
              </button>
              <button
                type="button"
                class="btn w-100"
                v-bind:class="{ 'btn-success': links.settings.moderateSubscribers, 'btn-danger': !links.settings.moderateSubscribers }"
                @click="links.settings.moderateSubscribers = !links.settings.moderateSubscribers"
              >
                <span v-show="links.settings.moderateSubscribers">Moderate subscribers</span>
                <span v-show="!links.settings.moderateSubscribers">Moderate subscribers</span>
              </button>
            </div>

            <div class="input-group input-group-sm mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text" id="inputGroup-sizing-sm">Timeout length</span>
              </div>
              <input type="number" class="form-control" v-model.number="links.settings.timeout">
            </div>
          </div>
        </div>
      </div>
      <!-- ссылки -->
      <!-- символы -->
      <div class="col-md-6">
        <div class="card bg-dark">
          <div class="card-header">Symbols</div>
          <div class="card-body">
            <div class="btn-group btn-group-sm d-flex">
              <button
                type="button"
                class="btn btn-sm w-100"
                v-bind:class="{ 'btn-success': symbols.enabled, 'btn-danger': !symbols.enabled }"
                @click="symbols.enabled = !symbols.enabled"
              >
                <span v-show="symbols.enabled">Enabled</span>
                <span v-show="!symbols.enabled">Disabled</span>
              </button>
              <button
                type="button"
                class="btn w-100"
                v-bind:class="{ 'btn-success': symbols.settings.moderateSubscribers, 'btn-danger': !symbols.settings.moderateSubscribers }"
                @click="symbols.settings.moderateSubscribers = !symbols.settings.moderateSubscribers"
              >
                <span v-show="symbols.settings.moderateSubscribers">Moderate subscribers</span>
                <span v-show="!symbols.settings.moderateSubscribers">Moderate subscribers</span>
              </button>
            </div>
            <div class="input-group input-group-sm mb-3">
              <div class="input-group-prepend">
                <span
                  class="input-group-text"
                  id="inputGroup-sizing-sm"
                >Message length for trigger</span>
              </div>
              <input type="number" v-model.number="symbols.settings.triggerLength" class="form-control">
            </div>
            <div class="input-group input-group-sm mb-3">
              <div class="input-group-prepend">
                <span
                  class="input-group-text"
                  id="inputGroup-sizing-sm"
                >Max symbols (%)</span>
              </div>
              <input type="number" class="form-control" v-model.number="symbols.settings.maxSymbolsPercent">
            </div>
            <div class="input-group input-group-sm mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text" id="inputGroup-sizing-sm">Timeout length</span>
              </div>
              <input type="number" class="form-control" v-model.number="symbols.settings.timeout">
            </div>
          </div>
        </div>
      </div>
      <!-- символы -->
      <!-- длинные сообщения -->
      <div class="col-md-6">
        <div class="card bg-dark">
          <div class="card-header">Long messages</div>
          <div class="card-body">
            <div class="btn-group btn-group-sm d-flex">
              <button
                type="button"
                class="btn btn-sm w-100"
                v-bind:class="{ 'btn-success': longMessage.enabled, 'btn-danger': !longMessage.enabled }"
                @click="longMessage.enabled = !longMessage.enabled"
              >
                <span v-show="longMessage.enabled">Enabled</span>
                <span v-show="!longMessage.enabled">Disabled</span>
              </button>
              <button
                type="button"
                class="btn w-100"
                v-bind:class="{ 'btn-success': longMessage.settings.moderateSubscribers, 'btn-danger': !longMessage.settings.moderateSubscribers }"
                @click="longMessage.settings.moderateSubscribers = !longMessage.settings.moderateSubscribers"
              >
                <span v-show="longMessage.settings.moderateSubscribers">Moderate subscribers</span>
                <span v-show="!longMessage.settings.moderateSubscribers">Moderate subscribers</span>
              </button>
            </div>
            <div class="input-group input-group-sm mb-3">
              <div class="input-group-prepend">
                <span
                  class="input-group-text"
                  id="inputGroup-sizing-sm"
                >Length of message for trigger</span>
              </div>
              <input type="number" class="form-control" v-model.number="longMessage.settings.triggerLength">
            </div>
            <div class="input-group input-group-sm mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text" id="inputGroup-sizing-sm">Timeout length</span>
              </div>
              <input type="number" class="form-control" v-model.number="longMessage.settings.timeout">
            </div>
          </div>
        </div>
      </div>
      <!-- длинные сообщения -->
      <!-- капс -->
      <div class="col-md-6">
        <div class="card bg-dark">
          <div class="card-header">Caps</div>
          <div class="card-body">
            <div class="btn-group btn-group-sm d-flex">
              <button
                type="button"
                class="btn btn-sm w-100"
                v-bind:class="{ 'btn-success': caps.enabled, 'btn-danger': !caps.enabled }"
                @click="caps.enabled = !caps.enabled"
              >
                <span v-show="caps.enabled">Enabled</span>
                <span v-show="!caps.enabled">Disabled</span>
              </button>
              <button
                type="button"
                class="btn w-100"
                v-bind:class="{ 'btn-success': caps.settings.moderateSubscribers, 'btn-danger': !caps.settings.moderateSubscribers }"
                @click="caps.settings.moderateSubscribers = !caps.settings.moderateSubscribers"
              >
                <span v-show="caps.settings.moderateSubscribers">Moderate subscribers</span>
                <span v-show="!caps.settings.moderateSubscribers">Moderate subscribers</span>
              </button>
            </div>
            <div class="input-group input-group-sm mb-3">
              <div class="input-group-prepend">
                <span
                  class="input-group-text"
                  id="inputGroup-sizing-sm"
                >Length of message for trigger</span>
              </div>
              <input type="number" class="form-control" v-model.number="caps.settings.triggerLength">
            </div>
            <div class="input-group input-group-sm mb-3">
              <div class="input-group-prepend">
                <span
                  class="input-group-text"
                  id="inputGroup-sizing-sm"
                >Max caps %</span>
              </div>
              <input type="number" class="form-control" v-model.number="caps.settings.maxCapsPercent">
            </div>
            <div class="input-group input-group-sm mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text" id="inputGroup-sizing-sm">Timeout length</span>
              </div>
              <input type="number" class="form-control" v-model.number="caps.settings.timeout">
            </div>
          </div>
        </div>
      </div>
      <!-- капс -->
      <!-- Цветные сообщения -->
      <div class="col-md-6">
        <div class="card bg-dark">
          <div class="card-header">Color (/me)</div>
          <div class="card-body">
            <div class="btn-group btn-group-sm d-flex">
              <button
                type="button"
                class="btn btn-sm w-100"
                v-bind:class="{ 'btn-success': color.enabled, 'btn-danger': !color.enabled }"
                @click="color.enabled = !color.enabled"
              >
                <span v-show="color.enabled">Enabled</span>
                <span v-show="!color.enabled">Disabled</span>
              </button>
              <button
                type="button"
                class="btn w-100"
                v-bind:class="{ 'btn-success': color.settings.moderateSubscribers, 'btn-danger': !color.settings.moderateSubscribers }"
                @click="color.settings.moderateSubscribers = !color.settings.moderateSubscribers"
              >
                <span v-show="color.settings.moderateSubscribers">Moderate subscribers</span>
                <span v-show="!color.settings.moderateSubscribers">Moderate subscribers</span>
              </button>
            </div>

            <div class="input-group input-group-sm mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text" id="inputGroup-sizing-sm">Timeout length</span>
              </div>
              <input type="number" class="form-control" v-model.number="color.settings.timeout">
            </div>
          </div>
        </div>
      </div>
      <!-- Цветные сообщения -->
      <!-- Спам смайлами -->
      <div class="col-md-6">
        <div class="card bg-dark">
          <div class="card-header">Emotes spam</div>
          <div class="card-body">
            <div class="btn-group btn-group-sm d-flex">
              <button
                type="button"
                class="btn btn-sm w-100"
                v-bind:class="{ 'btn-success': emotes.enabled, 'btn-danger': !emotes.enabled }"
                @click="emotes.enabled = !emotes.enabled"
              >
                <span v-show="emotes.enabled">Enabled</span>
                <span v-show="!emotes.enabled">Disabled</span>
              </button>
              <button
                type="button"
                class="btn w-100"
                v-bind:class="{ 'btn-success': emotes.settings.moderateSubscribers, 'btn-danger': !emotes.settings.moderateSubscribers }"
                @click="emotes.settings.moderateSubscribers = !emotes.settings.moderateSubscribers"
              >
                <span v-show="emotes.settings.moderateSubscribers">Moderate subscribers</span>
                <span v-show="!emotes.settings.moderateSubscribers">Moderate subscribers</span>
              </button>
            </div>
            <div class="input-group input-group-sm mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text" id="inputGroup-sizing-sm">Max emotes</span>
              </div>
              <input type="number" class="form-control" v-model.number="emotes.settings.maxCount">
            </div>
            <div class="input-group input-group-sm mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text" id="inputGroup-sizing-sm">Timeout length</span>
              </div>
              <input type="number" class="form-control" v-model.number="emotes.settings.timeout">
            </div>
          </div>
        </div>
      </div>
      <!-- Спам смайлами -->
    </div>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      blacklist: {
        enabled: true,
        settings: {
          list: ''
        }
      },
      main: {
        enabled: false,
        settings: {
          salt: 123
        }
      },
      links: {
        enabled: true,
        settings: {
          moderateSubscribers: true,
          timeout: 600
        }
      },
      symbols: {
        enabled: true,
        settings: {
          moderateSubscribers: true,
          triggerLength: 15,
          maxSymbolsPercent: 50,
          timeout: 600
        }
      },
      longMessage: {
        enabled: true,
        settings: {
          moderateSubscribers: true,
          triggerLength: 300,
          timeout: 600
        }
       },
      caps: {
        enabled: true,
        settings: {
          moderateSubscribers: true,
          triggerLength: 10,
          maxCapsPercent: 50,
          timeout: 600
        }
      },
      color: {
        enabled: true,
        settings: {
          moderateSubscribers: true,
          timeout: 600
        }
      },
      emotes: {
        enabled: true,
        settings: {
          moderateSubscribers: true,
          maxCount: 6,
          timeout: 600
        }
      }
    };
  },
  methods: {
    switchEnabled() {
      this.main.enabled = this.main.enabled ? false : true
    },
    save() {
      let data = this.$data
      data.blacklist.settings.list = data.blacklist.settings.list.split('\n')
      this.$socket.emit('moderation.update', data)
    }
  },
  mounted() {
    this.$socket.emit('settings.moderation', null, (err, list) => {
      console.log(list)
      this.blacklist = list.find(o => o.name === 'blacklist')
      this.blacklist.settings.list = list.find(o => o.name === 'blacklist').settings.list.join('\n')
      this.main = list.find(o => o.name === 'main')
      this.links = list.find(o => o.name === 'links')
      this.symbols = list.find(o => o.name === 'symbols')
      this.longMessage = list.find(o => o.name === 'longMessage')
      this.caps = list.find(o => o.name === 'caps')
      this.color = list.find(o => o.name === 'color')
      this.emotes = list.find(o => o.name === 'emotes')
    })
  }
};
</script>