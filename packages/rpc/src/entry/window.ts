import { ActionRecord } from '../RPCDecorator'
import RPCDecorator from '../core/RPCDecorator'
import WindowTransport from '../transports/WindowTransport'
import { EntryOptions } from '../transports/fields'

export function createWindowRPC<EVENT extends ActionRecord, CONSUME extends ActionRecord>(
  target: Window,
  config?: EntryOptions<EVENT, CONSUME>
) {
  const { context, options } = config ?? {}
  return RPCDecorator(new WindowTransport(target, options), context)
}
