import Vue from 'vue'
import Component from 'vue-class-component'
import '../../plugins/axios'

@Component
export class Settings extends Vue {
  [x: string]: any

  async save() {
    const space = this.settings.space
    const data = Object.entries(this.settings)
      .filter(v => v[0] !== 'space')
      .map((item) => ({ space, name: item[0], value: item[1] }))

    await this.$axios.post('/settings', data)
  }

  async created() {
    const { data } = await this.$axios.get('/settings?space=' + this.settings.space)

    for (const item of data) {
      this.settings[item.name] = item.value
    }
  }
}

@Component
export class EnvChecker extends Vue {
  [x: string]: any

  isPublic() {
    return window.location.pathname.includes('public')
  }
}

