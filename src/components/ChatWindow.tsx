import { useEffect } from 'react'
import { useSendMessage } from '../hooks/useSendMessage'
import { useChat } from '../store/useChat'
import { Avatar } from './Avatar'
import styles from './ChatWindow.module.css'
import { MessageInput } from './MessageInput'
import { MessageList } from './MessageList'

export function ChatWindow() {
  const { state, dispatch } = useChat()
  const { send, retry } = useSendMessage()
  const chat = state.chats.find((c) => c.chatId === state.activeChatId)
  const hasChat = Boolean(chat)

  // Esc закрывает чат, как в Telegram Web
  useEffect(() => {
    if (!hasChat) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !e.isComposing) {
        dispatch({ type: 'selectChat', chatId: null })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasChat, dispatch])

  if (!chat) {
    return (
      <main className={styles.window} data-empty>
        <span className={styles.placeholder}>Выберите чат</span>
      </main>
    )
  }

  return (
    <main className={styles.window}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.back}
          aria-label="Назад к списку чатов"
          onClick={() => dispatch({ type: 'selectChat', chatId: null })}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path
              d="M15 5l-7 7 7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <Avatar title={chat.title} size={40} />
        <span className={styles.title}>{chat.title}</span>
      </header>
      <MessageList
        key={`list-${chat.chatId}`}
        messages={chat.messages}
        onRetry={(message) => retry(chat.chatId, message)}
      />
      <MessageInput
        key={`input-${chat.chatId}`}
        onSend={(text) => send(chat.chatId, text)}
      />
    </main>
  )
}
