
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const paths = require("./paths");
const createDefines = require("./create-defines");
const { isDev } = require("./env");
const { resolve } = require("path");

module.exports = {
	entry: paths.src.appEntry,
	mode: isDev ? "development" : "production",
	devtool: isDev ? "inline-source-map" : undefined,
	output: {
		filename: "js/[name].bundle.js",
		chunkFilename: "js/[id].chunk.js",
		path: paths.dist.webApp,
	},
	resolve: {
		extensions: [".tsx", ".ts", ".jsx", ".js"],
		plugins: [
			new TsconfigPathsPlugin()
		],
		fallback: {
			path: require.resolve("path-browserify")
		}
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/i,
				use: "ts-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader",
					"sass-loader",
				],
			},
			{
				test: /\.(jpg|jpeg|png|gif|woff|eot|ttf|svg)$/i,
				type: "asset/resource"	  
			}
		]
	},
	plugins: [
		createDefines("app"),
		new MiniCssExtractPlugin({
			filename: "css/[name].bundle.css"
		}),
		new CopyPlugin({
			patterns: [
				{ from: paths.public, to: paths.dist.webApp },
			],
		}),
	],
	optimization: {
		runtimeChunk: "single",
		splitChunks: {
			cacheGroups: {
				default: {
					chunks: "async",
					priority: 10,
					reuseExistingChunk: true,
					enforce: true
				},
				commons: {
					name: "commons",
					chunks: "initial",
					minChunks: 2,
					priority: 0,
				},
				vendors: {
					test: /[\\/]node_modules[\\/]/,
					name: "vendors",
					chunks: "all",
					priority: 20
				}
			}
		}
	},
	experiments: {
		topLevelAwait: true
	}
};
