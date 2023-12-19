export namespace error
{
	export type Type = Error & {
		name: string;
		message: string;
		stack?: string | string[];
	};

	export const unwrap = (error: Error): Type =>
	{
		return {
			name: error.name,
			stack: error.stack,
			message: error.message
		} as Type;
	}
}
