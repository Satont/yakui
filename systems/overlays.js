const { io } = require("../libs/panel")
const { prepareMessage } = require('./variables')

io.on('connection', function (socket) {
  socket.on('list.overlays', async (data, cb) => {
    let query = await global.db.select(`*`).from('systems.overlays')
    cb(null, query)
  })
  socket.on('create.overlay', async (data, cb) => {
    try {
      await global.db('systems.overlays').insert(data)
    } catch (e) {
      console.log(e)
    }
  })
  socket.on('delete.overlay', async (data, cb) => {
    try {
      await global.db('systems.overlays').where('id', data).delete()
    } catch (e) {
      console.log(e)
    }
  })
  socket.on('update.overlay', async (data, cb) => {
    let id = data.id
    delete data.id
    try {
      await global.db('systems.overlays').where('id', id).update(data)
    } catch (e) {
      console.log(e)
    }
  })
  socket.on('overlays.data', async (id, cb) => {
    if (!id.length) return cb('You should pass overlay id', null)
    let query = await global.db.select(`*`).from('systems.overlays').where('id', id)
    if (!query.length) return cb('No overlay with that id', null)
    let data = await prepareMessage(query[0].data, { 'display-name': 'overlay', overlay: true }, null)
    cb(null, { uptime: global.tmi.uptime, text: data })
  })
})