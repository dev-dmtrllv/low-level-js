declare global
{
	namespace NodeJS
	{
		interface ProcessEnv
		{
			NODE_ENV: "development" | "production";
			PORT: string;
			HOST: string;
			DB_NAME: string;
			DB_HOST: string;
			DB_PORT: string;
			DB_USER: string;
			DB_PASS: string;
			SESSION_SECRET: string;
		}
	}
}

export { }
