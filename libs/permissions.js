class Permissions {
  permissions = ['broadcaster', 'moderator', 'subscriber', 'vip', 'viewer']
  
  getUserPermission (badges) {
    if (!badges) return 'viewer'
    else if (typeof badges.broadcaster !== 'undefined') return 'broadcaster'
    else if (typeof badges.mod !== 'undefined') return 'moderator'
    else if (typeof badges.subscriber !== 'undefined') return 'subscriber'
    else if (typeof badges.vip !== 'undefined') return 'vip'
    else return 'viewer'
  }

  hasPerm (badges, commandPermission) {
    const userLevel = this.permissions.findIndex(o => o === this.getUserPermission(badges))
    const commandLevel = this.permissions.findIndex(o => o === commandPermission)
    if (userLevel <= commandLevel) return true
    else return false
  }

  async getDefaultCommandPermission (name) {
    const command = await global.db('systems.defaultcommands').select('*').where('name', name)
    if (!command.length) throw new Error(`Command ${name} not found`)
    return command[0].permission
  }
}

module.exports = new Permissions()
