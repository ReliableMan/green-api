import { useCallback } from 'react'
import { sendMessage } from '../api/greenApi'
import { useChat } from '../store/useChat'
import type { Message } from '../store/types'
import { nowSeconds } from '../utils/time'

export function useSendMessage() {
  const { state, dispatch } = useChat()
  const { credentials } = state

  const deliver = useCallback(
    async (chatId: string, localId: string, text: string) => {
      if (!credentials) return
      try {
        const { idMessage } = await sendMessage(credentials, chatId, text)
        dispatch({
          type: 'updateMessage',
          chatId,
          messageId: localId,
          patch: { id: idMessage, status: 'sent' },
        })
      } catch {
        dispatch({
          type: 'updateMessage',
          chatId,
          messageId: localId,
          patch: { status: 'failed' },
        })
      }
    },
    [credentials, dispatch],
  )

  const send = useCallback(
    (chatId: string, text: string) => {
      const message: Message = {
        id: `local-${crypto.randomUUID()}`,
        text,
        direction: 'out',
        timestamp: nowSeconds(),
        status: 'sending',
      }
      dispatch({ type: 'addMessage', chatId, message })
      void deliver(chatId, message.id, text)
    },
    [deliver, dispatch],
  )

  const retry = useCallback(
    (chatId: string, message: Message) => {
      dispatch({
        type: 'updateMessage',
        chatId,
        messageId: message.id,
        patch: { status: 'sending', timestamp: nowSeconds() },
      })
      void deliver(chatId, message.id, message.text)
    },
    [deliver, dispatch],
  )

  return { send, retry }
}
