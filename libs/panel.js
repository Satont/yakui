const fastify = require('fastify')()
const path = require('path')
const PORT = process.env.PORT || process.env.PANEL_PORT // for heroku
const io = require('socket.io')(fastify.server)

fastify.register(require('fastify-basic-auth'), { validate, authenticate: true }).after(() => {
  fastify.addHook('preHandler', fastify.basicAuth)
})
fastify.register(require('fastify-static'), { root: path.join(__dirname, '../public'), prefix: '/public/' })

async function validate (username, password, request, reply) {
  if (username !== process.env.PANEL_USERNAME || password !== process.env.PANEL_PASSWORD) {
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

fastify.get('/', function (request, reply) {
  reply.sendFile('index.html')
})

// Run the server!
fastify.listen(PORT, '0.0.0.0', (err, address) => {
  if (err) throw err
  console.log(`server listening on ${address}`)
})

module.exports = { io, PORT }