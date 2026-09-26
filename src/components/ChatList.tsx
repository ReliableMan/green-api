import { useChat } from '../store/useChat'
import { formatChatTime } from '../utils/time'
import { Avatar } from './Avatar'
import styles from './ChatList.module.css'

export function ChatList() {
  const { state, dispatch } = useChat()

  if (state.chats.length === 0) {
    return (
      <div className={styles.empty}>
        Чатов пока нет. Найдите собеседника по номеру телефона или @username
      </div>
    )
  }

  return (
    <ul className={styles.list}>
      {state.chats.map((chat) => {
        const last = chat.messages.at(-1)
        const active = chat.chatId === state.activeChatId
        return (
          <li key={chat.chatId}>
            <button
              type="button"
              className={styles.item}
              data-active={active || undefined}
              aria-current={active || undefined}
              onClick={() => dispatch({ type: 'selectChat', chatId: chat.chatId })}
            >
              <Avatar title={chat.title} />
              <div className={styles.body}>
                <div className={styles.top}>
                  <span className={styles.title}>{chat.title}</span>
                  {last && (
                    <span className={styles.time}>{formatChatTime(last.timestamp)}</span>
                  )}
                </div>
                <div className={styles.preview}>
                  {last ? (
                    <>
                      {last.direction === 'out' && (
                        <span className={styles.you}>Вы: </span>
                      )}
                      {last.text}
                    </>
                  ) : (
                    'Нет сообщений'
                  )}
                </div>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
