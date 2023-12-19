import { Maybe } from "./Maybe";

export type UnwrapFuture<T> = T extends Future<infer R> ? UnwrapFuture<R> : T extends Promise<infer R> ? UnwrapFuture<R> : T;

type UnwrappedFutures<T extends readonly Future<any>[]> = {
	[K in keyof T]: UnwrapFuture<T[K]>;
};

export class Future<T> implements Promise<T>
{
	public static readonly wait = (ms: number) => 
	{
		if (ms < 0)
			throw new Error(`Cannot wait on ${ms}ms!`);

		return new Future<number>((future) => new Promise<number>(res => 
		{
			const timeout = setTimeout(() => res(ms), ms);
			future.onCanceled(() => clearTimeout(timeout));
		}));
	};

	public static readonly all = <T extends readonly Future<any>[]>(...futures: T) => new Future<UnwrappedFutures<T>>(() => Promise.all(futures) as any);
	public static readonly allSettled = <T extends readonly Future<any>[]>(...futures: T) => new Future<UnwrappedFutures<T>>(() => Promise.allSettled(futures) as any);
	public static readonly race = <T extends readonly Future<any>[]>(...futures: T) => new Future<UnwrappedFutures<T>[keyof T]>(() => Promise.race(futures) as any);

	public constructor(_handler: (future: Future<T>) => (T | Promise<T>))
	{
		let rejected = new Maybe<any>();

		let _reject = new Maybe<(reason?: any) => any>();

		let internal_cancel_handlers: ((reason?: any) => any)[] = [];
		let cancel_handlers: ((reason?: any) => any)[] = [];

		this.onCanceled = (callback: (reason?: any) => any) => { internal_cancel_handlers.push(callback); };

		const reject = (cancel: boolean, reason?: any) =>
		{
			rejected.ifNone(() => 
			{
				rejected.set(reason);

				if (cancel)
				{
					internal_cancel_handlers.forEach(handler => handler(reason));
					if (cancel_handlers.length > 0)
						cancel_handlers.forEach(handler => handler(reason));
					else
						_reject.get()(new Future.CancelException(reason));
				}
				else
				{
					_reject.get()(reason);
				}
			});
		};

		const promise = new Promise(async (resolve, rej) => 
		{
			try
			{
				_reject.set(rej);
				const data = await _handler(this);
				if (rejected.isNone)
					return resolve(data);
			}
			catch (e)
			{
				return reject(false, e);
			}
		});

		const handlers = {
			then: promise.then,
			catch: promise.catch,
			finally: promise.finally
		};

		const p = promise as any;

		p.then = (onResolved: any, onRejected: any) => new Future(() => handlers.then.apply(promise, [onResolved, onRejected]));
		p.catch = (onRejected: any) => new Future(() => handlers.catch.apply(promise, [onRejected]));
		p.finally = () => new Future(() => handlers.finally.apply(promise, []));
		this.cancel = (p.cancel = (reason?: any) => reject(true, reason));
		p.on_canceled = (callback: (reason?: any) => any) => { cancel_handlers.push(callback); };

		return p;
	}

	public readonly then!: <TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined) => Future<TResult1 | TResult2>;
	public readonly catch!: <TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined) => Future<T | TResult>;
	public readonly finally!: (onfinally?: (() => void) | null | undefined) => Future<T>;
	public readonly onCanceled!: (callback: (reason?: any) => any) => void;

	public readonly cancel!: (reason?: any) => void;

	public readonly [Symbol.toStringTag]: string = "Future";
}

export namespace Future
{
	export class CancelException extends Error
	{
		public readonly reason?: any;

		public constructor(reason?: any)
		{
			super();
			this.name = "CancelException";

			switch (typeof reason)
			{
				case "string":
				case "number":
				case "bigint":
				case "boolean":
				case "symbol":
				case "undefined":
					this.message = JSON.stringify(reason);
				case "function":
					this.reason = reason;
				case "object":
					if (reason instanceof Error)
					{
						this.reason = reason;
					}
					else
					{
						try
						{
							this.message = JSON.stringify(reason);
						}
						catch (e)
						{
							this.reason = reason;
						}
					}
			}
		}
	}
}
