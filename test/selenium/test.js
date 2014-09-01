//http://www.browserstack.com/automate/node 
//npm install -g browserstack-webdriver
var capabilities = [
	{
		'browser' : 'Safari',
		'browser_version' : '7.0',
		'os' : 'OS X',
		'os_version' : 'Mavericks',
		'resolution' : '1024x768'
	}, {
		'browser' : 'IE',
		'browser_version' : '10.0',
		'os' : 'Windows',
		'os_version' : '7',
		'resolution' : '1024x768'
	}, {
		'browser' : 'Chrome',
		'browser_version' : '36.0',
		'os' : 'Windows',
		'os_version' : '7',
		'resolution' : '1024x768'
	}, {
		'browser' : 'Firefox',
		'browser_version' : '31.0',
		'os' : 'Windows',
		'os_version' : '7',
		'resolution' : '1024x768'
	}

];

capabilities.forEach(function(c) {

	require("./chat-area-test.js")(c);
	require("./meta-area-test.js")(c);
});
