export type VariantType = string | number | boolean | symbol | bigint | (new (...arg: any) => any);

export class Variant<T extends readonly VariantType[]>
{
	#_value: VariantInstanceType<VariantConstructorType<T>[number]>;

	public constructor(value: VariantInstanceType<VariantConstructorType<T>[number]>)
	{
		if (Array.isArray(value))
			throw new Error(`Variant cannot be used with arrays!`);
		else if (value?.constructor.name === "Object")
			throw new Error(`Variant cannot be used with plain objects!`);
		this.#_value = value;
	}

	public readonly get = <Type extends VariantConstructorType<T>[number]>(type: Type): VariantInstanceType<Type> =>
	{
		const valueName = this.#_value?.constructor.name;
		if (valueName !== type.name)
			throw new Error(`Variant[${valueName}] is not of type ${type.name}!`);
		return this.#_value as any;
	}

	public readonly set = (value: VariantInstanceType<VariantConstructorType<T>[number]>) =>
	{
		if (Array.isArray(value))
			throw new Error(`Variant cannot be used with arrays!`);
		this.#_value = value;
	}

	public readonly getYype = () => this.#_value?.constructor as VariantConstructorType<T>[number];

	public readonly is = (type: VariantConstructorType<T>[number]): boolean => this.#_value?.constructor === type;

	public readonly getOr = <Type extends VariantConstructorType<T>[number]>(type: Type, defaultValue: VariantInstanceType<Type>): VariantInstanceType<Type> =>
	{
		const valueName = this.#_value?.constructor.name;
		if (valueName !== type.name)
			return defaultValue;
		return this.#_value as any;
	}

	public readonly getOrElse = <Type extends VariantConstructorType<T>[number]>(type: Type, callback: () => VariantInstanceType<Type>): VariantInstanceType<Type> =>
	{
		const valueName = this.#_value?.constructor.name;
		if (valueName !== type.name)
			return callback();
		return this.#_value as any;
	}
}

type VariantConstructorType<T extends readonly any[]> = {
	[K in keyof T]:
	T[K] extends any[] ? never :
	T[K] extends number ? NumberConstructor :
	T[K] extends string ? StringConstructor :
	T[K] extends boolean ? BooleanConstructor :
	T[K] extends bigint ? BigIntConstructor :
	T[K] extends symbol ? SymbolConstructor :
	T[K] extends new (...args: any[]) => any ? T[K] : never;
};

type VariantInstanceType<T> =
	T extends NumberConstructor ? number :
	T extends StringConstructor ? string :
	T extends BooleanConstructor ? boolean :
	T extends BigIntConstructor ? bigint :
	T extends SymbolConstructor ? symbol :
	T extends new (...args: any[]) => infer Class ? Class : never;

type VariantInstances<T extends readonly any[]> = {
	[K in keyof T]: T[K] extends new (...args: any[]) => infer Class ? Class : T[K];
};

export type VariantTypes<T extends Variant<any>> = T extends Variant<infer Variants> ? VariantInstances<Variants>[number] : never;
