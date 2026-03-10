import type { FC, PropsWithChildren } from 'react'

const CardItem: FC<PropsWithChildren> = ({ children }) => (
  <div className="bg-white p-4 text-gray-900 dark:bg-gray-800 dark:text-gray-100">{children}</div>
)

export default CardItem
