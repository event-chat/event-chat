import { expectType } from 'tsd'
import { EventDetailType } from '../dist'
import eventBus from '../dist/eventBus'

const eventDetail: EventDetailType<string, 'test'> = {
  detail: 'input text',
  global: false,
  group: 'group',
  id: '1',
  name: 'test',
  origin: 'origin',
  originName: 'test',
  rule: 'test',
  time: new Date(),
  token: 'token',
  type: 'type',
}

// ========================
// 1. emit / clear
// ========================
expectType<void>(eventBus.clear())
expectType<void>(eventBus.emit(eventDetail))

// ========================
// 2. mount / unmount
// ========================
// on
expectType<MountType>(eventBus.on)
expectType<void>(eventBus.on('test', (detail) => expectType<EventDetailType>(detail)))

// once
expectType<MountType>(eventBus.once)
expectType<void>(eventBus.once('test', (detail) => expectType<EventDetailType>(detail)))

// has
expectType<(name: string, callback?: (data: EventDetailType) => void) => boolean>(eventBus.has)
expectType<boolean>(eventBus.has('test', (detail) => expectType<EventDetailType>(detail)))
expectType<boolean>(eventBus.has('test'))

// off
expectType<(name: string, callback?: (data: EventDetailType) => void) => void>(eventBus.off)
expectType<void>(eventBus.off('test', (detail) => expectType<EventDetailType>(detail)))
expectType<void>(eventBus.off('test'))

type MountType = (name: string, callback: (data: EventDetailType) => void) => void
