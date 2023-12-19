import { Allocator } from "./Allocator";

self.addEventListener("message", (e: MessageEvent) => 
{
	Allocator.initWorker(e.data);
	console.log(e.data[0])
});
