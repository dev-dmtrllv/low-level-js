export const hashString = (str: string): number => [...str].reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0);

export const hash = (o: any): number => 
{
	switch (typeof o)
	{
		case "string":
			return hashString(o);
		case "number":
		case "bigint":
			return hashString(`${o}`);
		case "boolean":
			return hashString(o ? "true" : "false");
		case "undefined":
			return hashString("undefined");
		case "object":
			return hashString(JSON.stringify(o));
		case "symbol":
		case "function":
			return hashString(o.toString());
	}
}
