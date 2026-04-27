import { ActionRecord } from '../RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import WindowTransport from '../transports/WindowTransport'
import { EntryOptions } from '../transports/fields'

export function createWindowRPC<EVENT extends ActionRecord, CONSUME extends ActionRecord>(
  target: Window | HTMLIFrameElement,
  config?: EntryOptions<EVENT, CONSUME>
) {
  const { context, options } = config ?? {}
  const instance = target instanceof HTMLIFrameElement ? target.contentWindow : target

  return RPCDecorator(instance ? new WindowTransport(instance, options) : null, context)
}
