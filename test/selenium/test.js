//http://www.browserstack.com/automate/node 
//npm install -g browserstack-webdriver
var config = require("../config.js");
var capabilities = config.selenium.capabilities;

capabilities.forEach(function(c) {
	c['browserstack.debug'] = config.selenium.debug;
	c['browserstack.user'] =  config.selenium.username;
	c['browserstack.key'] = config.selenium.accessKey;
	var id = "";
	var options = {};
	if (c.browserName) {
		options.id = c.browserName;
	} else {
		options.id = c.browser + " " + c.browser_version;
	}
	require("./chat-area-test.js")(c, options);
	require("./meta-area-test.js")(c, options);
});
