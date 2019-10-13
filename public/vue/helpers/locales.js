import { get } from 'lodash'

export default function translate(path, variables) {
  let query = get(window.locales, path, 'Not found')
  if (variables) {
    for (let variable of Object.entries(variables)) {
      const regexp = new RegExp(`{${variable[0]}}`, 'ig')
      query = query.replace(regexp, variables[variable[0]])
    }
  }
  if (query === 'Not found') console.error('Locale not found:', window.locales, path, variables)
  return query
}