declare global
{
	const env: {
		readonly isDev: boolean;
		readonly isServer: boolean;
		readonly isMain: boolean;
		readonly isApp: boolean;
	};

	type Immutable<T> =
		T extends Array<infer Item> ? ReadonlyArray<Item> :
		T extends {} ? { readonly [K in keyof T]: Immutable<T[K]> } :
		Readonly<T>;

	type HtmlProps<T extends HTMLElement, P extends {}> = Omit<React.HtmlHTMLAttributes<T> & P, `aria-${string}`>;

	type Split<T> = {
		[K in keyof T]:
		Pick<T, K> &
		Partial<
			Record<
				Exclude<keyof T, K>,
				never
			>
		>;
	}[keyof T];
}

export { };
