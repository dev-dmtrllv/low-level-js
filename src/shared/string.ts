export namespace string
{
	export const capitalize = (str: string) => str[0].toUpperCase() + str.substring(1, str.length);

	export const toSnakeCase = (str: string) => str.split("").map((c, i) => 
	{
		if (i === 0)
			return c;
		return c === c.toUpperCase() ? `_${c}` : c;
	}).join("").toLowerCase();

	export const toCamelCase = (str: string) => 
	{
		while(str[0] === "_")
			str = str.substring(1, str.length);
		return str.split("").map((c, i) => 
		{
			if (c === '_')
				return "";

			if (i === 0)
				return c.toLowerCase();

			if (str[i - 1] === '_')
				return c.toUpperCase();

			return c.toLowerCase();
		}).join("");
	}
}
