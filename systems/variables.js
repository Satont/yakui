const { io } = require("../libs/panel")

io.on('connection', function (socket) {
  socket.on('list.variables', async (data, cb) => {
    let query = await global.db.select(`*`).from('systems.variables')
    cb(null, query)
  })
  socket.on('create.variable', async (data, cb) => {
    try {
      await global.db('systems.variables').insert(data)
    } catch (e) {
      console.log(e)
    }
  })
  socket.on('delete.variable', async (data, cb) => {
    try {
      await global.db('systems.variables').where('name', data).delete()
    } catch (e) {
      console.log(e)
    }
  })
  socket.on('update.variable', async (data, cb) => {
    let name = data.currentname
    delete data.currentname
    try {
      await global.db('systems.variables').where('name', name).update(data)
    } catch (e) {
      console.log(e)
    }
  })
})