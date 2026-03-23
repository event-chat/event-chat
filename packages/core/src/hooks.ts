import { useCallback, useEffect, useId, useMemo, useRef } from 'react'
import { ZodType } from 'zod'
import eventBus from './eventBus'
import {
  EventChatOptions,
  EventDetailType,
  EventName,
  ExcludeKey,
  NamepathType,
  combinePath,
  createEvent,
  createToken,
  getConditionKey,
  getEventName,
  isResultType,
  mountEvent,
} from './utils'
import { checkLiteral, validate } from './validate'

export const useMemoFn = <T>(fn: T) => {
  const methodRef = useRef<T>(fn)
  useEffect(() => {
    methodRef.current = fn
  }, [fn])

  return methodRef
}

export function useEventChat<
  Name extends NamepathType,
  Schema extends ZodType | undefined = undefined,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
>(name: Name, ops?: EventChatOptions<Name, Schema, Group, Type, Token>) {
  const eventName = useMemo(() => getEventName(name), [name])
  const id = useId()

  // 随业务改变
  const token = useMemo(
    () => createToken(getConditionKey(eventName, id, ops?.type)),
    [eventName, id, ops?.type]
  )

  const nameRc = useMemoFn(name)
  const options = useMemoFn(ops)
  const tokenRc = useMemoFn(token)

  const errorHandle = useCallback(
    (error: unknown, data: unknown, time: Date) => {
      const { debug } = options.current ?? {}
      if (error instanceof Error && debug) {
        const cause = isResultType(error.cause) ? error.cause : undefined
        debug?.({ ...cause, status: 'invalid', data, time })
      }
    },
    [options]
  )

  const callbackHandle = useCallback(
    (data: EventDetailType) => {
      const upRecord = { ...data, name: nameRc.current }
      const opitem = options.current

      if (!opitem) return
      const throwError = (error: unknown) => errorHandle(error, data.detail, data.time)

      if (opitem.schema !== undefined) {
        validate(upRecord, { ...opitem, schema: opitem.schema }, tokenRc.current)
          .then(opitem.callback)
          .catch(throwError)
      } else {
        checkLiteral(upRecord, { ...opitem, schema: undefined }, tokenRc.current)
          .then(opitem.callback)
          .catch(throwError)
      }
    },
    [nameRc, options, tokenRc, errorHandle]
  )

  const emit = useCallback(
    <Detail, CustomName extends NamepathType>(
      detail: Omit<EventDetailType<Detail, CustomName>, ExcludeKey>
    ) => {
      const { group, type, debug } = options.current ?? {}
      const time = new Date()
      try {
        const rule = combinePath(detail.name, nameRc.current)
        const event = createEvent({
          ...detail,
          origin: nameRc.current,
          originName: detail.name,
          group,
          id,
          rule,
          time,
          type,
        })

        debug?.({ data: event.detail, status: 'emit', time })
        document.body.dispatchEvent(event)
      } catch (error) {
        debug?.({ data: { name: nameRc.current, detail, error }, status: 'lost', time })
      }
    },
    [id, nameRc, options]
  )

  useEffect(() => {
    if (!document.body.dataset.globalIsListened) {
      document.body.addEventListener(EventName, mountEvent)
      document.body.dataset.globalIsListened = '1'
    }
  }, [])

  useEffect(() => {
    options.current?.debug?.({ data: { name: nameRc.current }, status: 'init', time: new Date() })
  }, [nameRc, options])

  useEffect(() => {
    eventBus.on(eventName, callbackHandle)
    return () => {
      eventBus.off(eventName, callbackHandle)
    }
  }, [eventName, callbackHandle])

  return Object.freeze({ token, emit })
}
