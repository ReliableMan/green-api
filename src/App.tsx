import { ChatWindow } from './components/ChatWindow'
import { LoginForm } from './components/LoginForm'
import { Sidebar } from './components/Sidebar'
import { usePolling } from './hooks/usePolling'
import { useChat } from './store/useChat'
import styles from './App.module.css'

function App() {
  const { state } = useChat()
  usePolling()

  if (!state.credentials) {
    return <LoginForm />
  }

  return (
    <div className={styles.app} data-view={state.activeChatId ? 'chat' : 'list'}>
      <Sidebar />
      <ChatWindow />
    </div>
  )
}

export default App
