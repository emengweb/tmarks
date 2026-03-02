/**
 * 保存的连接管理
 */

import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import type { AIProvider, AIConnectionInfo } from '@/types'
import type { SavedConnectionsState } from './types'

const MAX_SAVED_CONNECTIONS = 10

export function useSavedConnections() {
  const { config } = useAppStore()

  const [state, setState] = useState<SavedConnectionsState>({
    savedConnections: {},
    isPresetModalOpen: false,
    presetLabel: '',
    isSavingPreset: false,
    presetError: null,
  })

  const generateConnectionId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`

  const normalizeSavedConnections = (input?: Partial<Record<AIProvider, AIConnectionInfo[]>>) => {
    const normalized: Partial<Record<AIProvider, AIConnectionInfo[]>> = {}

    if (!input) {
      return normalized
    }

    (Object.keys(input) as AIProvider[]).forEach((provider) => {
      const list = input[provider] || []
      normalized[provider] = Array.isArray(list)
        ? list.slice(0, MAX_SAVED_CONNECTIONS).map((item) => ({
            ...item,
            provider: item.provider || provider,
            id: item.id || generateConnectionId(),
          }))
        : []
    })

    return normalized
  }

  const upsertSavedConnection = (
    existing: Partial<Record<AIProvider, AIConnectionInfo[]>>,
    provider: AIProvider,
    connection: AIConnectionInfo
  ): Partial<Record<AIProvider, AIConnectionInfo[]>> => {
    const list = existing[provider] || []
    const normalizedUrl = (connection.apiUrl || '').trim()
    const normalizedKey = (connection.apiKey || '').trim()
    const normalizedModel = (connection.model || '').trim()

    const newEntry: AIConnectionInfo = {
      ...connection,
      apiUrl: normalizedUrl || undefined,
      apiKey: normalizedKey || undefined,
      model: normalizedModel || undefined,
      provider,
      label: connection.label?.trim() || connection.label,
      lastUsedAt: Date.now(),
      id: connection.id || generateConnectionId(),
    }

    const hasId = Boolean(connection.id)
    const existingIndex = hasId ? list.findIndex((item) => item.id && item.id === connection.id) : -1
    let updatedList: AIConnectionInfo[]

    if (hasId && existingIndex >= 0) {
      updatedList = [...list]
      updatedList[existingIndex] = newEntry
    } else {
      updatedList = [newEntry, ...list].slice(0, MAX_SAVED_CONNECTIONS)
    }

    return {
      ...existing,
      [provider]: updatedList,
    }
  }

  const removeSavedConnection = (
    existing: Partial<Record<AIProvider, AIConnectionInfo[]>>,
    provider: AIProvider,
    target: AIConnectionInfo
  ): Partial<Record<AIProvider, AIConnectionInfo[]>> => {
    const list = existing[provider] || []
    const normalizedUrl = (target.apiUrl || '').trim()
    const normalizedKey = (target.apiKey || '').trim()
    const normalizedModel = (target.model || '').trim()

    const filtered = list.filter((item) => {
      if (target.id && item.id) {
        return item.id !== target.id
      }

      return (
        (item.apiUrl || '').trim() !== normalizedUrl ||
        (item.apiKey || '').trim() !== normalizedKey ||
        (item.model || '').trim() !== normalizedModel
      )
    })

    const updated: Partial<Record<AIProvider, AIConnectionInfo[]>> = {
      ...existing,
    }

    if (filtered.length > 0) {
      updated[provider] = filtered
    } else {
      delete updated[provider]
    }

    return updated
  }

  useEffect(() => {
    if (!config) {
      return
    }

    const normalizedSaved = normalizeSavedConnections(config.aiConfig.savedConnections)
    setState(prev => ({ ...prev, savedConnections: normalizedSaved }))
  }, [config])

  const allSavedConnections = useMemo(() => {
    return Object.entries(state.savedConnections).flatMap(([provider, list]) =>
      (list || []).map((connection) => ({
        ...connection,
        provider: connection.provider || (provider as AIProvider),
      }))
    )
  }, [state.savedConnections])

  const setSavedConnections = (connections: Partial<Record<AIProvider, AIConnectionInfo[]>>) => {
    setState(prev => ({ ...prev, savedConnections: connections }))
  }

  const setPresetLabel = (label: string) => {
    setState(prev => ({ ...prev, presetLabel: label }))
  }

  const openPresetModal = (defaultLabel: string) => {
    setState(prev => ({
      ...prev,
      isPresetModalOpen: true,
      presetLabel: defaultLabel,
      presetError: null,
    }))
  }

  const closePresetModal = () => {
    setState(prev => ({
      ...prev,
      isPresetModalOpen: false,
      presetError: null,
    }))
  }

  const setPresetError = (error: string | null) => {
    setState(prev => ({ ...prev, presetError: error }))
  }

  const setSavingPreset = (saving: boolean) => {
    setState(prev => ({ ...prev, isSavingPreset: saving }))
  }

  return {
    ...state,
    allSavedConnections,
    setSavedConnections,
    setPresetLabel,
    openPresetModal,
    closePresetModal,
    setPresetError,
    setSavingPreset,
    upsertSavedConnection,
    removeSavedConnection,
  }
}
