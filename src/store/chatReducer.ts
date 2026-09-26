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

function addMessage(state: ChatState, chatId: string, message: Message): ChatState {
  const chat = state.chats.find((c) => c.chatId === chatId)
  if (!chat || chat.messages.some((m) => m.id === message.id)) return state
  const isUnread = message.direction === 'in' && chatId !== state.activeChatId
  return {
    ...state,
    chats: updateChat(
      state.chats,
      chatId,
      (c) => ({
        ...c,
        messages: [...c.messages, message],
        unread: isUnread ? (c.unread ?? 0) + 1 : c.unread,
      }),
      true,
    ),
  }
}

function selectChat(state: ChatState, chatId: string | null): ChatState {
  return {
    ...state,
    activeChatId: chatId,
    chats: chatId
      ? updateChat(state.chats, chatId, (c) => (c.unread ? { ...c, unread: 0 } : c))
      : state.chats,
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
        const selected = selectChat(state, action.chatId)
        if (!action.lookup || existing.lookup) return selected
        return {
          ...selected,
          chats: updateChat(selected.chats, action.chatId, (c) => ({
            ...c,
            lookup: action.lookup,
          })),
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
      return selectChat(state, action.chatId)

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
        unread: 1,
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
