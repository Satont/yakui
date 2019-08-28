const commons = require('../libs/commons')

class Events {
  systemsList = []
  events = []

  constructor() {
    this.loadEvents()
    this.loadSystems()
  }
  
  async loadEvents () {

  }
  async tip (username, count, currency, message) {
    for (let system of this.systemsList) {
      for (let event of system.events.onTip) {
        event['fnc'].apply(system, [username, count, currency, message])
      }
    }
  }
  async loadSystems () {
    for (let system of Object.entries(await commons.autoLoad('./systems/'))) {
      this.systemsList.push(system[1])
    }
  }
}

module.exports = new Events()