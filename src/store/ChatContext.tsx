import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { chatReducer, initialState } from './chatReducer'
import { loadChats, saveChats } from './chatsStorage'
import { ChatContext } from './context'
import { loadCredentials, saveCredentials } from './credentialsStorage'
import type { ChatState } from './types'

function init(): ChatState {
  const credentials = loadCredentials()
  if (!credentials) return initialState
  return { ...initialState, credentials, ...loadChats(credentials.idInstance) }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, undefined, init)
  const { credentials, chats, activeChatId } = state

  useEffect(() => {
    saveCredentials(credentials)
  }, [credentials])

  // Чаты хранятся по инстансу и остаются после выхода — при повторном входе вернутся
  useEffect(() => {
    if (credentials) saveChats(credentials.idInstance, { chats, activeChatId })
  }, [credentials, chats, activeChatId])

  const value = useMemo(() => ({ state, dispatch }), [state])

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
