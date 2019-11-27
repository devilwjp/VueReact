import { lazy } from 'react'
import useVueInReact from './useVueInReact'
export default function lazyVue (asyncImport) {
  return lazy(() => asyncImport().then((mod) => {
    return { default: useVueInReact(mod.default) }
  }))
}
