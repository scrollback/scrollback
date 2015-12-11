const path = require("path");
const config = require("./webpack-common.config");

module.exports = Object.assign({}, config, {
	entry: [
		"./widget/sdk/v2"
	],
	output: {
		path: path.resolve(__dirname, "public/s/"),
		publicPath: "/public/",
		filename: "sb.js",
		sourceMapFilename: "sb.js.map"
	}
});
