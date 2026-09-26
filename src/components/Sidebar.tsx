import { useChat } from '../store/useChat'
import { ChatList } from './ChatList'
import { NewChatForm } from './NewChatForm'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const { state, dispatch } = useChat()

  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <span className={styles.instance}>Инстанс {state.credentials?.idInstance}</span>
        <button
          className={styles.logout}
          type="button"
          onClick={() => dispatch({ type: 'logout' })}
        >
          Выйти
        </button>
      </header>
      {state.connectionError && (
        <div className={styles.connection} role="status">
          Нет связи с GREEN-API: {state.connectionError}. Переподключаемся…
        </div>
      )}
      <NewChatForm />
      <ChatList />
    </aside>
  )
}
