import { resolve } from 'path'
import { promises } from 'fs'

export default async function* getFiles(dir: string) {
  const dirents = await promises.readdir(dir, { withFileTypes: true })
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name)
    if (dirent.isDirectory()) {
      yield* getFiles(res)
    } else {
      yield res
    }
  }
}