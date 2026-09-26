import { useChat } from '../store/useChat'
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
      <div className={styles.empty}>Чатов пока нет</div>
    </aside>
  )
}
