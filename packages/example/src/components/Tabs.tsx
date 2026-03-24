import { useEventChat } from '@event-chat/core'
import {
  type FC,
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { tv } from 'tailwind-variants'
import z from 'zod'
import { tabItem, tabsContainer, tabsPick } from '@/utils/event'

const scrollClasses = ['', 'shadow-inset-l-sm', 'shadow-inset-r-sm', 'shadow-inset-x-sm']
function scrollStart(this: HTMLDivElement) {
  scrollClasses.forEach((itemClass) => {
    if (itemClass) this.classList.remove(itemClass)
  })
}
function scrollHandle(this: HTMLDivElement) {
  const leftPoint = this.scrollLeft > 0 ? 1 : 0
  const rightPoint = this.scrollLeft + this.clientWidth >= this.scrollWidth ? 0 : 2
  scrollStart.call(this)

  const itemClass = scrollClasses[leftPoint + rightPoint]
  if (itemClass) this.classList.add(itemClass)
}

const TabContext = createContext({ group: '' })
const styles = tv({
  slots: {
    active:
      'absolute h-full w-(--selected-item-width) translate-x-(--selected-item-position) rounded-sm border border-slate-300 bg-white shadow-sm transition-[width,translate] duration-300',
    base: 'relative max-w-full transform-[translateZ(0)] rounded',
    button:
      'cursor-pointer rounded-sm px-2 py-1 text-base font-medium text-slate-900 transition duration-200 hover:text-slate-600 focus:outline-none focus-visible:ring-2',
    list: 'relative flex items-center gap-1',
    menu: 'relative',
    nav: 'tabs-container no-scrollbar shadow-inset-r-sm relative w-full max-w-full overflow-x-auto rounded border bg-slate-100 p-1',
  },
})

const TabItem: FC<PropsWithChildren<TabItemProps>> = ({ children, name }) => {
  const [active, setActive] = useState(false)
  const id = useId()

  const takeKey = useMemo(() => name ?? id, [id, name])
  const { button: btnStyle } = styles()

  const { group } = useContext(TabContext)
  const { emit } = useEventChat(tabItem, {
    callback: ({ detail }) => setActive(detail === takeKey),
    group,
  })

  useEffect(() => {
    if (active) emit({ name: tabsPick })
  }, [active, emit])

  return (
    <li className={active ? 'active' : undefined}>
      <button
        className={btnStyle()}
        type="button"
        onClick={() => {
          if (!active) emit({ detail: takeKey, name: tabsContainer })
        }}
      >
        {children}
      </button>
    </li>
  )
}

const Tabs: FC<PropsWithChildren<TabsProps>> = ({
  active,
  defaultActive,
  children,
  group: groupKey,
  onChange,
}) => {
  const [defaultActiveKey] = useState(defaultActive)
  const wrapRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const defaultGroup = useId()

  const group = useMemo(() => groupKey ?? defaultGroup, [defaultGroup, groupKey])
  const { active: activeStyle, base, list, menu, nav } = styles()

  const { emit } = useEventChat(tabsContainer, {
    schema: z.union([z.string(), z.number(), z.symbol()]),
    callback: ({ detail }) => {
      if (active === undefined) {
        emit({ name: tabItem, detail })
        onChange?.(detail)
      }
    },
    group,
  })

  // onChange 一定会 pick，但 pick 不一定会 onChange
  useEventChat(tabsPick, {
    callback: () => {
      const dataSider = wrapRef.current?.querySelector('[data-slider]')
      const tab = wrapRef.current?.querySelector('.active')

      if (!(dataSider instanceof HTMLElement)) return
      if (tab instanceof HTMLElement) {
        dataSider.style.setProperty('--selected-item-width', `${tab.clientWidth}px`)
        dataSider.style.setProperty('--selected-item-position', `${tab.offsetLeft}px`)
      } else {
        dataSider.style.setProperty('--selected-item-width', '0')
        dataSider.style.setProperty('--selected-item-position', '0')
      }
    },
    group,
  })

  useEffect(() => {
    const { current } = navRef
    const resizeObserver = new ResizeObserver(() => {
      if (!current) return
      if (current.clientWidth < current.scrollWidth) {
        scrollHandle.call(current)
      } else {
        scrollStart.call(current)
      }
    })

    if (current) {
      current.addEventListener('scroll', scrollHandle)
      resizeObserver.observe(current)
    }
    return () => {
      if (current) {
        current.removeEventListener('scroll', scrollHandle)
        resizeObserver.unobserve(current)
        resizeObserver.disconnect()
      }
    }
  }, [navRef])

  useEffect(() => {
    emit({ detail: active ?? defaultActiveKey, name: tabItem })
  }, [active, defaultActiveKey, emit])

  return (
    <div className={base()} ref={wrapRef}>
      <nav className={nav()} ref={navRef}>
        <div className={menu()}>
          <div className={activeStyle()} data-slider />
          <ul className={list()}>
            <TabContext.Provider value={{ group }}>{children}</TabContext.Provider>
          </ul>
        </div>
      </nav>
    </div>
  )
}

export { TabItem }

export default Tabs

interface TabItemProps {
  name?: PropertyKey
}

interface TabsProps {
  active?: PropertyKey
  defaultActive?: PropertyKey

  // 主控 tabs 时允许设置 group 从而切换的 item 项，添加相同的 group 来监听切换
  group?: string
  onChange?: (key: PropertyKey) => void
}
