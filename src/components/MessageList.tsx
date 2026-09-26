import { useEffect, useRef } from 'react'
import type { Message } from '../store/types'
import { formatTime } from '../utils/time'
import styles from './MessageList.module.css'

interface MessageListProps {
  messages: Message[]
  onRetry: (message: Message) => void
}

export function MessageList({ messages, onRetry }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <span className={styles.empty}>Нет сообщений</span>
      </div>
    )
  }

  return (
    <div className={styles.scroll}>
      <ul className={styles.list}>
        {messages.map((m) => (
          <li key={m.id} className={styles.row} data-direction={m.direction}>
            <div className={styles.bubble} data-direction={m.direction}>
              <span className={styles.text}>{m.text}</span>
              <span className={styles.meta}>
                {formatTime(m.timestamp)}
                {m.direction === 'out' && <StatusIcon status={m.status} />}
              </span>
            </div>
            {m.status === 'failed' && (
              <button type="button" className={styles.retry} onClick={() => onRetry(m)}>
                Не отправлено. Повторить
              </button>
            )}
          </li>
        ))}
      </ul>
      <div ref={bottomRef} />
    </div>
  )
}

function StatusIcon({ status }: { status?: Message['status'] }) {
  if (status === 'sending') {
    return (
      <svg className={styles.icon} viewBox="0 0 16 16" aria-label="Отправляется">
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.5V8l2.5 1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  }
  if (status === 'failed') {
    return (
      <svg className={styles.iconFailed} viewBox="0 0 16 16" aria-label="Ошибка отправки">
        <circle cx="8" cy="8" r="7" fill="currentColor" />
        <path d="M8 4v5M8 11v1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg className={styles.icon} viewBox="0 0 16 16" aria-label="Отправлено">
      <path
        d="M3 8.5l3 3 7-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
