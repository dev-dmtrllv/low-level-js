import { Ptr } from "./Ptr";
import { Reader, Type, Writer } from "./Type";

export type Struct<T extends Struct.Fields> = {
	readonly fields: Struct.FieldsWithOffset<T>;
	readonly size: number;
	readonly read: Reader<T>;
	readonly write: Writer<T>;
	readonly default: Type.Instance<Struct<T>>;
	readonly index: number;
};

export namespace Struct
{
	export type Fields = {
		readonly [name: string]: (Struct<any> | Type<any, any>)
	};

	export type FieldsWithOffset<T extends Struct.Fields> = {
		readonly [K in keyof T]: T[K] extends Struct<infer Fields> ? FieldsWithOffset<Fields> : (T[K] & { offset: number; });
	};

	export const isStruct = (obj: any): obj is Struct<any> => "fields" in obj;

	const calculateSize = (fields: Fields): number => 
	{
		let size = 0;
		for (const k in fields)
			size += fields[k].size as number;
		return size;
	};

	const compileReaderFields = (fields: Fields, offset: number): string => 
	{
		return Object.keys(fields).map(name => 
		{
			const field = fields[name];
			
			const o = offset;
			offset += field.size;

			if (isStruct(field))
				return `${name}: { ${compileReaderFields(field.fields, offset)} }`;

			if(Type.isPrimitive(field))
			{
				if(field.typeName === "Pointer")
					return `${name}: Pointer.createFromTypeIndex(view.getUint32(${o}), ${field.index})`;
				return `${name}: view.get${field.typeName}(${o})`;
			}

			throw new Error(`Could not compile field ${name}!`);
		}).join(", ");
	};

	const compileWriterFields = (target: string, fields: Fields, offset: number): string => 
	{
		return Object.keys(fields).map(name => 
		{
			const field = fields[name];

			const k = `${target}.${name}`;
			
			const o = offset;
			offset += field.size;

			if (isStruct(field))
				return compileWriterFields(k, field.fields, o);

			if(Type.isPrimitive(field))
			{
				const t = field.typeName === "Pointer" ? "Uint32" : field.typeName;
				return `view.set${t}(${o}, ${k})`;
			}

			throw new Error(`Could not compile field ${name}!`);
		}).join(";");
	};

	const compileReader = (fields: Fields) => 
	{
		const Pointer = Ptr;
		Pointer;
		let read = (_view: DataView, _offset: number) => {throw new Error("Struct.read not implemented!"); };
		eval(`read = (view, offset) => { return { ${compileReaderFields(fields, 0)} }; }`);
		return read;
	};

	const compileWriter = (fields: Fields) => 
	{
		let write = (_view: DataView, _value: any, _offset: number) => { throw new Error("Struct.write not implemented!") };
		eval(`write = (view, value, offset) => { ${compileWriterFields("value", fields, 0)} }`);
		return write;
	};

	const createDefaultData = (fields: Fields) => 
	{
		const obj: any = {};

		for(const k in fields)
		{
			const field = fields[k];
			if(isStruct(field))
				obj[k] = field.default;
			else
				obj[k] = 0;
		}

		return obj;
	};

	const withOffsets = <T extends Fields>(fields: T, offset: number): FieldsWithOffset<T> => 
	{
		for(const k in fields)
		{
			const obj = fields[k] as any;

			if(Type.isPrimitive(fields[k]))
			{
				obj.offset = offset;
				obj.offset += fields[k].size;
			}
			else
			{
				withOffsets(obj.fields, offset);
			}
		}

		return fields as FieldsWithOffset<T>;
	};

	export const create = <T extends Fields>(fields: T): Struct<T> => 
	{
		const t = {
			fields: withOffsets(fields, 0),
			size: calculateSize(fields),
			read: compileReader(fields),
			write: compileWriter(fields),
			default: createDefaultData(fields),
			index: Type.getNextIndex()
		};

		Type.registerType(t);

		return t;
	}
}
