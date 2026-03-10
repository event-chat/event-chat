import React from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'themed-card': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        theme?: 'light' | 'dark' // 可选的属性类型
      }
    }
  }
}
