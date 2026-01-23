import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import { ZodType } from 'zod';
import eventBus from './eventBus';
import {
  EventChatOptions,
  EventDetailType,
  EventName,
  ExcludeKey,
  NamepathType,
  combinePath,
  createEvent,
  createToken,
  defaultName,
  getConditionKey,
  getEventName,
  isResultType,
  mountEvent,
} from './utils';
import { checkLiteral, validate } from './validate';

export const useMemoFn = <T>(fn: T) => {
  const methodRef = useRef<T>(fn);
  useEffect(() => {
    methodRef.current = fn;
  }, [fn]);

  return methodRef;
};

export function useEventChat<
  Name extends NamepathType,
  Schema extends ZodType | undefined = undefined,
  Group extends string | undefined = undefined,
  Type extends string | undefined = undefined,
  Token extends boolean | undefined = undefined,
>(name: Name, ops?: EventChatOptions<Name, Schema, Group, Type, Token>) {
  const eventName = useMemo(() => getEventName(name), [name]);
  const id = useId();

  // 随业务改变
  const token = useMemo(
    () => createToken(getConditionKey(eventName, id, ops?.type)),
    [eventName, id, ops?.type]
  );

  const nameRc = useMemoFn(name);
  const options = useMemoFn(ops);
  const tokenRc = useMemoFn(token);

  const errorHandle = useCallback(
    (error: unknown, data: unknown, time: Date) => {
      if (error instanceof Error && options.current?.debug)
        options.current.debug(
          isResultType(error.cause) ? { ...error.cause, data, time } : undefined
        );
    },
    [options]
  );

  const callbackHandle = useCallback(
    (data: EventDetailType) => {
      const upRecord = { ...data, name: nameRc.current };
      const opitem = options.current;

      if (!opitem) return;
      const throwError = (error: unknown) => errorHandle(error, data.detail, data.time);

      if (opitem.schema !== undefined) {
        validate(upRecord, { ...opitem, schema: opitem.schema }, tokenRc.current)
          .then(opitem.callback)
          .catch(throwError);
      } else {
        checkLiteral(upRecord, { ...opitem, schema: undefined }, tokenRc.current)
          .then(opitem.callback)
          .catch(throwError);
      }
    },
    [nameRc, options, tokenRc, errorHandle]
  );

  const emit = useCallback(
    <Detail, CustomName extends NamepathType>(
      detail: Omit<EventDetailType<Detail, CustomName>, ExcludeKey>
    ) => {
      try {
        const rule = combinePath(detail.name, nameRc.current);
        const event = createEvent({
          ...detail,
          group: options.current?.group,
          origin: nameRc.current,
          originName: detail.name,
          time: new Date(),
          type: options.current?.type,
          id,
          rule,
        });
        document.body.dispatchEvent(event);
      } catch {
        options.current?.onLost?.({ name: detail.name, origin: nameRc.current, type: 'emit' });
      }
    },
    [id, nameRc, options]
  );

  useEffect(() => {
    if (!document.body.dataset.globalIsListened) {
      document.body.addEventListener(EventName, mountEvent);
      document.body.dataset.globalIsListened = '1';
    }
  }, []);

  useEffect(() => {
    if (!(name === '' || (Array.isArray(name) && name.length === 0)) && eventName === defaultName) {
      options.current?.onLost?.({ type: 'init', name });
    }
  }, [eventName, name, options]);

  useEffect(() => {
    eventBus.on(eventName, callbackHandle);
    return () => {
      eventBus.off(eventName, callbackHandle);
    };
  }, [eventName, callbackHandle]);

  return Object.freeze({ token, emit });
}
