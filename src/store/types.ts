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
  // Входящие, пришедшие, пока чат не был открыт
  unread?: number
}

export interface ChatState {
  credentials: Credentials | null
  // Порядок — по последней активности, сверху самый свежий
  chats: Chat[]
  activeChatId: string | null
  // Ошибка цикла получения уведомлений; null — соединение в порядке
  connectionError: string | null
}

export type ChatAction =
  // chats и activeChatId — восстановленные из localStorage для этого инстанса
  | {
      type: 'login'
      credentials: Credentials
      chats: Chat[]
      activeChatId: string | null
    }
  | { type: 'logout' }
  // Открывает чат, создавая его при необходимости
  | { type: 'openChat'; chatId: string; title: string; lookup?: string }
  | { type: 'selectChat'; chatId: string | null }
  | { type: 'addMessage'; chatId: string; message: Message }
  // Входящее сообщение; чат с title создаётся, если его ещё нет
  | { type: 'receiveMessage'; chatId: string; title: string; message: Message }
  | { type: 'updateMessage'; chatId: string; messageId: string; patch: Partial<Message> }
  | { type: 'setConnectionError'; error: string | null }
