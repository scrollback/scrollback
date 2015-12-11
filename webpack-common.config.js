const __DEV__ = typeof global.__DEV__ === "boolean" ? global.__DEV__ : process.env.NODE_ENV !== "production";

const webpack = require("webpack");

module.exports = {
	devtool: "source-map",
	plugins: __DEV__ ? [ new webpack.HotModuleReplacementPlugin() ] : [ new webpack.optimize.UglifyJsPlugin() ],
	module: {
		preLoaders: [
			{
				test: /\.js$/,
				loaders: [ "eslint-loader" ],
				exclude: /node_modules/
			}
		],
		loaders: [
			{
				test: /\.js$/,
				loaders: __DEV__ ? [ "react-hot", "babel" ] : [ "babel" ],
				exclude: /node_modules/
			},
			{
				test: /\.json$/,
				loader: "json"
			}
		]
	},
	eslint: {
		quiet: true
	}
};
