import {
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import styles from './MessageInput.module.css'

const MAX_HEIGHT = 160

export function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = text.trim().length > 0

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
  }, [text])

  function submit() {
    const value = text.trim()
    if (!value) return
    onSend(value)
    setText('')
    textareaRef.current?.focus()
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    submit()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        rows={1}
        placeholder="Сообщение"
        aria-label="Текст сообщения"
        value={text}
        autoFocus
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className={styles.send}
        type="submit"
        disabled={!canSend}
        aria-label="Отправить"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z" fill="currentColor" />
        </svg>
      </button>
    </form>
  )
}
