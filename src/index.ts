import { EventEmitter, EventManaged } from '@xutl/events';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export type { Signal };
export default class Abort {
	#aborted = false;
	#signals = new Set<Signal>();
	constructor() {}
	get signal(): Signal {
		const signal = new Signal();
		if (this.#aborted) {
			EventEmitter.emit(signal)('abort', this).catch(() => {});
		} else {
			this.#signals.add(signal);
		}
		return signal;
	}
	async abort() {
		this.#aborted = true;
		const aborted = Promise.all(
			Array.from(this.#signals).map((signal) => EventEmitter.emit(signal)('abort', undefined)),
		);
		this.#signals.clear();
		await aborted;
	}
	async timeout(ms: number) {
		await sleep(ms);
		await this.abort();
	}
	abortable<T>(promise: Promise<T>): Promise<T> {
		return Promise.race([
			promise,
			new Promise<T>((_, reject) => {
				this.signal.on('abort', () => reject(new AbortError()));
			}),
		]);
	}
	clear() {
		this.#aborted = false;
		this.#signals.clear();
	}
}

type StandardListener = EventListener | { handleEvent: EventListener };
type SignalListener = () => void | Promise<void>;

const HANDLERMAP = new WeakMap<StandardListener, SignalListener>();
const REVERSEMAP = new WeakMap<SignalListener, StandardListener>();
class Signal extends EventEmitter implements EventTarget {
	#aborted = false;
	constructor() {
		super();
		this.on('abort', () => {
			this.#aborted = true;
		});
	}
	get aborted() {
		return this.#aborted;
	}
	on<T = undefined>(event: string, handler: EventManaged<T>): this {
		if (this.#aborted && event === 'abort') {
			Promise.resolve(handler.call(this, (undefined as unknown) as T, this)).catch(() => {});
		} else {
			EventEmitter.prototype.on.call(this, event, handler as EventManaged<unknown>);
		}
		return this;
	}
	#onabort?: EventManaged<void>;
	get onabort() {
		return this.#onabort;
	}
	set onabort(handler: EventManaged<void> | undefined) {
		if (this.#onabort === handler) return;
		if (handler) {
			this.#onabort = handler;
			this.on('abort', handler);
		} else if (this.#onabort) {
			this.off('abort', this.#onabort);
		}
	}
	addEventListener(name: 'abort', listener: StandardListener) {
		const handler =
			HANDLERMAP.get(listener) ||
			(() => {
				if ('function' === typeof listener) {
					listener(new Event('abort'));
				} else {
					listener.handleEvent(new Event('abort'));
				}
			});
		HANDLERMAP.set(listener, handler);
		REVERSEMAP.set(handler, listener);
		this.on(name, handler);
	}
	removeEventListener(name: 'abort', listener: StandardListener) {
		const handler = HANDLERMAP.get(listener);
		if (handler) this.off(name, handler);
	}
	dispatchEvent(_: Event): boolean {
		throw new TypeError('dispatching event not allowed');
	}
}
export class AbortError extends Error {
	constructor() {
		super('aborted');
	}
}
