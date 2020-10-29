import { get } from 'lodash'

export default function (path: string, opts: Record<string, any> = {}) {
  const lang = this.$store.state.metaData.lang
  let toTranslate: string | null = get(lang, path, null)
  if (!toTranslate) return lang.lang.notFound.replace('$path', path)
  
  for (const variable of Object.entries(opts)) {
    toTranslate = toTranslate.replace(new RegExp(`$${variable[0]}`), variable[1])
  }

  return toTranslate
}