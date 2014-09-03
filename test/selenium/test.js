//http://www.browserstack.com/automate/node 
//npm install -g browserstack-webdriver
var config = require("../config.js");
var capabilities = [
	{
		'browserName' : 'iPhone',
		'platform' : 'MAC',
		'device' : 'iPhone 5'
	}, {
		'browserName' : 'android',
		'platform' : 'ANDROID',
		'device' : 'LG Nexus 4'
	},{
		'browser' : 'Safari',
		'browser_version' : '7.0',
		'os' : 'OS X',
		'os_version' : 'Mavericks',
		'resolution' : '1024x768'
	}, {
		'browser' : 'IE',
		'browser_version' : '10.0',
		'os' : 'Windows',
		'os_version' : '8',
		'resolution' : '1280x1024'
	}, {
		'browser' : 'IE',
		'browser_version' : '11.0',
		'os' : 'Windows',
		'os_version' : '8.1',
		'resolution' : '1366x768'
	}, {
		'browser' : 'Chrome',
		'browser_version' : '36.0',
		'os' : 'Windows',
		'os_version' : '8.1',
		'resolution' : '1366x768'
	}, {
		'browser' : 'Firefox',
		'browser_version' : '31.0',
		'os' : 'Windows',
		'os_version' : '8.1',
		'resolution' : '1366x768'
	}
];

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
