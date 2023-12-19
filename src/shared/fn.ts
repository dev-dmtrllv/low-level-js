export namespace fn
{
	export const exec = <R, Args extends any[]>(callback: (...args: Args) => R, ...args: Args): R => callback(...args);

	const emptyAsyncFunction = async () => {};

	const AsyncFunction: typeof emptyAsyncFunction = (async () => {}).constructor as typeof emptyAsyncFunction;

	export const isAsync = (fn: Function): fn is typeof AsyncFunction => fn.constructor === AsyncFunction;

	const getName = (fn: Function) => `${isAsync(fn) ? "async " : ""}${(fn.name || "anonymous")}`;

	export const log = <R, Args extends any[]>(fn: (...args: Args) => R) => (...args: Args): R =>
	{
		const result = fn(...args);
		console.log(getName(fn));
		return result;
	};

	export const logAsync = <R, Args extends any[]>(fn: (...args: Args) => Promise<R>) => async (...args: Args): Promise<R> =>
	{
		const result = await fn(...args);
		console.log(getName(fn), result);
		return result;
	};

	export const time = <R, Args extends any[]>(fn: (...args: Args) => R) => (...args: Args): R =>
	{
		const label = getName(fn);
		console.time(label);
		const result = fn(...args);
		console.timeEnd(label);
		return result;
	};

	export const timeAsync = <R, Args extends any[]>(fn: (...args: Args) => Promise<R>) => async (...args: Args): Promise<R> =>
	{
		const label = getName(fn);
		console.time(label);
		const result = await fn(...args);
		console.timeEnd(label);
		return result;
	};

	export const once = <R, Args extends any[]>(fn: (...args: Args) => R): ((...args: Args) => R) =>
	{
		return (...args: Args) => 
		{
			const returnValue = fn(...args);
			fn = () => { throw new Error(`FnOnce already called!`); }
			return returnValue;
		};
	};

	const match = (a: any[], b: any) =>
	{
		if (a.length !== b.length)
			return false;

		for (let i = 0; i < a.length; i++)
			if (a[i] !== b[i])
				return false;

		return true;
	};

	export const cached = <R, Args extends any[]>(fn: (...args: Args) => R): ((...args: Args) => R) =>
	{
		const originalFn = fn;

		return (...args: Args) => 
		{
			let returnValue = fn(...args);
			let cacheArgs = args;

			fn = (...args) => 
			{
				if (!match(cacheArgs, args))
				{
					cacheArgs = args;
					returnValue = originalFn(...args);
				}
				return returnValue;
			};

			return returnValue;
		};
	};

	export const getCallee = () =>
	{
		let data = {
			filename: "",
			column: 0,
			row: 0,
			name: ""
		};

		const _prepareStackTrace = Error.prepareStackTrace;

		Error.prepareStackTrace = (_, stack) =>
		{
			const s = stack[1];
			data = {
				filename: s.getFileName() || "",
				column: s.getColumnNumber() || -1,
				row: s.getLineNumber() || -1,
				name: s.getFunctionName() || ""
			};
		};

		const err = new Error();
		err.stack;

		Error.prepareStackTrace = _prepareStackTrace;

		return data;
	}
}
