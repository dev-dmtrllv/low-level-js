import { Allocator } from "./Allocator";

export class Thread
{
	private static readonly threads: Thread[] = [];

	private readonly worker: Worker;

	public constructor(init: Thread.Init)
	{
		Thread.threads.push(this);
		this.worker = new Worker(new URL("./ThreadInit", import.meta.url));
		this.worker.postMessage(Allocator.heapBuffers);

		const blob = URL.createObjectURL(new Blob([init.toString()]));
	}

	public readonly onMessage = (handler: (message: string, ...data: any) => void) =>
	{
		this.worker.addEventListener("message", (e) => 
		{
			const [msg, ...data] = e.data;
			handler(msg, data);
		});
	}

}

export namespace Thread
{
	export type Init = (thread: WorkerGlobalScope & typeof globalThis) => void;
}
