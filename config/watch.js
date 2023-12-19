const { writeFileSync } = require("fs");
const webpack = require("webpack");
const { fork } = require("child_process");

const { createServer } = require("http");
const { Server } = require("socket.io");

const CopyPlugin = require("copy-webpack-plugin");

const httpServer = createServer();
const io = new Server(httpServer, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	}
});

httpServer.listen(3002);

const paths = require("./paths");

let isServerStarting = false;

let serverProc = null;

let watchers = [];

const wait = (ms) => new Promise(res => setTimeout(res, ms));

const killServer = () => new Promise(async (res) => 
{
	if (serverProc)
	{
		console.log("\nKilling server...");
		serverProc.on("exit", res);
		try { serverProc.kill(); } catch { }
		serverProc = null;
	}
	else
	{
		res();
	}
});

const startServer = async () =>
{
	if (isServerStarting)
		return;

	isServerStarting = true;
	await killServer();

	console.log("\nStarting server...");
	serverProc = fork(paths.resolve("dist/main.bundle.js"), { stdio: "inherit", cwd: paths.dist.server, env: { ...process.env, NODE_ENV: "development" } });

	serverProc.setMaxListeners(30);

	serverProc.on("exit", () =>
	{
		serverProc = null;
	});

	isServerStarting = false;
}

const watch = async () =>
{
	try
	{
		const handler = (cb = () => { }) => (err, stats) => 
		{
			if (err)
				console.error(err);

			if (stats)
				console.log(stats.toString("minimal"));

			cb();
		}

		const serverConfig = require("./server-config");

		serverConfig.plugins.push(new CopyPlugin({
			patterns: [
				{
					from: paths.resolve(__dirname, "..", ".env"),
					to: paths.resolve(__dirname, "..", "dist"),
				}
			],
		}));

		const serverCompiler = webpack(require("./server-config"))

		serverCompiler.hooks.watchRun.tapAsync("kill-server", async (compilation, callback) => 
		{
			await killServer();
			await wait(750);
			callback();
		});

		watchers = [
			webpack(require("./app-config")).watch({}, handler(() => io.emit("reload-client"))),
			serverCompiler.watch({}, handler(startServer))
		];
	}
	catch (e)
	{
		console.log(e.message);
		writeFileSync(paths.resolve("watch-error.json"), JSON.stringify(e.message, null, 4), "utf-8");
	}
}



console.clear();

const rl = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout
});

const restart = () => watchers.forEach(w => w.invalidate());

rl.on("line", async (line) => 
{
	switch (line)
	{
		case "r":
		case "restart":
			return restart();
		case "cls":
		case "clear":
			return console.clear();
	}
});

rl.on("SIGINT", async () =>
{
	console.log("Waiting for shutdown...");
	rl.close();
	await killServer();
	process.exit();
});

process.on("SIGINT", async () =>
{
	console.log("Waiting for shutdown...");
	rl.close();
	await killServer();
	process.exit();
});

watch();
