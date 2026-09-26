import type { ChatAction, ChatState } from './types'

export const initialState: ChatState = {
  credentials: null,
  chats: [],
  activeChatId: null,
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'login':
      return { ...initialState, credentials: action.credentials }
    case 'logout':
      return initialState
    default:
      return state
  }
}
