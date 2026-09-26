import styles from './Avatar.module.css'

const COLORS = [
  '#e17076',
  '#faa774',
  '#a695e7',
  '#7bc862',
  '#6ec9cb',
  '#65aadd',
  '#ee7aae',
]

function colorFor(title: string): string {
  let hash = 0
  for (const ch of title) hash = (hash * 31 + ch.charCodeAt(0)) | 0
  return COLORS[Math.abs(hash) % COLORS.length]
}

function initialFor(title: string): string {
  const letter = title.replace(/^[@+]/, '').trim().charAt(0)
  return letter ? letter.toUpperCase() : '?'
}

export function Avatar({ title, size = 48 }: { title: string; size?: number }) {
  return (
    <span
      className={styles.avatar}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: colorFor(title),
      }}
      aria-hidden="true"
    >
      {initialFor(title)}
    </span>
  )
}
