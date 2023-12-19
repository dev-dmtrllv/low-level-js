import "./client-reloader";

import { alloc, free } from "./Allocator";
import { Struct } from "./Struct";
import { i8, pointer } from "./Type";
import { Thread } from "./Thread";

const Vector = Struct.create({
	x: i8,
	y: i8
});

const Test = pointer(Vector);

const vectorA = alloc(Vector, {
	x: 1,
	y: 2,
});

const vectorB = alloc(Vector, {
	x: 10,
	y: 22,
});

const testA = alloc(Test, vectorA);
const testB = alloc(Test, vectorB);

// const thread = new Thread((worker) => 
// {
// 	console.log("hi from worker!");
// 	worker.postMessage(["hello", 1, 2, 3]);
// });

// thread.onMessage((msg, data) => 
// {
// 	console.log(msg, data);
// })
