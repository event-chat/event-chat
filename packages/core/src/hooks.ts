import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import { ZodType } from 'zod';
import eventBus from './eventBus';
import {
  createEvent,
  DetailType,
  EventChatOptions,
  EventDetailType,
  EventName,
  getEventName,
  isSafetyType,
  mountEvent,
} from './utils';

export const useMemoFn = <T>(fn: T) => {
  const methodRef = useRef<T>(fn);
  useEffect(() => {
    methodRef.current = fn;
  }, [fn]);

  return methodRef;
};

export const useEventChat = <Name extends string, Schema extends ZodType = ZodType>(
  name: Name,
  ops: EventChatOptions<Name, Schema>
) => {
  const eventName = useMemo(() => getEventName(name), [name]);
  const id = useId();
  const { callback } = ops;

  const callbackFn = useMemoFn(callback);
  const emit = useCallback(
    (detail?: Omit<EventDetailType, '__origin' | 'id'>) => {
      if (name && detail) {
        const event = createEvent({ ...detail, __origin: name, id });
        document.body.dispatchEvent(event);
      }
    },
    [id, name]
  );

  const callbackHandle = useCallback(
    ({ name: subName, ...args }: DetailType<string, Schema>) => {
      if (callbackFn.current && isSafetyType(subName, name)) {
        callbackFn.current({ ...args, name: subName });
      }
    },
    [callbackFn, name]
  );

  useEffect(() => {
    if (eventName) eventBus.on(eventName, callbackHandle);
    return () => {
      if (eventName) eventBus.off(eventName, callbackHandle);
    };
  }, [eventName, callbackHandle]);

  useEffect(() => {
    if (!document.body.dataset.globalIsListened) {
      document.body.addEventListener(EventName, mountEvent);
      document.body.dataset.globalIsListened = '1';
    }
  }, []);

  return [emit] as const;
};
