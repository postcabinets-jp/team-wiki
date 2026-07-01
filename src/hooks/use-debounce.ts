import { useEffect, DependencyList } from 'react'

export function useDebounce(fn: () => void, delay: number, deps: DependencyList) {
  useEffect(() => {
    const timer = setTimeout(fn, delay)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay])
}
