import { useReactInVue } from 'vuereact-combined'
export default function lazyReactInVue (asyncImport) {
  return () => asyncImport().then((mod) => {
    return useReactInVue(mod.default)
  })
}
