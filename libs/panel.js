const fastify = require('fastify')()
const path = require('path')
const PORT = process.env.PORT || 3000 // for heroku
const io = require('socket.io')(fastify.server)
const { writeHeapSnapshot } = require('v8')

fastify.register(require('fastify-auth'))
fastify.register(require('fastify-basic-auth'), { validate, authenticate: true })
fastify.register(require('fastify-static'), { root: path.join(__dirname, '../public'), prefix: '/public/' })

async function validate (username, password, request, reply) {
  if (username !== process.env.PANEL_USERNAME || password !== process.env.PANEL_PASSWORD) {
    console.error(`Some user trying to login with wrong credentials: ${username}/${password}. Actual credentials: ${process.env.PANEL_USERNAME}/${process.env.PANEL_PASSWORD}`)
    return new Error('Not authed')
  }
}

fastify.setErrorHandler(function (err, req, reply) {
  if (err.statusCode === 401) {
    reply.code(401).send('You are not authed')
    return
  }
  reply.send(err)
})

fastify.after(() => {
  fastify.route({
    method: 'GET',
    url: '/',
    preHandler: fastify.auth([fastify.basicAuth]),
    handler: async (req, reply) => {
      reply.sendFile('index.html')
    }
  })
  fastify.route({
    method: 'GET',
    url: '/heapdump',
    preHandler: fastify.auth([fastify.basicAuth]),
    handler: async (req, reply) => {
      writeHeapSnapshot()
      reply.send('ok!')
    }
  })
})

fastify.get('/commands', function (request, reply) {
  reply.sendFile('commands.html')
})

fastify.get('/overlay', function (request, reply) {
  reply.sendFile('overlay.html')
})

// Run the server!
fastify.listen(PORT, '0.0.0.0', (err, address) => {
  if (err) throw err
  global.log.info(`server listening on ${address}`)
})

module.exports = { fastify, io, PORT }
