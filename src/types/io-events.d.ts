declare global
{
	interface ServerEvents
	{
		noArg: () => void;
		basicEmit: (a: number, b: string, c: Buffer) => void;
		withAck: (d: string, callback: (e: number) => void) => void;
	}

	interface ClientEvents
	{
		hello: () => void;
	}

	interface InterServerEvents
	{
		ping: () => void;
	}

	interface SocketData
	{
		
	}
}

export {}
