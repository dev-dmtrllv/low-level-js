export class Lazy<T>
{
	private getter_: () => T;

	public readonly get = () => this.getter_();

	public constructor(initializer: () => T)
	{
		this.getter_ = () =>
		{
			const data = initializer();
			this.getter_ = () => data;
			return data;
		};
	}
}
