import { lazy } from 'react'
import useVueInReact from './useVueInReact'
export default function lazyVueInReact (asyncImport) {
  return lazy(() => asyncImport().then((mod) => {
    return { default: useVueInReact(mod.default) }
  }))
}
