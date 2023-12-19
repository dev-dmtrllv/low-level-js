import { Maybe } from "./Maybe";

export namespace object
{
	export const forEach = <O extends object>(obj: O, callback: (key: keyof O, value: O[keyof O], index: number, object: O) => any) =>
	{
		let i = 0;
		for (const k in obj)
			callback(k, obj[k], i++, obj);
	}

	export const map = <From extends object, To extends Mapped<From>>(obj: From, callback: (key: keyof From, value: From[keyof From], index: number, object: From) => To[keyof From]): To =>
	{
		let i = 0;
		const mapped: any = {};
		for (const k in obj)
			mapped[k] = callback(k, obj[k], i++, obj);
		return mapped;
	}

	export const isClassInstance = (obj: any): boolean =>
	{
		if (typeof obj === "object")
			return obj.constructor !== Object && obj.constructor !== Array;
		return false;
	};

	export const isEmpty = (obj: object) =>
	{
		for (let _ in obj)
			return false;
		return true;
	}

	export const popFromMap = <K, V>(obj: Map<K, V>): Maybe<[K, V]> =>
	{
		for (const pair of obj)
		{
			obj.delete(pair[0]);
			return new Maybe(pair);
		}
		return new Maybe();
	}

	export const mergeDefaults = <T extends {}>(source: Partial<T>, defaults: T): Required<T> =>
	{
		for (const k in defaults)
		{
			if (!(k in source))
			{
				(source as any)[k] = defaults[k];
			}
			else if (typeof defaults[k] === "object")
			{
				mergeDefaults<any>((source as any)[k], defaults[k]);
			}
		}

		return source as Required<T>;
	};


	export const clone = <T extends object>(obj: T) =>
	{
		const clone = {} as any;
		for (const k in obj)
		{
			clone[k] = obj[k];
			if (typeof clone[k] === "function")
				clone[k] = clone[k].bind(clone);
		}
		return clone as T;
	};

	type Mapped<T extends object> = {
		[K in keyof T]: any
	};
}
