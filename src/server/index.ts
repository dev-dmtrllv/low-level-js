import "./env";

import path from "path";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import bodyParser from "body-parser";
import session from "express-session";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.set("io", io);

// setting up middlewares for cors, sessions, cookies, body parsers etc...
if (env.isDev)
	app.use(cors({ credentials: true, origin: true }));

app.use((req, _res, next) => 
{
	console.log(`[${req.method}] ${req.originalUrl}`);
	next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(session({
	secret: process.env.SESSION_SECRET || "dev-env",
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		sameSite: env.isDev ? "lax" : "strict",
		secure: !env.isDev
	},
}));

app.use((_, res, next) => 
{
	res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
	next();
})

app.use(express.static(path.resolve(__dirname, "public")));

const indexHTML = path.resolve(__dirname, "public", "index.html");

app.get("*", (_, res) => res.sendFile(indexHTML));

const { PORT } = process.env;

server.listen(Number(PORT), async () => console.log(`\nServer listening on http${env.isDev ? "" : "s"}://localhost:${PORT}`));
