import { useSendMessage } from '../hooks/useSendMessage'
import { useChat } from '../store/useChat'
import { Avatar } from './Avatar'
import styles from './ChatWindow.module.css'
import { MessageInput } from './MessageInput'
import { MessageList } from './MessageList'

export function ChatWindow() {
  const { state } = useChat()
  const { send, retry } = useSendMessage()
  const chat = state.chats.find((c) => c.chatId === state.activeChatId)

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
        <Avatar title={chat.title} size={40} />
        <span className={styles.title}>{chat.title}</span>
      </header>
      <MessageList
        messages={chat.messages}
        onRetry={(message) => retry(chat.chatId, message)}
      />
      <MessageInput key={chat.chatId} onSend={(text) => send(chat.chatId, text)} />
    </main>
  )
}
