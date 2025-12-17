import { DetailType, EventChatOptions, EventDetailType } from './utils';

class EventBus {
  // event 可以挂载同名事件，而 condition 根据 `${event}:${id}` 进行区分
  // 因此请避免同组件同名事件，后面挂载的监听会覆盖前面的
  private condition: Record<string, Omit<EventChatOptions, 'callback'>>;
  private events: Record<string, Array<(args: DetailType) => void>>;

  constructor() {
    this.condition = {};
    this.events = {};
  }

  on(eventName: string, callback: (args: DetailType) => void): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    if (!this.events[eventName].includes(callback)) {
      this.events[eventName].push(callback);
    }
  }

  off(eventName: string, callback?: (args: DetailType) => void): void {
    if (!this.events[eventName]) return;
    if (callback) {
      this.events[eventName] = this.events[eventName].filter((cb) => cb !== callback);
    } else {
      this.events[eventName] = [];
    }
  }

  emit(eventName: string, args: EventDetailType): void {
    if (!this.events[eventName]) return;
    [...this.events[eventName]].forEach((callback) => {
      callback(args);
    });
  }

  once(eventName: string, callback: (args: DetailType) => void): void {
    const wrapper = (args: DetailType) => {
      callback(args);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }

  mount(eventName: string, conditionItem?: Omit<EventChatOptions, 'callback'>) {
    if (conditionItem) {
      this.condition[eventName] = conditionItem;
    }
  }
}

export default new EventBus();
