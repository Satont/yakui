import express, { Request, Response } from 'express'
import bodyparser from 'body-parser'
import history from 'connect-history-api-fallback'
import { resolve } from 'path'
import http from 'http'

import v1 from './routes/api/v1'
import { info } from '@bot/libs/logger'
import twitch from './routes/twitch'
import Authorization from '@bot/systems/authorization'

const PORT = process.env.PORT || 3000

export const app = express()

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
app.get('/oauth/validate', (req, res) => Authorization.validate(req, res))
app.get('/oauth/refresh',  (req, res) => Authorization.refresh(req, res))

app.get('/overlay/:overlay', (req, res) => {
  res.sendFile(resolve(process.cwd(), 'public', 'overlays.html'))
})

app.get('/overlay/:overlay/:id', (req, res) => {
  res.sendFile(resolve(process.cwd(), 'public', 'overlays.html'))
})

app.get('/public', (req, res) => {
  res.sendFile(resolve(process.cwd(), 'public', 'public.html'))
})

app.use('/api/v1', v1)

app.use(history({
  index: '/',
  htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
}))

app.get('/', (req, res) => {
  res.sendFile(resolve(process.cwd(), 'public', 'panel.html'))
})

app.use((err, req: Request, res: Response, next) => {
  console.log(err)
  if (err['errors'] && !res.headersSent) {
    return res.status(400).send({ code: 'validation_error', message: 'Error on validation.', data: err['errors'] })
  }
  else if (!res.headersSent) {
    res.status(500).send(err)
  }
  else next()
})

export const server = http.createServer(app).listen(PORT, () => {
  info(`PANEL: Server initiliazed on ${PORT}`)
})

process.on('SIGTERM', () => server.close())
