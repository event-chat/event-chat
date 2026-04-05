import { EventDetailType } from '../../src'

export const customLang = Object.freeze({
  customError: '自定义过滤异常',
  groupEmpty: '不接收群组消息',
  groupProvider: '不是群组成员',
  tokenEmpty: '不接受私信',
  tokenProvider: '私信令牌不正确',
})

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
  type: 'message',
}
