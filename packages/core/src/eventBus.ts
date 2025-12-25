import { EventDetailType } from './utils';

class EventBus {
  private events: Partial<Record<string, Array<(data: EventDetailType) => void>>>;
  constructor() {
    this.events = {};
  }

  clear(): void {
    this.events = {};
  }

  emit(eventName: string, args: EventDetailType) {
    this.events[eventName]?.forEach((callback) => {
      callback(args);
    });
  }

  has(eventName: string, callback?: (args: EventDetailType) => void) {
    return (
      (!this.events[eventName] ? false : undefined) ??
      (callback ? this.events[eventName]?.includes(callback) : true)
    );
  }

  off(eventName: string, callback?: (args: EventDetailType) => void) {
    if (!Array.isArray(this.events[eventName])) return;
    if (callback) {
      this.events[eventName] = this.events[eventName].filter((cb) => cb !== callback);
    } else {
      this.events[eventName] = [];
    }

    if (this.events[eventName].length === 0) {
      Reflect.deleteProperty(this.events, eventName);
    }
  }

  on(eventName: string, callback: (data: EventDetailType) => void) {
    this.events[eventName] ??= [];
    if (!this.events[eventName].includes(callback)) {
      this.events[eventName].push(callback);
    }
  }

  once(eventName: string, callback: (data: EventDetailType) => void) {
    const wrapper = (args: EventDetailType) => {
      callback(args);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }
}

export default new EventBus();
