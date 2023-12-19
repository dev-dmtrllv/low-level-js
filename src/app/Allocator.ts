import { Type } from "./Type";
import { Struct } from "./Struct";
import { Ptr } from "./Ptr";

export namespace Allocator
{
	type FreeBlock = [number, number];

	export const PAGE_SIZE = 4096;

	export let heapBuffers: SharedArrayBuffer[] = [];

	let heapSize = 0;

	export const freeList: FreeBlock[] = [];

	export const allocBuffer = () => 
	{
		heapBuffers.push(new SharedArrayBuffer(PAGE_SIZE));
		
		const freeBlock: FreeBlock = [heapSize, PAGE_SIZE];
		heapSize += PAGE_SIZE;
		freeList.push(freeBlock);
		return freeBlock;
	};

	export const getFreeBlock = (size: number) => 
	{
		const found = freeList.find(s => size <= s[1]);
		if (!found)
			return allocBuffer();
		return found;
	};


	export function initWorker(buffers: SharedArrayBuffer[])
	{
		heapBuffers = buffers;
	}
}

export const alloc = <T extends Type<any, any> | Struct<any>>(type: T, data?: Type.Instance<T>): Ptr<T> => 
{
	const block = Allocator.getFreeBlock(type.size);

	const addr = block[0];

	block[1] -= type.size;

	if (block[1] === 0)
		Allocator.freeList.splice(Allocator.freeList.indexOf(block), 1);
	else
		block[0] += type.size;

	const view = Ptr.getDataView(addr, type.size);

	type.write(view, data || type, 0);

	return Ptr.create(addr, type);
};

export const free = <T extends Type<any, any> | Struct<any>>(ptr: Ptr<T>) => 
{
	const s = ptr.type.size;
	const address = Number(ptr);
	const mergeStartBlock = Allocator.freeList.find(f => (f[0] + f[1]) === address);
	const mergeEndBlock = Allocator.freeList.find(f => f[0] === (address + s));

	if (mergeStartBlock)
	{
		mergeStartBlock[1] += s;

		if (mergeEndBlock)
		{
			mergeStartBlock[1] += mergeEndBlock[1];
			Allocator.freeList.splice(Allocator.freeList.indexOf(mergeEndBlock), 1);
		}

	}
	else if (mergeEndBlock)
	{
		mergeEndBlock[0] -= s;
		mergeEndBlock[1] += s;
	}
	else
	{
		Allocator.freeList.push([address, s]);
	}
};
