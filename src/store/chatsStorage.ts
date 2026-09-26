import type { Chat } from './types'

interface StoredChats {
  chats: Chat[]
  activeChatId: string | null
}

const keyFor = (idInstance: string) => `greenApi.chats.${idInstance}`

export function loadChats(idInstance: string): StoredChats {
  try {
    const raw = localStorage.getItem(keyFor(idInstance))
    if (raw) {
      const data = JSON.parse(raw) as Partial<StoredChats>
      if (Array.isArray(data.chats)) {
        const chats = data.chats.map((chat) => ({
          ...chat,
          // Отправка, прерванная перезагрузкой, могла и не дойти — даём повторить
          messages: chat.messages.map((m) =>
            m.status === 'sending' ? { ...m, status: 'failed' as const } : m,
          ),
        }))
        const activeChatId = chats.some((c) => c.chatId === data.activeChatId)
          ? (data.activeChatId ?? null)
          : null
        return { chats, activeChatId }
      }
    }
  } catch {
    // Хранилище недоступно или данные повреждены — начинаем с пустого списка
  }
  return { chats: [], activeChatId: null }
}

export function saveChats(idInstance: string, data: StoredChats): void {
  try {
    localStorage.setItem(keyFor(idInstance), JSON.stringify(data))
  } catch {
    // Без localStorage чаты просто не переживут перезагрузку
  }
}
