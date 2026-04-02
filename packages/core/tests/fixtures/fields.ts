import { EventDetailType } from '../../src'

export const eventName = 'test-on-emit'
export const message = 'hello event bus'
export const pubName = 'pub-mox'
export const testEventData: EventDetailType = {
  detail: { message },
  global: true,
  group: 'test-group',
  id: 'test-id-123',
  name: eventName,
  origin: 'test-origin',
  originName: eventName,
  rule: eventName,
  time: new Date(),
  token: 'test-token-456',
  type: 'test-type',
}
