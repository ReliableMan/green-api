import type { Chat, ChatAction, ChatState, Message } from './types'

export const initialState: ChatState = {
  credentials: null,
  chats: [],
  activeChatId: null,
  connectionError: null,
}

function updateChat(
  chats: Chat[],
  chatId: string,
  update: (chat: Chat) => Chat,
  moveToTop = false,
): Chat[] {
  const index = chats.findIndex((c) => c.chatId === chatId)
  if (index === -1) return chats
  const updated = update(chats[index])
  if (moveToTop) {
    return [updated, ...chats.slice(0, index), ...chats.slice(index + 1)]
  }
  return chats.map((c, i) => (i === index ? updated : c))
}

// Добавляет сообщение и поднимает чат наверх; дубли по id игнорируются
function addMessage(state: ChatState, chatId: string, message: Message): ChatState {
  const chat = state.chats.find((c) => c.chatId === chatId)
  if (!chat || chat.messages.some((m) => m.id === message.id)) return state
  return {
    ...state,
    chats: updateChat(
      state.chats,
      chatId,
      (c) => ({ ...c, messages: [...c.messages, message] }),
      true,
    ),
  }
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'login':
      return {
        ...initialState,
        credentials: action.credentials,
        chats: action.chats,
        activeChatId: action.activeChatId,
      }

    case 'logout':
      return initialState

    case 'openChat': {
      const existing = state.chats.find((c) => c.chatId === action.chatId)
      if (existing) {
        return {
          ...state,
          activeChatId: action.chatId,
          chats:
            action.lookup && !existing.lookup
              ? updateChat(state.chats, action.chatId, (c) => ({
                  ...c,
                  lookup: action.lookup,
                }))
              : state.chats,
        }
      }
      const chat: Chat = {
        chatId: action.chatId,
        title: action.title,
        lookup: action.lookup,
        messages: [],
      }
      return { ...state, chats: [chat, ...state.chats], activeChatId: action.chatId }
    }

    case 'selectChat':
      return { ...state, activeChatId: action.chatId }

    case 'addMessage':
      return addMessage(state, action.chatId, action.message)

    case 'receiveMessage': {
      if (state.chats.some((c) => c.chatId === action.chatId)) {
        return addMessage(state, action.chatId, action.message)
      }
      const chat: Chat = {
        chatId: action.chatId,
        title: action.title,
        messages: [action.message],
      }
      return { ...state, chats: [chat, ...state.chats] }
    }

    case 'setConnectionError':
      if (state.connectionError === action.error) return state
      return { ...state, connectionError: action.error }

    case 'updateMessage':
      return {
        ...state,
        chats: updateChat(state.chats, action.chatId, (c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === action.messageId ? { ...m, ...action.patch } : m,
          ),
        })),
      }

    default:
      return state
  }
}
