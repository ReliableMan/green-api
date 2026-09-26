import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { chatReducer, initialState } from './chatReducer'
import { ChatContext } from './context'
import { loadCredentials, saveCredentials } from './credentialsStorage'

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState, (init) => ({
    ...init,
    credentials: loadCredentials(),
  }))

  useEffect(() => {
    saveCredentials(state.credentials)
  }, [state.credentials])

  const value = useMemo(() => ({ state, dispatch }), [state])

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
