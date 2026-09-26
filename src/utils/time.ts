const timeFormat = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
})
const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' })
const dayFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })
const dayYearFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

export function formatTime(timestamp: number): string {
  return timeFormat.format(timestamp * 1000)
}

export function formatChatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const isToday = date.toDateString() === new Date().toDateString()
  return isToday ? timeFormat.format(date) : dateFormat.format(date)
}

export function dayKey(timestamp: number): string {
  return new Date(timestamp * 1000).toDateString()
}

export function formatDay(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Сегодня'
  if (date.toDateString() === yesterday.toDateString()) return 'Вчера'
  return date.getFullYear() === today.getFullYear()
    ? dayFormat.format(date)
    : dayYearFormat.format(date)
}
