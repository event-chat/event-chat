import { z, ZodType } from 'zod';
import eventBus from './eventBus';

export const EventName = 'custom-event-chat-11.18';
export const createEvent = (detail?: EventDetailType) =>
  new CustomEvent(EventName, {
    bubbles: true,
    cancelable: true,
    detail,
  });

export const getEventName = <T extends string>(name: T) =>
  name ? `event-chart-${name}` : undefined;

export function mountEvent(event: CustomDetailEvent) {
  const { name: detailName } = event.detail ?? {};
  const currentName = detailName ? getEventName(detailName) : undefined;
  if (currentName && event.detail) {
    eventBus.emit(currentName, event.detail);
  }
}

export const isSafetyType = <T>(target: unknown, origin: T): target is T => target === origin;

export interface EventChatOptions<Name extends string = string, Schema extends ZodType = ZodType> {
  schema?: Schema;
  callback?: (target: DetailType<Name, Schema>) => void;
}

export type DetailType<Name extends string = string, Schema extends ZodType = ZodType> = {
  __origin: string;
  name: Name;
  detail?: z.infer<Schema>;
};

export type EventDetailType = Pick<DetailType, '__origin' | 'name'> & {
  id: string;
  detail?: unknown;
};

interface CustomDetailEvent extends Event {
  detail?: EventDetailType;
}
