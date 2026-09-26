import { useEffect, type Dispatch } from 'react'
import { deleteNotification, GreenApiError, receiveNotification } from '../api/greenApi'
import { getMessageText, isIncomingMessage } from '../api/notifications'
import type { ChatAction } from '../store/types'
import { useChat } from '../store/useChat'
import type { Credentials, NotificationBody } from '../types/greenApi'

const RECEIVE_TIMEOUT_SEC = 20
const RETRY_DELAY_MS = 4000

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        resolve()
      },
      { once: true },
    )
  })
}

function handleNotification(body: NotificationBody, dispatch: Dispatch<ChatAction>) {
  if (!isIncomingMessage(body)) return
  const text = getMessageText(body.messageData)
  if (!text) return
  const { chatId, senderName, chatName, senderContactName } = body.senderData
  dispatch({
    type: 'receiveMessage',
    chatId,
    title: senderName || senderContactName || chatName || chatId,
    message: {
      id: body.idMessage,
      text,
      direction: 'in',
      timestamp: body.timestamp,
    },
  })
}

async function pollLoop(
  credentials: Credentials,
  dispatch: Dispatch<ChatAction>,
  signal: AbortSignal,
) {
  while (!signal.aborted) {
    try {
      const notification = await receiveNotification(
        credentials,
        RECEIVE_TIMEOUT_SEC,
        signal,
      )
      dispatch({ type: 'setConnectionError', error: null })
      if (!notification) continue
      try {
        handleNotification(notification.body, dispatch)
      } finally {
        await deleteNotification(credentials, notification.receiptId, signal)
      }
    } catch (err) {
      if (signal.aborted) return
      dispatch({
        type: 'setConnectionError',
        error: err instanceof GreenApiError ? err.message : 'Ошибка получения сообщений',
      })
      await sleep(RETRY_DELAY_MS, signal)
    }
  }
}

export function usePolling() {
  const { state, dispatch } = useChat()
  const { credentials } = state

  useEffect(() => {
    if (!credentials) return
    const controller = new AbortController()
    void pollLoop(credentials, dispatch, controller.signal)
    return () => controller.abort()
  }, [credentials, dispatch])
}
