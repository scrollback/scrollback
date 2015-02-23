//http://www.browserstack.com/automate/node
var config = require("../config.js"),
	capabilities = config.selenium.capabilities;

capabilities.forEach(function(c) {
	c['browserstack.debug'] = config.selenium.debug;
	c['browserstack.user'] = config.selenium.username;
	c['browserstack.key'] = config.selenium.accessKey;
	var options = {};
	if (c.browserName) {
		options.id = c.browserName;
	} else {
		options.id = c.browser + " " + c.browser_version;
	}
	options.server = "http://" + config.server;
    options["jws-parent"] = "http://" + config["jws-parent"];
	config.selenium.tests.forEach(function(test) {
		require("./" + test)(c, options);
	});
});