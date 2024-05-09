import { useState, useEffect, useCallback } from 'react'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import _ from 'lodash'

type UseFetchResponse<T> = {
  data: T | null
  error: Error | null
  loading: boolean
  refetch: () => void
}

const useFetch = <T>(
  url: string,
  options?: AxiosRequestConfig
): UseFetchResponse<T> => {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [fetchTrigger, setFetchTrigger] = useState<number>(0)

  const refetch = _.debounce(() => {
    setFetchTrigger(Date.now())
  }, 700)

  const fetchData = useCallback(
    async (abortController: AbortController) => {
      setLoading(true)
      try {
        const response: AxiosResponse<T> = await axios(url, {
          ...options,
          signal: abortController.signal,
        })
        setData(response.data)
      } catch (err: any) {
        if (!err?.name || err?.name !== 'AbortError') {
          setError(err)
        }
      } finally {
        setLoading(false)
      }
    },
    [url, options]
  )

  useEffect(() => {
    const abortController = new AbortController()
    fetchData(abortController)

    return () => {
      abortController.abort()
    }
  }, [fetchTrigger, fetchData])

  return { data, error, loading, refetch }
}

export default useFetch
