const { getCommandPermission } = require('../libs/commons')

module.exports = {
  name: 'title',
  visible: false,
  permission: getCommandPermission('title').then(o => { return o }),
  run(message, userstate) {

  }
}