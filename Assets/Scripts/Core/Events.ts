// Pure event bus. No Lens APIs.

export const EV = {
  BREAK_START: "break:start",
  BREAK_SNOOZE: "break:snooze",
  CREATURE_PINCH: "creature:pinch",
  STATE_CHANGED: "state:changed",
} as const;

export type EventName = typeof EV[keyof typeof EV];

export type Listener = (payload?: any) => void;

export class EventBus {
  private listeners: { [name: string]: Listener[] } = {};
  /** Last error thrown by a listener during emit (null if none). */
  lastError: any = null;

  /** Subscribe; returns an unsubscribe function. */
  on(name: string, cb: Listener): () => void {
    let list = this.listeners[name];
    if (!list) {
      list = [];
      this.listeners[name] = list;
    }
    list.push(cb);
    return () => {
      const cur = this.listeners[name];
      if (!cur) return;
      const i = cur.indexOf(cb);
      if (i >= 0) cur.splice(i, 1);
    };
  }

  /** Notify listeners; iterates over a copy, a throwing listener does not stop the others. */
  emit(name: string, payload?: any): void {
    const list = this.listeners[name];
    if (!list || list.length === 0) return;
    const copy = list.slice();
    for (let i = 0; i < copy.length; i++) {
      try {
        copy[i](payload);
      } catch (e) {
        this.lastError = e;
      }
    }
  }

  /** Remove all listeners and the last error. */
  clear(): void {
    this.listeners = {};
    this.lastError = null;
  }
}

/** Shared singleton. */
export const bus = new EventBus();
