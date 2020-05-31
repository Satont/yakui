import express, { Request, Response } from 'express'
import bodyparser from 'body-parser'
import { resolve } from 'path'

import v1 from './routes/api/v1'

const app = express()

app.use(bodyparser.json())
app.use('/static', express.static(resolve(process.cwd(), 'public', 'dest')))

app.get('/', (req, res) => {
  res.sendFile(resolve(process.cwd(), 'public', 'index.html'))
})


app.use('/api/v1', v1)

app.use((err, req: Request, res: Response, next) => {
  if (err['errors'] && !res.headersSent) return res.status(400).send(err['errors'])
  else if (!res.headersSent) {
    res.status(500).send(err)
  }
  else next()

  console.error(err)
})

app.listen(process.env.PORT || 3000, () => {
  console.info(`PANEL: initiliazed on ${process.env.PORT || 3000} port.`)
})
