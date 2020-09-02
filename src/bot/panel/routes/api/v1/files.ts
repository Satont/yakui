import { Router } from 'express'
import File from '@bot/models/File'

const router = Router({ mergeParams: true })

router.get('/:id', async (req, res, next) => {
  try {
    const file: File = await File.findOne({ where: { id: req.params.id }})

    if (!file) return res.status(404).send({ code: '404', message: `File with id ${req.params.id} not found`, data: [] })
    const data = Buffer.from(file.data.split(',')[1], 'base64')

    res.writeHead(200, {
      'Content-Type': file.type,
      'Content-Length': data.length,
      'Cache-Control': 'public, max-age=31536000',
    })

    res.end(data)
  } catch (e) {
    next(e)
  }
})

export default router
