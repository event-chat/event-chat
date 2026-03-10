import type { FC, PropsWithChildren } from 'react'

const ThemedCard: FC<PropsWithChildren<ThemedCardProps>> = ({ children, theme = 'light' }) => (
  <themed-card theme={theme}>{children}</themed-card>
)

export default ThemedCard

interface ThemedCardProps {
  theme?: 'dark' | 'light'
}
