import type { Credentials } from '../types/greenApi'

export type MessageStatus = 'sending' | 'sent' | 'failed'

export interface Message {
  // idMessage от GREEN-API; у неотправленного — локальный временный id
  id: string
  text: string
  direction: 'in' | 'out'
  // Unix-время в секундах, как в уведомлениях GREEN-API
  timestamp: number
  status?: MessageStatus
}

export interface Chat {
  chatId: string
  title: string
  // Номер или @username, по которому чат создан — чтобы не тратить повторную проверку
  lookup?: string
  messages: Message[]
}

export interface ChatState {
  credentials: Credentials | null
  chats: Chat[]
  activeChatId: string | null
}

export type ChatAction = { type: 'login'; credentials: Credentials } | { type: 'logout' }
