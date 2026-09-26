import { Fragment, useLayoutEffect, useRef } from 'react'
import type { Message } from '../store/types'
import { dayKey, formatDay, formatTime } from '../utils/time'
import styles from './MessageList.module.css'

const STICK_THRESHOLD = 120

interface MessageListProps {
  messages: Message[]
  onRetry: (message: Message) => void
}

export function MessageList({ messages, onRetry }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const stickToBottom = useRef(true)
  const prevCount = useRef(0)

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const isFirst = prevCount.current === 0
    const added = messages.length > prevCount.current
    prevCount.current = messages.length
    if (!added) return
    const ownMessage = messages.at(-1)?.direction === 'out'
    if (isFirst || stickToBottom.current || ownMessage) {
      el.scrollTo({ top: el.scrollHeight, behavior: isFirst ? 'instant' : 'smooth' })
    }
  }, [messages])

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    stickToBottom.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD
  }

  if (messages.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <span className={styles.chip}>Нет сообщений</span>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className={styles.scroll} onScroll={handleScroll}>
      <ul className={styles.list}>
        {messages.map((m, i) => {
          const newDay =
            i === 0 || dayKey(messages[i - 1].timestamp) !== dayKey(m.timestamp)
          return (
            <Fragment key={m.id}>
              {newDay && (
                <li className={styles.day}>
                  <span className={styles.chip}>{formatDay(m.timestamp)}</span>
                </li>
              )}
              <li className={styles.row} data-direction={m.direction}>
                <div className={styles.bubble} data-direction={m.direction}>
                  <span className={styles.text}>{m.text}</span>
                  <span className={styles.meta}>
                    {formatTime(m.timestamp)}
                    {m.direction === 'out' && <StatusIcon status={m.status} />}
                  </span>
                </div>
                {m.status === 'failed' && (
                  <button
                    type="button"
                    className={styles.retry}
                    onClick={() => onRetry(m)}
                  >
                    Не отправлено. Повторить
                  </button>
                )}
              </li>
            </Fragment>
          )
        })}
      </ul>
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
