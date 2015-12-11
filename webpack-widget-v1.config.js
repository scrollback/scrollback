const path = require("path");
const config = require("./webpack-common.config");

module.exports = Object.assign({}, config, {
	entry: [
		"./widget/sdk/v1"
	],
	output: {
		path: path.resolve(__dirname, "public/"),
		publicPath: "/public/",
		filename: "client.min.js",
		sourceMapFilename: "client.min.js.map"
	}
});
