import { tv } from 'tailwind-variants'

export const baseStyle = tv({
  slots: {
    bar: 'flex h-16 bg-gray-700',
    corner:
      'absolute top-0 right-0 rounded-bl-lg bg-gray-600 px-2 text-sm shadow-md select-none text-shadow-lg',
    inputBox: 'flex flex-1 items-center',
    inputLine:
      'w-full p-0 pl-4 focus:outline-none disabled:cursor-not-allowed disabled:placeholder-gray-600',
    scroll: 'flex-1 overflow-auto px-4',
    selectUser: 'flex items-center justify-center',
    wrap: 'relative flex h-full flex-col',
  },
  variants: {
    unRecipient: {
      true: {
        inputBox: 'pl-4',
      },
    },
  },
})
