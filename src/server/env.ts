import dotenv from "dotenv";
import path from "path";

if (env.isDev)
	dotenv.config({
		path: path.resolve(__dirname, ".env")
	});
