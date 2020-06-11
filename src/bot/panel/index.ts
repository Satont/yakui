import express, { Request, Response } from 'express'
import bodyparser from 'body-parser'
import history from 'connect-history-api-fallback'
import { resolve } from 'path'
import http from 'http'

import v1 from './routes/api/v1'
import { info } from '@bot/libs/logger'
import twitch from './routes/twitch'
import { validate, refresh } from './helpers/oauth'

const PORT = process.env.PORT || 3000

const app = express()

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json())
app.use('/twitch', twitch)
app.use('/static', express.static(resolve(process.cwd(), 'public', 'dest')))

app.get('/login', (req, res) => {
  res.sendFile(resolve(process.cwd(), 'public', 'login.html'))
})
app.get('/oauth', (req, res) => {
  res.sendFile(resolve(process.cwd(), 'public', 'oauth.html'))
})
app.get('/oauth/validate', validate)
app.get('/oauth/refresh', refresh)

app.get('/', (req, res) => {
  res.sendFile(resolve(process.cwd(), 'public', 'index.html'))
})

app.get('/public', (req, res) => {
  res.send('This is feature public page.')
})

app.use(history({
  index: '/',
  htmlAcceptHeaders: ['text/html', 'application/xhtml+xml']
}))
app.use('/api/v1', v1)

app.use((err, req: Request, res: Response, next) => {
  console.log(err)
  if (err['errors'] && !res.headersSent) {
    return res.status(400).send(err['errors'])
  }
  else if (!res.headersSent) {
    res.status(500).send(err)
  }
  else next()
})

const server = http.createServer(app).listen(PORT, () => {
  info(`PANEL: Server initiliazed on ${PORT}`)
})

process.on('SIGTERM', () => server.close())
