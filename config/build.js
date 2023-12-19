const { writeFileSync } = require("fs");
const webpack = require("webpack");

const paths = require("./paths");

const build = async () =>
{
	try
	{
		const handler = (err, stats) => 
		{
			if (err)
				console.error(err);

			if (stats)
				console.log(stats.toString("minimal"));
		};

		watchers = [
			webpack(require("./app-config"), handler),
			webpack(require("./server-config"), handler),
		];
	}
	catch (e)
	{
		console.log(e.message);
		writeFileSync(paths.resolve("watch-error.json"), JSON.stringify(e.message, null, 4), "utf-8");
	}
}

console.clear();

build();
