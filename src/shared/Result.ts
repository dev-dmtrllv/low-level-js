export class Result<T extends any, E extends any = Error>
{
	public static readonly Ok = <T, E = Error>(data: T) => new Result<T, E>(data, false);
	public static readonly Err = <T, E = Error>(error: E) => new Result<T, E>(error, true);

	#_value: T | E;
	#_is_error: boolean;

	public get is_err() { return this.#_is_error; }
	public get is_ok() { return !this.#_is_error; }
	
	private constructor(data: T | E, is_error: boolean)
	{
		this.#_value = data;
		this.#_is_error = is_error;
	}

	public readonly get = (): T | E => this.#_value;

	public readonly getOk = (): T =>
	{
		if(this.#_is_error)
			throw new Error(`Result contains an error!`, { cause: this.#_value });
		return this.#_value as T;
	}

	public readonly getErr = (): E =>
	{
		if(!this.#_is_error)
			throw new Error(`Result does not contains an error!`);
		return this.#_value as E;
	}

	public readonly getOkOr = (defaultValue: T): T =>
	{
		if(this.#_is_error)
			return defaultValue;
		return this.#_value as T;
	}

	public readonly getOkOrElse = (callback: () => T): T =>
	{
		if(this.#_is_error)
			return callback();
		return this.#_value as T;
	}

	public readonly ifOk = (callback: (value: T) => void) =>
	{
		if(this.is_ok)
			callback(this.#_value as T);
		return this;
	}

	public readonly ifErr = (callback: (value: E) => void) =>
	{
		if(this.is_err)
			callback(this.#_value as E);
		return this;
	}
}
