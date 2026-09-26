const timeFormat = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
})
const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' })

// timestamp — Unix-время в секундах
export function formatTime(timestamp: number): string {
  return timeFormat.format(timestamp * 1000)
}

// Для списка чатов: сегодня — время, иначе — дата
export function formatChatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  return isToday ? timeFormat.format(date) : dateFormat.format(date)
}

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}
