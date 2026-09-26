import styles from './ChatWindow.module.css'

export function ChatWindow() {
  return (
    <main className={styles.window}>
      <span className={styles.placeholder}>Выберите чат</span>
    </main>
  )
}
