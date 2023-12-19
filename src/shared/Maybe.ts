export class Maybe<T = never>
{
	#_data: T | Maybe.Empty;

	public get isNone() { return this.#_data === Maybe.EMPTY; }
	public get isSome() { return this.#_data !== Maybe.EMPTY; }

	public constructor(data: T | Maybe.Empty = Maybe.EMPTY)
	{
		this.#_data = data;
	}

	public readonly get = (): T =>
	{
		if(this.isNone)
			throw new Error(`Maybe is empty!`);
		return this.#_data as T;
	}

	public readonly swap = (data: T): T =>
	{
		if(this.isNone)
			throw new Error(`Maybe is empty!`);
		const d = this.#_data;
		this.#_data = data;
		return d as T;
	}

	public readonly reset = (data: T | Maybe.Empty = Maybe.EMPTY) => this.#_data = data;

	public readonly set = (data: T): T => 
	{
		if(!this.isNone)
			throw new Error(`Maybe is already set!`);
		this.#_data = data;
		return data;
	}

	public readonly getOr = (defaultValue: T): T =>
	{
		if(this.isNone)
			return defaultValue;
		return this.#_data as T;
	}

	public readonly getOrSet = (callback: () => T): T =>
	{
		if(this.isNone)
			this.#_data = callback();
		return this.#_data as T;
	}

	public readonly getOrElse = (callback: () => T): T =>
	{
		if(this.isNone)
			this.#_data = callback();
		return this.#_data as T;
	}

	public readonly ifSome = (callback: (value: T) => void) =>
	{
		if(this.isSome)
			callback(this.get());
		return this;
	}

	public readonly ifNone = <T>(callback: () => T): T | undefined =>
	{
		if(this.isNone)
			return callback();
		return undefined;
	}
}

export namespace Maybe
{
	export const EMPTY = Symbol("Maybe.EMPTY");

	export type Empty = typeof EMPTY;
}
