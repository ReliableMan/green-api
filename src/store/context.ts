import { createContext, type Dispatch } from 'react'
import type { ChatAction, ChatState } from './types'

export interface ChatContextValue {
  state: ChatState
  dispatch: Dispatch<ChatAction>
}

export const ChatContext = createContext<ChatContextValue | null>(null)
