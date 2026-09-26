import type { Credentials } from '../types/greenApi'

export type MessageStatus = 'sending' | 'sent' | 'failed'

export interface Message {
  id: string
  text: string
  direction: 'in' | 'out'
  timestamp: number
  status?: MessageStatus
}

export interface Chat {
  chatId: string
  title: string
  lookup?: string
  messages: Message[]
  unread?: number
}

export interface ChatState {
  credentials: Credentials | null
  chats: Chat[]
  activeChatId: string | null
  connectionError: string | null
}

export type ChatAction =
  | {
      type: 'login'
      credentials: Credentials
      chats: Chat[]
      activeChatId: string | null
    }
  | { type: 'logout' }
  | { type: 'openChat'; chatId: string; title: string; lookup?: string }
  | { type: 'selectChat'; chatId: string | null }
  | { type: 'addMessage'; chatId: string; message: Message }
  | { type: 'receiveMessage'; chatId: string; title: string; message: Message }
  | { type: 'updateMessage'; chatId: string; messageId: string; patch: Partial<Message> }
  | { type: 'setConnectionError'; error: string | null }
