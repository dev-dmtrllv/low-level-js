const webpack = require("webpack");
const { isDev } = require("./env");

module.exports = (target) => new webpack.DefinePlugin({
	env: JSON.stringify({
		isDev,
		[`is${target[0].toUpperCase() + target.substring(1, target.length)}`]: true,
	})
});
