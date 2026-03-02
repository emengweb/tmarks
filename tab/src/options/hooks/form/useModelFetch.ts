/**
 * AI 模型获取逻辑
 */

import { useState, useEffect, useRef } from 'react'
import { canFetchModels, fetchAvailableModels } from '@/lib/services/ai-models'
import type { AIProvider } from '@/types'
import type { ModelFetchState } from './types'

export function useModelFetch(
  aiProvider: AIProvider,
  apiUrl: string,
  apiKey: string,
  onModelsFetched?: (models: string[]) => void
) {
  const [state, setState] = useState<ModelFetchState>({
    availableModels: [],
    isFetchingModels: false,
    modelFetchError: null,
    modelFetchNonce: 0,
  })

  const lastModelFetchSignature = useRef<string | null>(null)

  useEffect(() => {
    const supported = canFetchModels(aiProvider, apiUrl)
    const trimmedKey = apiKey.trim()

    if (!supported || !trimmedKey) {
      setState(prev => ({
        ...prev,
        availableModels: [],
        modelFetchError: null,
        isFetchingModels: false,
      }))
      lastModelFetchSignature.current = null
      return
    }

    const signature = `${aiProvider}|${(apiUrl || '').trim()}|${trimmedKey}|${state.modelFetchNonce}`

    if (lastModelFetchSignature.current === signature) {
      return
    }

    let cancelled = false

    const fetchModels = async () => {
      setState(prev => ({ ...prev, isFetchingModels: true, modelFetchError: null }))

      try {
        const models = await fetchAvailableModels(aiProvider, trimmedKey, apiUrl)

        if (cancelled) return

        setState(prev => ({
          ...prev,
          availableModels: models,
          isFetchingModels: false,
          modelFetchError: null,
        }))
        lastModelFetchSignature.current = signature

        if (models.length > 0) {
          onModelsFetched?.(models)
        }
      } catch (e) {
        if (cancelled) return

        setState(prev => ({
          ...prev,
          availableModels: [],
          modelFetchError: e instanceof Error ? e.message : String(e),
          isFetchingModels: false,
        }))
        lastModelFetchSignature.current = signature
      }
    }

    fetchModels()

    return () => {
      cancelled = true
    }
  }, [aiProvider, apiUrl, apiKey, state.modelFetchNonce])

  const refreshModelOptions = () => {
    if (!canFetchModels(aiProvider, apiUrl) || !apiKey.trim()) {
      return
    }
    lastModelFetchSignature.current = null
    setState(prev => ({ ...prev, modelFetchNonce: prev.modelFetchNonce + 1 }))
  }

  const resetModelFetch = () => {
    setState(prev => ({
      ...prev,
      availableModels: [],
      modelFetchError: null,
    }))
    lastModelFetchSignature.current = null
  }

  return {
    ...state,
    refreshModelOptions,
    resetModelFetch,
    modelFetchSupported: canFetchModels(aiProvider, apiUrl),
  }
}
