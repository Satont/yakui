import { resolve } from 'path'
import getFiles from '../commons/getFiles'

const loader = async () => {
  for await (const file of getFiles(resolve(__dirname, '..', 'systems'))) {
    const loadedFile = await import(resolve(__dirname, '..', 'systems', file))

    console.log(`System ${loadedFile.default.constructor.name.toUpperCase()} loaded`)
  }
}

loader()
