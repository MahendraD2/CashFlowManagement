"use client"

import { useState, useEffect, useCallback } from "react"

export const useApi = (apiFunction, initialData = null, immediate = true, ...params) => {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(
    async (...callParams) => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiFunction(...(callParams.length > 0 ? callParams : params))
        setData(result)
        return result
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [apiFunction, ...params],
  )

  useEffect(() => {
    if (immediate) {
      execute(...params)
    }
  }, [execute, immediate])

  return { data, loading, error, execute, setData }
}
