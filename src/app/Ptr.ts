import { Allocator } from "./Allocator";
import { Struct } from "./Struct";
import { Type } from "./Type";

export type Ptr<T extends Type<any, any> | Struct<any>> = number & {
	readonly deref: () => Type.Instance<T>;
	readonly type: T;
};

export const ptrToHex = (x: number): string => 
{
	let hex = x.toString(16);
	return `0x${new Array(8 - hex.length).fill(0).join("")}${hex}`;
};

export namespace Ptr
{
	export const getDataView = (ptr: number, size: number) => 
	{
		const index = (ptr / Allocator.PAGE_SIZE) >> 0;
		const offset = ptr % Allocator.PAGE_SIZE;
		const buffer = Allocator.heapBuffers[index]!;
		return new DataView(buffer, offset, size);
	};

	export const createFromTypeIndex = (ptr: number, index: number) => create(ptr, Type.getType(index));

	export const create = <T extends Type<any, any> | Struct<any>>(ptr: number, type: T): Ptr<T> => 
	{
		const deref = () => type.read(getDataView(ptr, type.size), 0);

		const toString = () => ptrToHex(ptr);

		return new Proxy({ ptr }, {
			get(target, prop, _receiver)
			{
				if (prop === "deref")
					return deref;

				if(prop === "toString")
					return toString;

				if(prop === "type")
					return type;

				const prim = Reflect.get(target, 'ptr');
				const value = prim[prop as keyof typeof prim];
				return typeof value === 'function' ? value.bind(prim) : value;
			},
			set(target, p, newValue, receiver)
			{
				console.log(target, p, newValue, receiver);
				return true;
			}
		}) as any;
	};
}

export const nullptr = 0;
