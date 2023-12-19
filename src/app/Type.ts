import { Ptr } from "./Ptr";
import { Struct } from "./Struct";

export const primitives = {
	Uint8: 1,
	Uint16: 2,
	Uint32: 4,
	BigUint64: 8,
	Int8: 1,
	Int16: 2,
	Int32: 4,
	BigInt64: 8,
	Float32: 4,
	Float64: 8,
	Pointer: 4
} as const;

export type PrimitiveType = keyof typeof primitives;

export type Type<Primitive extends PrimitiveType, T> = {
	readonly typeName: Primitive;
	readonly size: number;
	readonly read: Reader<T>;
	readonly write: Writer<T>;
	readonly index: number;
	readonly default: number;
};

export type Reader<T> = (view: DataView, offset: number) => T;
export type Writer<T> = (view: DataView, value: T, offset: number) => void;

export type Fields = {
	[name: string]: Type<any, any>;
};

export namespace Type
{
	let indexCounter = 0;

	const registeredTypes: (Type<any, any> | Struct<any>)[] = [];

	export const getNextIndex = () => 
	{
		return indexCounter++;
	};

	export const registerType = (t: Type<any, any> | Struct<any>) => 
	{
		registeredTypes[t.index] = t;
	}

	export const getType = (index: number) =>
	{
		const t = registeredTypes[index];
		if(!t)
			throw new Error(`No type registered at index ${index}!`);
		return t;
	};

	export const isPrimitive = (obj: any): obj is Type<any, any> => "typeName" in obj;

	export const create = <T extends PrimitiveType, Instance>(type: T, read: Reader<Instance>, write: Writer<Instance>): Type<T, Instance> => 
	{
		const t = {
			typeName: type,
			size: primitives[type],
			read,
			write,
			index: getNextIndex(),
			default: 0
		};

		registerType(t);

		return t;
	};

	export type Instance<T extends Type<any, any> | Struct<any>> = T extends Struct<infer Fields> ? {
		[K in keyof Fields]: Fields[K] extends Type<any, infer R> ? R : Fields[K] extends Struct<any> ? Instance<Fields[K]> : never;
	} : T extends Type<any, infer R> ? R : never;
};

export const i8 = Type.create("Int8", (view, offset) => view.getInt8(offset), (view, value, offset) => view.setInt8(offset, value));
export const i16 = Type.create("Int16", (view, offset) => view.getInt16(offset), (view, value, offset) => view.setInt16(offset, value));
export const i32 = Type.create("Int32", (view, offset) => view.getInt32(offset), (view, value, offset) => view.setInt32(offset, value));
export const i64 = Type.create("BigInt64", (view, offset) => view.getBigInt64(offset), (view, value, offset) => view.setBigInt64(offset, value));

export const u8 = Type.create("Uint8", (view, offset) => view.getUint8(offset), (view, value, offset) => view.setUint8(offset, value));
export const u16 = Type.create("Uint16", (view, offset) => view.getUint16(offset), (view, value, offset) => view.setUint16(offset, value));
export const u32 = Type.create("Uint32", (view, offset) => view.getUint32(offset), (view, value, offset) => view.setUint32(offset, value));
export const u64 = Type.create("BigUint64", (view, offset) => view.getBigUint64(offset), (view, value, offset) => view.setBigUint64(offset, value));

export const f32 = Type.create("Float32", (view, offset) => view.getFloat32(offset), (view, value, offset) => view.setFloat32(offset, value));
export const f64 = Type.create("Float64", (view, offset) => view.getFloat64(offset), (view, value, offset) => view.setFloat64(offset, value));

export const bool = Type.create("Uint8", (view, offset) => view.getUint8(offset), (view, value, offset) => view.setUint8(offset, value));

export const pointer = <T extends Type<any, any> | Struct<any>>(type: T): Type<"Pointer", Ptr<T>> => 
{
	return {
		typeName: "Pointer",
		size: primitives["Pointer"],
		read: (view, offset) => Ptr.create(view.getUint32(offset), type),
		write: (view, value, offset) => view.setUint32(offset, value),
		index: type.index,
		default: 0
	};
};
